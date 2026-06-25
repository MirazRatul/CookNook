import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, LinearTransition } from 'react-native-reanimated';
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RecipeCard } from "../components/RecipeCard";
import { Recipe } from "../constants/mockData";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { AppTabScreenProps } from "../navigation/types";
import { RootState } from "../store/store";
import {
  setSelectedRecipe,
  toggleFavorite,
} from "../store/slices/recipesSlice";

type FavoritesScreenProps = AppTabScreenProps<"Favorites">;

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const { recipes, favorites } = useSelector(
    (state: RootState) => state.recipes,
  );
  console.log(JSON.stringify(recipes, null, 2));
  console.log("Favorite: ", JSON.stringify(favorites, null, 2));

  const favoriteRecipes = recipes.filter((recipe) =>
    favorites.includes(recipe.id),
  );

  const handleRecipePress = (recipe: Recipe) => {
    dispatch(setSelectedRecipe(recipe));
    navigation.navigate("RecipeDetails");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <Animated.View
        entering={FadeInDown.duration(450).springify()}
        className="pt-2 pb-2 border-b border-gray-100"
        style={{
          paddingHorizontal: layout.spacing.screen,
          width: "100%",
          maxWidth: layout.contentMaxWidth,
          alignSelf: "center",
        }}
      >
        <Text className="text-2xl font-black text-gray-900 mb-2">
          My Favorites
        </Text>
      </Animated.View>
      <View className="flex-1" style={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
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
                key={recipe.id}
                entering={FadeInDown.delay(index * 60).duration(350).springify()}
                layout={LinearTransition.springify()}
              >
                <RecipeCard
                  recipe={recipe}
                  isFavorite={true}
                  onPress={() => handleRecipePress(recipe)}
                  onToggleFavorite={() => dispatch(toggleFavorite(recipe.id))}
                  horizontal
                />
              </Animated.View>
            ))}
          </ScrollView>
        ) : (
          <Animated.View
            entering={FadeInUp.duration(300).springify()}
            className="flex-1 items-center justify-center p-8"
          >
            <Ionicons
              name="heart-outline"
              size={64}
              color="#9ca3af"
              style={{ opacity: 0.4 }}
            />
            <Text className="text-gray-900 font-extrabold text-lg mt-4">
              No favorites yet
            </Text>
            <Text className="text-gray-400 text-sm mt-1 text-center max-w-[240px]">
              Tap the heart icon on any recipe to save it here for quick access
              later!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Explore")}
              className="mt-6 bg-primary-500 px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-bold text-sm">Find Recipes</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
