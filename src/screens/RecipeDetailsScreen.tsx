import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
} from "react-native-reanimated";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { toggleFavorite, updateRecipeVideoUrl } from "../store/slices/recipesSlice";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { RootStackScreenProps } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { HeartButton } from "../components/HeartButton";
import { Colors } from "../constants/Colors";
import { MediaModal } from "../components/MediaModal";
import { VideoRecipeModal } from "../components/video/VideoRecipeModal";
import { useVideoPlayer, VideoView } from 'expo-video';
import { getRecipeByIdAPI } from "../services/recipeService";

type RecipeDetailsScreenProps = RootStackScreenProps<"RecipeDetails">;

export const RecipeDetailsScreen: React.FC<RecipeDetailsScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const selectedRecipe = useSelector(
    (state: RootState) => state.recipes.selectedRecipe,
  );
  const favorites = useSelector((state: RootState) => state.recipes.favorites);

  const [activeTab, setActiveTab] = useState<"ingredients" | "instructions">(
    "ingredients",
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  // Start polling backend if the video is still processing
  useEffect(() => {
    const isProcessing = selectedRecipe?.videoUrl?.startsWith('processing');
    if (!selectedRecipe || !isProcessing) return;

    const intervalId = setInterval(async () => {
      try {
        console.log(`🔄 Polling backend for recipe ID: ${selectedRecipe.id} video processing status...`);
        const response = await getRecipeByIdAPI(selectedRecipe.id);
        if (response.success && response.data && response.data.video_url) {
          if (response.data.video_url !== selectedRecipe.videoUrl) {
            console.log(`✅ Syncing Video URL/Status to store: ${response.data.video_url}`);
            dispatch(updateRecipeVideoUrl({
              recipeId: selectedRecipe.id,
              videoUrl: response.data.video_url
            }));
          }
        }
      } catch (err) {
        console.error('❌ Error during recipe video polling:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [selectedRecipe?.id, selectedRecipe?.videoUrl, dispatch]);

  const previewPlayer = useVideoPlayer(
    selectedRecipe?.videoUrl && !selectedRecipe.videoUrl.startsWith('processing')
      ? selectedRecipe.videoUrl
      : '',
    (p) => {
      p.muted = true;
      p.loop = false;
      p.pause(); // Ensure it stays paused as a static first frame preview
    }
  );

  if (!selectedRecipe) {
    return (
      <SafeAreaView
        className="flex-1 bg-white items-center justify-center p-6"
        edges={["top", "right", "bottom", "left"]}
      >
        <Text className="text-gray-500 font-bold text-lg text-center">
          {t('details.no_recipe_selected')}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 bg-primary-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">{t('details.go_back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isFav = favorites.includes(selectedRecipe.id);

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Banner Image / Multi-Image Carousel */}
        <Animated.View
          entering={FadeInLeft.delay(200).duration(1200)}
          style={{ height: layout.details.heroHeight, width: '100%', position: 'relative' }}
        >
          {/* Absolute Header Overlay (now scrolls with content) */}
          <View
            className="absolute left-0 right-0 z-10 px-6 flex-row items-center justify-between"
            style={{ top: insets.top + 12 }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2.5 rounded-full items-center justify-center"
              style={{
                backgroundColor: Colors.whiteOpacity,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.gray[800]} />
            </TouchableOpacity>

            <View
              className="p-2.5 rounded-full items-center justify-center"
              style={{
                backgroundColor: Colors.whiteOpacity,
              }}
            >
              <HeartButton
                isFavorite={isFav}
                onPress={() => dispatch(toggleFavorite(selectedRecipe.id))}
                size={22}
                colorActive={Colors.danger}
                colorInactive={Colors.gray[800]}
              />
            </View>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const slideSize = event.nativeEvent.layoutMeasurement.width;
              const offset = event.nativeEvent.contentOffset.x;
              const activeIndex = Math.floor((offset + slideSize / 2) / slideSize);
              setActiveImageIndex(activeIndex);
            }}
            scrollEventThrottle={16}
            style={{ width: '100%', height: '100%' }}
          >
            {((selectedRecipe.images && selectedRecipe.images.length > 0)
              ? selectedRecipe.images
              : [selectedRecipe.image]
            ).map((imgUri, index) => (
              <TouchableOpacity
                key={imgUri + index}
                activeOpacity={0.9}
                style={{ width: Dimensions.get('window').width, height: layout.details.heroHeight }}
                onPress={() => {
                  setSelectedImageIndex(index);
                  setIsMediaModalVisible(true);
                }}
              >
                <Image
                  source={{ uri: imgUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          {selectedRecipe.images && selectedRecipe.images.length > 1 && (
            <View 
              style={{
                position: 'absolute',
                bottom: 55,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {selectedRecipe.images.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: activeImageIndex === index ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: activeImageIndex === index ? Colors.primary[500] : 'rgba(255, 255, 255, 0.6)',
                  }}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* Content Container */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(1200)}
          className="bg-white rounded-t-[40px] -mt-10 px-6 pt-8"
          style={{
            paddingBottom: insets.bottom + 40,
            width: "100%",
            maxWidth: layout.details.contentMaxWidth,
            alignSelf: "center",
          }}
        >
          {/* Category & Title */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-black tracking-widest text-primary-600 bg-amber-50 px-3 py-1 rounded-full uppercase">
              {selectedRecipe.category}
            </Text>
            <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-full">
              <Ionicons name="star" size={14} color={Colors.primary[500]} />
              <Text className="text-xs font-bold text-gray-700 ml-1">
                {selectedRecipe.rating}
              </Text>
              <Text className="text-xs text-gray-400 ml-0.5">
                ({selectedRecipe.reviewsCount})
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-black text-gray-900 mt-3.5 leading-8">
            {selectedRecipe.title}
          </Text>

          {/* Chef Details */}
          <View className="flex-row items-center mt-4 pb-5 border-b border-gray-100">
            <Image
              source={{ uri: selectedRecipe.chefAvatar }}
              className="w-9 h-9 rounded-full bg-gray-100"
            />
            <View className="ml-3">
              <Text className="text-xs text-gray-400 font-semibold">
                {t('details.recipe_by')}
              </Text>
              <Text className="text-sm font-bold text-gray-800">
                {selectedRecipe.chefName}
              </Text>
            </View>
          </View>

          {/* Video Recipe Card (if video exists or is processing) */}
          {selectedRecipe.videoUrl && (
            <View className="mt-5 pb-5 border-b border-gray-100">
              <Text className="text-sm font-extrabold text-gray-800 mb-3">
                {t('details.video_recipe_label', 'Video Recipe Guide')}
              </Text>
              
              {selectedRecipe.videoUrl.startsWith('processing') ? (() => {
                const parts = selectedRecipe.videoUrl.split(':');
                const percent = parts.length > 1 ? parts[1] : '0';
                return (
                  <View
                    className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 items-center justify-center"
                    style={{ aspectRatio: 16 / 9, width: '100%' }}
                  >
                    <ActivityIndicator size="small" color="#f59e0b" />
                    <Text className="text-amber-800 font-semibold text-xs mt-3 text-center">
                      {t('details.video_processing', 'Guide video is processing on server...')} ({percent}%)
                    </Text>
                  </View>
                );
              })() : (
                <TouchableOpacity
                  onPress={() => setIsVideoVisible(true)}
                  activeOpacity={0.9}
                  style={{
                    width: '100%',
                    aspectRatio: 16 / 9,
                    borderRadius: 24,
                    backgroundColor: '#000',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Video thumbnail preview playing silently */}
                  <VideoView
                    player={previewPlayer}
                    style={{ width: '100%', height: '100%', opacity: 0.72 }}
                    nativeControls={false}
                    contentFit="cover"
                  />

                  {/* Dark overlay */}
                  <View style={{ ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.18)' }} />

                  {/* Custom Styled play button in the center */}
                  <View
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: [{ translateX: -28 }, { translateY: -28 }],
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: '#f59e0b', // Amber-500 matching app design
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: '#ffffff',
                    }}
                  >
                    <Ionicons name="play" size={28} color="#ffffff" style={{ marginLeft: 3 }} />
                  </View>

                  {/* Overlay Text info at bottom-left */}
                  <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                    <Text className="text-white font-extrabold text-sm">
                      {t('details.watch_video_guide', 'Watch Step-by-Step Video Guide')}
                    </Text>
                    <Text className="text-gray-200 text-xs mt-0.5 font-medium">
                      {selectedRecipe.duration} {t('details.mins_duration', 'mins cook time')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Recipe Meta Stats */}
          <View
            className="flex-row items-center justify-between border border-gray-100 rounded-3xl p-4 my-6"
            style={{ backgroundColor: Colors.bgLight70 }}
          >
            <View className="items-center flex-1">
              <View className="bg-amber-100 p-2.5 rounded-full mb-1.5">
                <Ionicons name="time-outline" size={18} color={Colors.primary[600]} />
              </View>
              <Text className="text-[10px] text-gray-400 font-semibold uppercase">
                {t('details.cook_time')}
              </Text>
              <Text className="text-sm font-black text-gray-800 mt-0.5">
                {selectedRecipe.duration}m
              </Text>
            </View>

            <View className="w-[1px] h-10 bg-gray-200" />

            <View className="items-center flex-1">
              <View className="bg-amber-100 p-2.5 rounded-full mb-1.5">
                <Ionicons name="bar-chart-outline" size={18} color={Colors.primary[600]} />
              </View>
              <Text className="text-[10px] text-gray-400 font-semibold uppercase">
                {t('details.difficulty')}
              </Text>
              <Text className="text-sm font-black text-gray-800 mt-0.5">
                {selectedRecipe.difficulty}
              </Text>
            </View>

            <View className="w-[1px] h-10 bg-gray-200" />

            <View className="items-center flex-1">
              <View className="bg-amber-100 p-2.5 rounded-full mb-1.5">
                <Ionicons name="flame-outline" size={18} color={Colors.primary[600]} />
              </View>
              <Text className="text-[10px] text-gray-400 font-semibold uppercase">
                {t('details.calories')}
              </Text>
              <Text className="text-sm font-black text-gray-800 mt-0.5">
                {selectedRecipe.calories} kcal
              </Text>
            </View>
          </View>

          {/* Short Description */}
          <Text className="text-gray-500 text-sm leading-6 mb-6">
            {selectedRecipe.description}
          </Text>

          {/* Segmented Control / Tab Switcher */}
          <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-6">
            <TouchableOpacity
              onPress={() => setActiveTab("ingredients")}
              activeOpacity={0.9}
              className={`flex-1 py-3 rounded-xl items-center ${
                activeTab === "ingredients" ? "bg-white" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  activeTab === "ingredients"
                    ? "text-gray-800"
                    : "text-gray-500"
                }`}
              >
                {t('details.ingredients')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("instructions")}
              activeOpacity={0.9}
              className={`flex-1 py-3 rounded-xl items-center ${
                activeTab === "instructions" ? "bg-white" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  activeTab === "instructions"
                    ? "text-gray-800"
                    : "text-gray-500"
                }`}
              >
                {t('details.instructions')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "ingredients" ? (
            <Animated.View
              key="ingredients-list"
              entering={FadeInDown.duration(600).springify()}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-black text-gray-800">
                  {t('details.ingredients_list')}
                </Text>
                <Text className="text-xs text-gray-400 font-semibold">
                  {t('details.items_count', { count: selectedRecipe.ingredients.length })}
                </Text>
              </View>

              {selectedRecipe.ingredients.map((ing, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center border border-gray-100 rounded-2xl p-4 mb-3"
                  style={{ backgroundColor: Colors.bgLight }}
                >
                  <View className="w-6 h-6 rounded-full bg-amber-50 items-center justify-center mr-3 border border-amber-100">
                    <Ionicons name="checkmark" size={14} color={Colors.primary[600]} />
                  </View>
                  <Text className="text-sm font-semibold text-gray-700 flex-1">
                    {ing}
                  </Text>
                </View>
              ))}
            </Animated.View>
          ) : (
            <Animated.View
              key="instructions-list"
              entering={FadeInDown.duration(600).springify()}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-black text-gray-800">
                  {t('details.cooking_steps')}
                </Text>
                <Text className="text-xs text-gray-400 font-semibold">
                  {t('details.steps_count', { count: selectedRecipe.instructions.length })}
                </Text>
              </View>

              {selectedRecipe.instructions.map((step, idx) => (
                <View key={idx} className="flex-row mb-6">
                  {/* Step number pillar */}
                  <View className="items-center mr-4">
                    <View
                      className="w-8 h-8 rounded-full bg-primary-500 items-center justify-center z-10"
                    >
                      <Text className="text-white text-xs font-black">
                        {idx + 1}
                      </Text>
                    </View>
                    {idx !== selectedRecipe.instructions.length - 1 && (
                      <View className="w-[1.5px] bg-amber-100 flex-1 mt-1" />
                    )}
                  </View>

                  {/* Step detail card */}
                  <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <Text className="text-sm leading-6 font-semibold text-gray-700">
                      {step}
                    </Text>
                  </View>
                </View>
              ))}
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Fullscreen Swipeable Media Modal */}
      <MediaModal
        visible={isMediaModalVisible}
        onClose={() => setIsMediaModalVisible(false)}
        images={
          (selectedRecipe.images && selectedRecipe.images.length > 0)
            ? selectedRecipe.images
            : [selectedRecipe.image]
        }
        initialIndex={selectedImageIndex}
      />

      {/* Fullscreen Video Player Modal */}
      {selectedRecipe.videoUrl && (
        <VideoRecipeModal
          visible={isVideoVisible}
          videoUrl={selectedRecipe.videoUrl}
          recipeTitle={selectedRecipe.title}
          onClose={() => setIsVideoVisible(false)}
        />
      )}
    </View>
  );
};
