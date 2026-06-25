import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp, LinearTransition } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
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
  const isFocused = useIsFocused();
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
      <Animated.View
        key={`header-${isFocused}`}
        entering={isFocused ? FadeInDown.duration(800).springify() : undefined}
        className="pt-2 pb-4 flex-row items-center justify-between"
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
      </Animated.View>

      {/* Fake SearchBar Container (Tapping redirects to Explore) */}
      <Animated.View
        key={`search-${isFocused}`}
        entering={isFocused ? FadeInDown.duration(800).delay(150).springify() : undefined}
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
      </Animated.View>

      {/* Categories */}
      <Animated.View
        key={`categories-${isFocused}`}
        entering={isFocused ? FadeInRight.duration(850).delay(250).springify() : undefined}
        className="my-2"
      >
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
      </Animated.View>

      {/* Popular Recipes */}
      <Animated.View
        key={`popular-${isFocused}`}
        entering={isFocused ? FadeInDown.duration(850).delay(350).springify() : undefined}
        className="mt-4"
      >
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
          {popularRecipes.map((recipe, index) => (
            <Animated.View
              key={`popular-card-${recipe.id}-${isFocused}`}
              entering={isFocused ? FadeInRight.delay(400 + index * 120).duration(600).springify() : undefined}
            >
              <RecipeCard
                recipe={recipe}
                isFavorite={favorites.includes(recipe.id)}
                onPress={() => handleRecipePress(recipe)}
                onToggleFavorite={() => dispatch(toggleFavorite(recipe.id))}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Chef Recommendations */}
      <Animated.View
        key={`recommendations-${isFocused}`}
        entering={isFocused ? FadeInDown.duration(850).delay(500).springify() : undefined}
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
          filteredRecipes.map((recipe, index) => (
            <Animated.View
              key={`recommend-card-${recipe.id}-${isFocused}`}
              entering={isFocused ? FadeInDown.delay(index * 120).duration(600).springify() : undefined}
              layout={LinearTransition.springify()}
            >
              <RecipeCard
                recipe={recipe}
                isFavorite={favorites.includes(recipe.id)}
                onPress={() => handleRecipePress(recipe)}
                onToggleFavorite={() => dispatch(toggleFavorite(recipe.id))}
                horizontal
              />
            </Animated.View>
          ))
        ) : (
          <Animated.View
            key={`recommend-empty-${isFocused}`}
            entering={isFocused ? FadeInUp.duration(500).springify() : undefined}
            className="bg-white rounded-3xl p-8 border border-gray-100 items-center justify-center"
          >
            <Ionicons name="fast-food-outline" size={48} color="#d97706" style={{ opacity: 0.4 }} />
            <Text className="text-gray-500 font-semibold mt-3 text-center">
              No recipes found in this category
            </Text>
          </Animated.View>
        )}
      </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
