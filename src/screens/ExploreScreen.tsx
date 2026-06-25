import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp, LinearTransition } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleFavorite, setSelectedRecipe, setSearchQuery, setSelectedCategory } from '../store/slices/recipesSlice';
import { SearchBar } from '../components/SearchBar';
import { CategoryBadge } from '../components/CategoryBadge';
import { RecipeCard } from '../components/RecipeCard';
import { CATEGORIES, Recipe } from '../constants/mockData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { AppTabScreenProps } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type ExploreScreenProps = AppTabScreenProps<'Explore'>;

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
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

  const handleRecipePress = (recipe: Recipe) => {
    dispatch(setSelectedRecipe(recipe));
    navigation.navigate('RecipeDetails');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header Container */}
      <Animated.View
        entering={FadeInDown.duration(450).springify()}
        className="pt-2 pb-2 border-b border-gray-100 bg-white"
        style={{
          paddingHorizontal: layout.spacing.screen,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
          zIndex: 10,
        }}
      >
        <Text className="text-2xl font-black text-gray-900 mb-4">Explore Recipes</Text>
        
        <SearchBar
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          placeholder="Search recipes, ingredients..."
        />

        {/* Categories Carousel */}
        <Animated.View entering={FadeInRight.duration(500).delay(100).springify()}>
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
        </Animated.View>
      </Animated.View>

      {/* Grid List */}
      <View className="flex-1" style={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
        {filteredRecipes.length > 0 ? (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: layout.spacing.screen,
              paddingTop: 20,
              paddingBottom: insets.bottom + 104,
              width: '100%',
              maxWidth: layout.listMaxWidth,
              alignSelf: 'center',
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.delay(index * 60).duration(350).springify()}
                layout={LinearTransition.springify()}
              >
                <RecipeCard
                  recipe={item}
                  isFavorite={favorites.includes(item.id)}
                  onPress={() => handleRecipePress(item)}
                  onToggleFavorite={() => dispatch(toggleFavorite(item.id))}
                  horizontal
                />
              </Animated.View>
            )}
          />
        ) : (
          <Animated.View
            entering={FadeInUp.duration(300).springify()}
            className="flex-1 items-center justify-center p-8"
          >
            <Ionicons name="search-outline" size={64} color="#9ca3af" style={{ opacity: 0.4 }} />
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
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};
