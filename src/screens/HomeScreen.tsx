import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleFavorite, setSelectedCategory, setSelectedRecipe, setSearchQuery } from '../store/slices/recipesSlice';
import { SearchBar } from '../components/SearchBar';
import { CategoryBadge } from '../components/CategoryBadge';
import { RecipeCard } from '../components/RecipeCard';
import { CATEGORIES } from '../constants/mockData';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const { recipes, favorites, selectedCategory, searchQuery } = useSelector(
    (state: RootState) => state.recipes
  );

  // Filter recipes based on category
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    return matchesCategory;
  });

  const popularRecipes = [...recipes]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  const handleRecipePress = (recipe: any) => {
    dispatch(setSelectedRecipe(recipe));
    onNavigate('Details');
  };

  const handleSearchFocus = () => {
    onNavigate('Explore');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50/50" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-gray-400 text-sm font-semibold tracking-wide">HELLO, CHEF!</Text>
          <Text className="text-2xl font-extrabold text-gray-900 mt-0.5">What are we cooking?</Text>
        </View>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' }}
          className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
        />
      </View>

      {/* Fake SearchBar Container (Tapping redirects to Explore) */}
      <View className="px-6 my-4">
        <TouchableOpacity activeOpacity={0.9} onPress={handleSearchFocus}>
          <SearchBar
            value={searchQuery}
            onChangeText={(text) => {
              dispatch(setSearchQuery(text));
              onNavigate('Explore');
            }}
            placeholder="Search recipes, ingredients..."
          />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View className="my-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 8 }}
        >
          {CATEGORIES.map((cat) => (
            <CategoryBadge
              key={cat}
              name={cat}
              isSelected={selectedCategory === cat}
              onPress={() => dispatch(setSelectedCategory(cat))}
            />
          ))}
        </ScrollView>
      </View>

      {/* Popular Recipes */}
      <View className="mt-4">
        <View className="px-6 flex-row items-center justify-between mb-4">
          <Text className="text-xl font-black text-gray-800">Popular Recipes</Text>
          <TouchableOpacity onPress={() => onNavigate('Explore')} className="flex-row items-center">
            <Text className="text-primary-600 font-bold text-sm mr-0.5">See All</Text>
            <Ionicons name="chevron-forward" size={16} color="#d97706" />
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 24, paddingRight: 4, paddingBottom: 16 }}
        >
          {popularRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.includes(recipe.id)}
              onPress={() => handleRecipePress(recipe)}
              onToggleFavorite={() => dispatch(toggleFavorite(recipe.id))}
            />
          ))}
        </ScrollView>
      </View>

      {/* Chef Recommendations */}
      <View className="px-6 mt-4 pb-24">
        <Text className="text-xl font-black text-gray-800 mb-4">Chef Recommendations</Text>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.includes(recipe.id)}
              onPress={() => handleRecipePress(recipe)}
              onToggleFavorite={() => dispatch(toggleFavorite(recipe.id))}
              horizontal
            />
          ))
        ) : (
          <View className="bg-white rounded-3xl p-8 border border-gray-100 items-center justify-center">
            <Ionicons name="fast-food-outline" size={48} color="#d97706" className="opacity-40" />
            <Text className="text-gray-500 font-semibold mt-3 text-center">
              No recipes found in this category
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
