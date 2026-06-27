import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native";
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
import { toggleFavorite } from "../store/slices/recipesSlice";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { RootStackScreenProps } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { HeartButton } from "../components/HeartButton";
import { Colors } from "../constants/Colors";

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
      {/* Absolute Header Overlay */}
      <View
        className="absolute left-0 right-0 z-10 px-6 flex-row items-center justify-between"
        style={{ top: insets.top + 12 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2.5 rounded-full items-center justify-center"
          style={{
            backgroundColor: Colors.whiteOpacity,
            shadowColor: Colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3.5,
            elevation: 3,
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.gray[800]} />
        </TouchableOpacity>

        <View
          className="p-2.5 rounded-full items-center justify-center"
          style={{
            backgroundColor: Colors.whiteOpacity,
            shadowColor: Colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3.5,
            elevation: 3,
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

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Banner Image / Multi-Image Carousel */}
        <Animated.View
          entering={FadeInLeft.delay(200).duration(1200)}
          style={{ height: layout.details.heroHeight, width: '100%', position: 'relative' }}
        >
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
              <Image
                key={imgUri + index}
                source={{ uri: imgUri }}
                style={{ width: Dimensions.get('window').width, height: layout.details.heroHeight }}
                resizeMode="cover"
              />
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
              style={
                activeTab === "ingredients"
                  ? {
                      shadowColor: Colors.black,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  : undefined
              }
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
              style={
                activeTab === "instructions"
                  ? {
                      shadowColor: Colors.black,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  : undefined
              }
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
                      style={{
                        shadowColor: Colors.black,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 1,
                        elevation: 1,
                      }}
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
    </View>
  );
};
