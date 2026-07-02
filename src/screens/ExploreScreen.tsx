import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp, LinearTransition } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleFavorite, toggleLike, setSelectedRecipe, setSearchQuery, setSelectedCategory } from '../store/slices/recipesSlice';
import { getAllRecipesAPI } from '../services/recipeService';
import { SearchBar } from '../components/SearchBar';
import { CategoryBadge } from '../components/CategoryBadge';
import { RecipeCard } from '../components/RecipeCard';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { CATEGORIES, Recipe } from '../constants/mockData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { AppTabScreenProps } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

type ExploreScreenProps = AppTabScreenProps<'Explore'>;
const EXPLORE_PAGE_SIZE = 5;

const mapBackendRecipe = (r: any): Recipe => ({
  id: r.id.toString(),
  title: r.title,
  description: r.description,
  image: r.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  duration: r.duration,
  difficulty: r.difficulty,
  calories: r.calories,
  rating: 5.0,
  reviewsCount: 1,
  chefName: r.chef_name,
  chefAvatar: r.chef_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c',
  category: r.category,
  ingredients: r.ingredients || [],
  instructions: r.instructions || [],
  images: r.images || [],
  userId: r.user_id || undefined,
  videoUrl: r.video_url || undefined,
  likesCount: r.likesCount || 0,
});

const recipeMatchesFilters = (recipe: Recipe, search: string, category: string) => {
  const normalizedSearch = search.trim().toLowerCase();
  const matchesCategory = category === 'All' || recipe.category === category;

  if (!matchesCategory) {
    return false;
  }

  if (!normalizedSearch) {
    return true;
  }

  return (
    recipe.title.toLowerCase().includes(normalizedSearch) ||
    recipe.description.toLowerCase().includes(normalizedSearch) ||
    recipe.category.toLowerCase().includes(normalizedSearch) ||
    recipe.chefName.toLowerCase().includes(normalizedSearch) ||
    recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(normalizedSearch)) ||
    recipe.instructions.some((instruction) => instruction.toLowerCase().includes(normalizedSearch))
  );
};

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const isFocused = useIsFocused();
  const { recipes, favorites, likedRecipeIds, searchQuery, selectedCategory, uploadStatus } = useSelector(
    (state: RootState) => state.recipes
  );
  const [exploreRecipes, setExploreRecipes] = useState<Recipe[]>(recipes);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreRecipes, setHasMoreRecipes] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleRecipePress = (recipe: Recipe) => {
    dispatch(setSelectedRecipe(recipe));
    navigation.navigate('RecipeDetails');
  };

  const loadExplorePage = async (pageNum: number, isRefresh: boolean = false) => {
    if (!isRefresh && (isInitialLoading || isMoreLoading)) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (isRefresh) {
      setIsInitialLoading(true);
      setIsMoreLoading(false);
    } else {
      setIsMoreLoading(true);
      setIsInitialLoading(false);
    }

    try {
      const isFiltering = Boolean(debouncedSearchQuery) || selectedCategory !== 'All';
      let nextPageToFetch = pageNum;
      let accumulatedRecipes: Recipe[] = [];
      let hasMoreFromResponse = false;

      do {
        const response = await getAllRecipesAPI(nextPageToFetch, EXPLORE_PAGE_SIZE, {
          search: debouncedSearchQuery,
          category: selectedCategory,
        });

        if (!response?.success || !response.data) break;
        if (requestId !== requestIdRef.current) return;

        const mappedRecipes = response.data.recipes
          .map(mapBackendRecipe)
          .filter((recipe: Recipe) => recipeMatchesFilters(recipe, debouncedSearchQuery, selectedCategory));

        accumulatedRecipes = [...accumulatedRecipes, ...mappedRecipes];
        hasMoreFromResponse = Boolean(response.data.hasMore);
        nextPageToFetch += 1;
      } while (isFiltering && accumulatedRecipes.length < EXPLORE_PAGE_SIZE && hasMoreFromResponse);

      if (requestId === requestIdRef.current) {
        const visibleRecipes = accumulatedRecipes.slice(0, EXPLORE_PAGE_SIZE);

        if (pageNum === 1) {
          setExploreRecipes(visibleRecipes);
        } else {
          setExploreRecipes((currentRecipes) => {
            const existingIds = new Set(currentRecipes.map((recipe) => recipe.id));
            const newRecipes = visibleRecipes.filter((recipe: Recipe) => !existingIds.has(recipe.id));
            return [...currentRecipes, ...newRecipes];
          });
        }

        setCurrentPage(nextPageToFetch - 1);
        setHasMoreRecipes(hasMoreFromResponse);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        console.error('❌ Explore recipes fetch failed:', error);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsInitialLoading(false);
        setIsMoreLoading(false);
      }
    }
  };

  useEffect(() => {
    loadExplorePage(1, true);
  }, [debouncedSearchQuery, selectedCategory]);

  const handleLoadMore = () => {
    if (!hasMoreRecipes || isInitialLoading || isMoreLoading) return;
    loadExplorePage(currentPage + 1, false);
  };

  const renderFooter = () => {
    if (!isMoreLoading) return null;

    return (
      <View className="py-6 items-center justify-center">
        <ActivityIndicator size="small" color={Colors.primary[500]} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={uploadStatus.isUploading ? ['left', 'right'] : ['top', 'left', 'right']}>
      {/* Header Container */}
      <Animated.View
        key={`explore-header-${isFocused}`}
        entering={isFocused ? FadeInDown.duration(800).springify() : undefined}
        className="pt-2 pb-2 border-b border-gray-100 bg-white"
        style={{
          paddingHorizontal: layout.spacing.screen,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
          zIndex: 10,
        }}
      >
        <Text className="text-2xl font-black text-gray-900 mb-4">{t('explore.explore_recipes')}</Text>
        
        <SearchBar
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          placeholder={t('explore.search_placeholder')}
        />

        {/* Categories Carousel */}
        <Animated.View
          key={`explore-categories-${isFocused}`}
          entering={isFocused ? FadeInRight.duration(850).delay(150).springify() : undefined}
        >
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
      <View className="flex-1" style={{ backgroundColor: Colors.bgLight }}>
        {isInitialLoading ? (
          <View className="flex-1 items-center justify-center">
            <LoadingIndicator fullscreen={false} message="Searching..." />
          </View>
        ) : exploreRecipes.length > 0 ? (
          <FlatList
            data={exploreRecipes}
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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={renderFooter}
            renderItem={({ item, index }) => (
              <Animated.View
                key={`explore-card-${item.id}-${index}-${isFocused}`}
                entering={isFocused ? FadeInDown.delay(Math.min(index, 3) * 60).duration(350).springify() : undefined}
              >
                <RecipeCard
                  recipe={item}
                  isFavorite={favorites.includes(item.id)}
                  isLiked={likedRecipeIds.includes(item.id)}
                  onPress={() => handleRecipePress(item)}
                  onToggleFavorite={() => dispatch(toggleFavorite(item.id))}
                  onToggleLike={() => dispatch(toggleLike(item.id))}
                  horizontal
                />
              </Animated.View>
            )}
          />
        ) : (
          <Animated.View
            key={`explore-empty-${isFocused}`}
            entering={isFocused ? FadeInUp.duration(500).springify() : undefined}
            className="flex-1 items-center justify-center p-8"
          >
            <Ionicons name="search-outline" size={64} color={Colors.gray[400]} style={{ opacity: 0.4 }} />
            <Text className="text-gray-900 font-extrabold text-lg mt-4">{t('explore.no_results')}</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center max-w-[240px]">
              {t('explore.no_results_desc', { query: searchQuery, category: selectedCategory })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                dispatch(setSearchQuery(''));
                dispatch(setSelectedCategory('All'));
              }}
              className="mt-6 bg-primary-500 px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-bold text-sm">{t('explore.reset_search')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};
