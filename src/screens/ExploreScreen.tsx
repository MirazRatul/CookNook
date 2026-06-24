import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleFavorite, setSelectedRecipe, setSearchQuery, setSelectedCategory } from '../store/slices/recipesSlice';
import { SearchBar } from '../components/SearchBar';
import { CategoryBadge } from '../components/CategoryBadge';
import { RecipeCard } from '../components/RecipeCard';
import { CATEGORIES } from '../constants/mockData';
import { Ionicons } from '@expo/vector-icons';

interface ExploreScreenProps {
  onNavigate: (screen: string) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const { recipes, favorites, searchQuery, selectedCategory } = useSelector(
    (state: RootState) => state.recipes
  );

  // Filter recipes based on category and search query
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleRecipePress = (recipe: any) => {
    dispatch(setSelectedRecipe(recipe));
    onNavigate('Details');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header Container */}
      <View className="px-6 pt-6 pb-2 border-b border-gray-100 bg-white">
        <Text className="text-2xl font-black text-gray-900 mb-4">Explore Recipes</Text>
        
        <SearchBar
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          placeholder="Search recipes, ingredients..."
        />

        {/* Categories Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 mb-2"
          contentContainerStyle={{ paddingBottom: 8 }}
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

      {/* Grid List */}
      <View className="flex-1 bg-gray-50/50">
        {filteredRecipes.length > 0 ? (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                isFavorite={favorites.includes(item.id)}
                onPress={() => handleRecipePress(item)}
                onToggleFavorite={() => dispatch(toggleFavorite(item.id))}
                horizontal
              />
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="search-outline" size={64} color="#9ca3af" className="opacity-40" />
            <Text className="text-gray-900 font-extrabold text-lg mt-4">No results found</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center max-w-[240px]">
              We couldn't find any recipes matching "{searchQuery}" in category "{selectedCategory}"
            </Text>
            <TouchableOpacity
              onPress={() => {
                dispatch(setSearchQuery(''));
                dispatch(setSelectedCategory('All'));
              }}
              className="mt-6 bg-primary-500 px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-bold text-sm">Reset Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
