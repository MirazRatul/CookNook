import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, RefreshControl, GestureResponderEvent, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProfileDrawer } from '../components/ProfileDrawer';
import { LanguageBottomSheet } from '../components/LanguageBottomSheet';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  LinearTransition,
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleFavorite, setSelectedCategory, setSelectedRecipe, setSearchQuery, setRecipes, setFavorites } from '../store/slices/recipesSlice';
import { getAllRecipesAPI, getFavoritesAPI } from '../services/recipeService';
import { SearchBar } from '../components/SearchBar';
import { CategoryBadge } from '../components/CategoryBadge';
import { RecipeCard } from '../components/RecipeCard';
import { CATEGORIES, Recipe } from '../constants/mockData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { AppTabScreenProps } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { IMAGE_URLS } from '../constants/Image_Url';
import { Colors } from '../constants/Colors';
import { auth } from '../services/firebase';
import { CustomRefreshIndicator } from '../components/CustomRefreshIndicator';

type HomeScreenProps = AppTabScreenProps<'Home'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const isFocused = useIsFocused();
  const { recipes, favorites, selectedCategory, searchQuery, uploadStatus } = useSelector(
    (state: RootState) => state.recipes
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reanimated pull-down metrics and refs for CustomRefreshIndicator (matching UserRecipe.tsx)
  const scrollY = useSharedValue(0);
  const pullDistance = useSharedValue(0);
  const androidPullStartY = useRef<number | null>(null);
  const isAndroidPulling = useRef(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      if (Platform.OS === 'ios') {
        // On iOS, pull distance is derived from negative scrollY
        pullDistance.value = Math.max(-event.contentOffset.y, 0);
      }
    },
  });

  const resetAndroidPullDistance = () => {
    if (Platform.OS === 'android' && !isRefreshing) {
      pullDistance.value = withTiming(0, { duration: 180 });
    }
  };

  const handleAndroidTouchStart = (event: GestureResponderEvent) => {
    if (Platform.OS !== 'android' || isRefreshing) return;

    if (scrollY.value <= 0) {
      androidPullStartY.current = event.nativeEvent.pageY;
      isAndroidPulling.current = false;
    }
  };

  const handleAndroidTouchMove = (event: GestureResponderEvent) => {
    if (Platform.OS !== 'android' || androidPullStartY.current === null || scrollY.value > 0) return;

    const dragDistance = event.nativeEvent.pageY - androidPullStartY.current;

    if (dragDistance > 0) {
      isAndroidPulling.current = true;
      pullDistance.value = Math.min(dragDistance * 0.65, 110);
    } else if (isAndroidPulling.current) {
      pullDistance.value = 0;
      isAndroidPulling.current = false;
    }
  };

  const handleAndroidTouchEnd = () => {
    if (Platform.OS !== 'android') return;

    const shouldRefresh = isAndroidPulling.current && pullDistance.value >= 70; // 70px trigger distance

    androidPullStartY.current = null;
    isAndroidPulling.current = false;

    if (shouldRefresh) {
      handleRefresh();
      return;
    }

    resetAndroidPullDistance();
  };

  useEffect(() => {
    if (Platform.OS === 'android' && !isRefreshing) {
      pullDistance.value = withTiming(0, { duration: 180 });
    }
  }, [isRefreshing]);

  const currentUser = auth().currentUser;
  const userPhoto = currentUser?.photoURL ? { uri: currentUser.photoURL } : { uri: IMAGE_URLS.profiles.chefRatul };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Pull-to-refresh: Fetching latest recipes and favorites from DB...');
      const recipesResponse = await getAllRecipesAPI(1, 100);
      if (recipesResponse && recipesResponse.success && recipesResponse.data) {
        const mappedRecipes = recipesResponse.data.recipes.map((r: any): Recipe => ({
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
        }));
        dispatch(setRecipes(mappedRecipes));
      }

      const favResponse = await getFavoritesAPI();
      if (favResponse && favResponse.success && favResponse.data) {
        const { favoriteIds } = favResponse.data;
        if (Array.isArray(favoriteIds)) {
          dispatch(setFavorites(favoriteIds));
        }
      }
    } catch (error) {
      console.error('❌ Pull-to-refresh home data failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
    <View style={{ flex: 1, backgroundColor: Colors.bgLight }}>
      <SafeAreaView className="flex-1" edges={uploadStatus.isUploading ? ['left', 'right'] : ['top', 'left', 'right']}>
      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onTouchStart={handleAndroidTouchStart}
        onTouchMove={handleAndroidTouchMove}
        onTouchEnd={handleAndroidTouchEnd}
        onTouchCancel={handleAndroidTouchEnd}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={['transparent']}
          />
        }
      >
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
          <Text numberOfLines={1} className="text-gray-400 text-sm font-semibold tracking-wide">{t('home.hello_chef')}</Text>
          <Text numberOfLines={1} className="text-2xl font-extrabold text-gray-900 mt-0.5">{t('home.what_cooking')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            console.log('Profile picture clicked, opening drawer');
            setIsDrawerOpen(true);
          }}
          activeOpacity={0.85}
        >
          <Image
            source={userPhoto}
            className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
          />
        </TouchableOpacity>
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
            placeholder={t('explore.search_placeholder')}
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
          <Text numberOfLines={1} className="text-xl font-black text-gray-800">{t('home.popular_recipes')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')} className="flex-row items-center">
            <Text numberOfLines={1} className="text-primary-600 font-bold text-sm mr-0.5">{t('home.see_all')}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary[600]} />
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
              key={`popular-card-${recipe.id}-${index}-${isFocused}`}
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
        <Text numberOfLines={1} className="text-xl font-black text-gray-800 mb-4">{t('home.chef_recommendations')}</Text>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe, index) => (
            <Animated.View
              key={`recommend-card-${recipe.id}-${index}-${isFocused}`}
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
            <Ionicons name="fast-food-outline" size={48} color={Colors.primary[600]} style={{ opacity: 0.4 }} />
            <Text className="text-gray-500 font-semibold mt-3 text-center">
              {t('home.no_recipes_category')}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
      </Animated.ScrollView>
      <CustomRefreshIndicator pullDistance={pullDistance} refreshing={isRefreshing} />
      </SafeAreaView>
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigateToCreate={() => navigation.navigate('Create')}
        onOpenLanguageSheet={() => setIsLanguageSheetOpen(true)}
      />
      <LanguageBottomSheet
        isOpen={isLanguageSheetOpen}
        onClose={() => setIsLanguageSheetOpen(false)}
      />
    </View>
  );
};
