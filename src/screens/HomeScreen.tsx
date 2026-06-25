import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleFavorite, setSelectedCategory, setSelectedRecipe, setSearchQuery } from '../store/slices/recipesSlice';
import { SearchBar } from '../components/SearchBar';
import { CategoryBadge } from '../components/CategoryBadge';
import { RecipeCard } from '../components/RecipeCard';
import { CATEGORIES, Recipe } from '../constants/mockData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { AppTabScreenProps } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenProps = AppTabScreenProps<'Home'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
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

  const handleRecipePress = (recipe: Recipe) => {
    dispatch(setSelectedRecipe(recipe));
    navigation.navigate('RecipeDetails');
  };

  const handleSearchFocus = () => {
    navigation.navigate('Explore');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }} edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        className="pt-6 pb-4 flex-row items-center justify-between"
        style={{
          paddingHorizontal: layout.spacing.screen,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
        }}
      >
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
      <View
        className="my-4"
        style={{
          paddingHorizontal: layout.spacing.screen,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
        }}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={handleSearchFocus}>
          <SearchBar
            value={searchQuery}
            onChangeText={(text) => {
              dispatch(setSearchQuery(text));
              navigation.navigate('Explore');
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
          contentContainerStyle={{
            paddingHorizontal: layout.spacing.screen,
            paddingVertical: 8,
          }}
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
        <View
          className="flex-row items-center justify-between mb-4"
          style={{
            paddingHorizontal: layout.spacing.screen,
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
          }}
        >
          <Text className="text-xl font-black text-gray-800">Popular Recipes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')} className="flex-row items-center">
            <Text className="text-primary-600 font-bold text-sm mr-0.5">See All</Text>
            <Ionicons name="chevron-forward" size={16} color="#d97706" />
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: layout.spacing.screen,
            paddingRight: 4,
            paddingBottom: 16,
          }}
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
      <View
        className="mt-4"
        style={{
          paddingHorizontal: layout.spacing.screen,
          paddingBottom: insets.bottom + 104,
          width: '100%',
          maxWidth: layout.listMaxWidth,
          alignSelf: 'center',
        }}
      >
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
            <Ionicons name="fast-food-outline" size={48} color="#d97706" style={{ opacity: 0.4 }} />
            <Text className="text-gray-500 font-semibold mt-3 text-center">
              No recipes found in this category
            </Text>
          </View>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};
