import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, LinearTransition } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useDispatch, useSelector } from "react-redux";
import { RecipeCard } from "../components/RecipeCard";
import { Recipe } from "../constants/mockData";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { AppTabScreenProps } from "../navigation/types";
import { RootState } from "../store/store";
import { setSelectedRecipe } from "../store/slices/recipesSlice";
import { toggleFavorite } from "../store/slices/favoritesSlice";
import { toggleLike } from "../store/slices/likesSlice";

type FavoritesScreenProps = AppTabScreenProps<"Favorites">;

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const isFocused = useIsFocused();
  const { recipes, userRecipes, uploadStatus } = useSelector(
    (state: RootState) => state.recipes,
  );
  const favorites = useSelector((state: RootState) => state.favorites.favorites);
  const likedRecipeIds = useSelector((state: RootState) => state.likes.likedRecipeIds);

  const allRecipes = [...recipes, ...userRecipes];
  const uniqueRecipes = allRecipes.filter(
    (recipe, index, self) => self.findIndex((r) => r.id === recipe.id) === index
  );
  const favoriteRecipes = uniqueRecipes.filter((recipe) =>
    favorites.includes(recipe.id),
  );

  const handleRecipePress = (recipe: Recipe) => {
    dispatch(setSelectedRecipe(recipe));
    navigation.navigate("RecipeDetails");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={uploadStatus.isUploading ? ["left", "right"] : ["top", "left", "right"]}>
      <Animated.View
        key={`favorites-header-${isFocused}`}
        entering={isFocused ? FadeInDown.duration(800).springify() : undefined}
        className="pt-2 pb-2 border-b border-gray-100"
        style={{
          paddingHorizontal: layout.spacing.screen,
          width: "100%",
          maxWidth: layout.contentMaxWidth,
          alignSelf: "center",
        }}
      >
        <Text className="text-2xl font-black text-gray-900 mb-2">
          {t('favorites.my_favorites')}
        </Text>
      </Animated.View>
      <View className="flex-1" style={{ backgroundColor: Colors.bgLight }}>
        {favoriteRecipes.length > 0 ? (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: layout.spacing.screen,
              paddingTop: 20,
              paddingBottom: insets.bottom + 104,
              width: "100%",
              maxWidth: layout.listMaxWidth,
              alignSelf: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            {favoriteRecipes.map((recipe, index) => (
              <Animated.View
                key={`fav-card-${recipe.id}-${index}-${isFocused}`}
                entering={isFocused ? FadeInDown.delay(index * 100).duration(600).springify() : undefined}
                layout={LinearTransition.springify()}
              >
                <RecipeCard
                  recipe={recipe}
                  isFavorite={true}
                  isLiked={likedRecipeIds.includes(recipe.id)}
                  onPress={() => handleRecipePress(recipe)}
                  onToggleFavorite={() => dispatch(toggleFavorite(recipe.id))}
                  onToggleLike={() => dispatch(toggleLike(recipe.id))}
                  horizontal
                />
              </Animated.View>
            ))}
          </ScrollView>
        ) : (
          <Animated.View
            key={`fav-empty-${isFocused}`}
            entering={isFocused ? FadeInUp.duration(500).springify() : undefined}
            className="flex-1 items-center justify-center p-8"
          >
            <Ionicons
              name="heart-outline"
              size={64}
              color={Colors.gray[400]}
              style={{ opacity: 0.4 }}
            />
            <Text className="text-gray-900 font-extrabold text-lg mt-4">
              {t('favorites.no_favorites')}
            </Text>
            <Text className="text-gray-400 text-sm mt-1 text-center max-w-[240px]">
              {t('favorites.no_favorites_desc')}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Explore")}
              className="mt-6 bg-primary-500 px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-bold text-sm">{t('favorites.find_recipes')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
