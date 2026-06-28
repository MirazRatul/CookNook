import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { RecipeCard } from '../../components/RecipeCard';
import { Recipe } from '../../constants/mockData';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { RootState } from '../../store/store';
import {
  setSelectedRecipe,
  toggleFavorite,
  setUserRecipes,
  setUserRecipesNeedsRefresh,
} from '../../store/slices/recipesSlice';
import { getUserRecipesAPI } from '../../services/recipeService';
import { useAlert } from '../../context/CustomAlertContext';
import { CustomRefreshIndicator } from '../../components/CustomRefreshIndicator';

const ANDROID_REFRESH_TRIGGER_DISTANCE = 70;

export const UserRecipeScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const isFocused = useIsFocused();
  const { showAlert } = useAlert();

  // Redux states
  const { userRecipes, userRecipesNeedsRefresh, userRecipesHasMore, favorites } = useSelector(
    (state: RootState) => state.recipes
  );

  // Local Pagination/Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Shared scroll offset for pull-to-refresh tracking
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
    if (Platform.OS !== 'android' || isRefreshing || isInitialLoading || isMoreLoading) return;

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
      pullDistance.value = withTiming(0, { duration: 120 });
    }
  };

  const handleAndroidTouchEnd = () => {
    if (Platform.OS !== 'android') return;

    const shouldRefresh = isAndroidPulling.current && pullDistance.value >= ANDROID_REFRESH_TRIGGER_DISTANCE;

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

  useEffect(() => {
    if (isFocused) {
      if (userRecipesNeedsRefresh || userRecipes.length === 0) {
        loadPage(1, true);
      }
    }
  }, [isFocused]);

  const loadPage = async (pageNum: number, isRefresh: boolean = false) => {
    // Prevent simultaneous loading triggers
    if (isInitialLoading || isMoreLoading || isRefreshing) return;

    if (pageNum === 1) {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsInitialLoading(true);
      }
    } else {
      setIsMoreLoading(true);
    }

    try {
      const response = await getUserRecipesAPI(pageNum, 10);
      if (response.success && response.data) {
        const { recipes: fetchedRecipes, hasMore } = response.data;

        // Map backend schema parameters into standardized frontend Recipe entities
        const mappedRecipes = fetchedRecipes.map((r: any): Recipe => ({
          id: r.id.toString(),
          title: r.title,
          description: r.description,
          image: r.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
          duration: r.duration,
          difficulty: r.difficulty,
          calories: r.calories,
          rating: 5.0, // Default rating as rating tables are mock
          reviewsCount: 1,
          chefName: r.chef_name,
          chefAvatar: r.chef_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c',
          category: r.category,
          ingredients: r.ingredients || [],
          instructions: r.instructions || [],
          images: r.images || [],
          userId: r.user_id || undefined,
        }));

        dispatch(
          setUserRecipes({
            recipes: mappedRecipes,
            page: pageNum,
            hasMore,
          })
        );
        setCurrentPage(pageNum);
      }
    } catch (error: any) {
      console.error('❌ Error fetching user recipes page:', pageNum, error);
      showAlert(
        t('common.error', 'Error'),
        error.message || 'Failed to fetch your recipes from the server.',
        undefined,
        'error'
      );
    } finally {
      setIsRefreshing(false);
      setIsInitialLoading(false);
      setIsMoreLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(setUserRecipesNeedsRefresh(true));
    loadPage(1, true);
  };

  const handleLoadMore = () => {
    if (userRecipesHasMore && !isMoreLoading && !isInitialLoading && !isRefreshing && userRecipes.length > 0) {
      const nextPage = currentPage + 1;
      loadPage(nextPage, false);
    }
  };

  const handleRecipePress = (recipe: Recipe) => {
    dispatch(setSelectedRecipe(recipe));
    navigation.navigate('RecipeDetails');
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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header Panel */}
      <View
        className="flex-row items-center justify-between pb-4 border-b border-gray-100"
        style={{ paddingHorizontal: layout.spacing.screen }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 bg-gray-50 border border-gray-100 rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.gray[800]} />
        </TouchableOpacity>
        <Text className="text-lg font-black text-gray-900">{t('my_recipes.title', 'My Recipes')}</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Recipes List Container */}
      <View className="flex-1 relative" style={{ backgroundColor: Colors.bgLight }}>
        {isInitialLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text className="text-gray-500 font-semibold mt-4">
              {t('my_recipes.loading', 'Fetching your recipes...')}
            </Text>
          </View>
        ) : (
          <>
            <Animated.FlatList
              data={userRecipes}
              keyExtractor={(item) => `user-recipe-${item.id}`}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              onTouchStart={handleAndroidTouchStart}
              onTouchMove={handleAndroidTouchMove}
              onTouchEnd={handleAndroidTouchEnd}
              onTouchCancel={handleAndroidTouchEnd}
              contentContainerStyle={{
                paddingHorizontal: layout.spacing.screen,
                paddingTop: 20,
                paddingBottom: insets.bottom + 48,
                width: '100%',
                maxWidth: layout.listMaxWidth,
                alignSelf: 'center',
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={isRefreshing ? undefined : FadeInDown.delay(Math.min(index, 4) * 50).duration(350)}
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
              ListEmptyComponent={
                !isInitialLoading ? (
                  <EmptyStateView
                    t={t}
                    onPressCreate={() => navigation.navigate('MainTabs', { screen: 'Create' })}
                    isRefreshing={isRefreshing}
                  />
                ) : null
              }
              ListFooterComponent={renderFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.2}
              refreshControl={Platform.OS === 'ios' ? (
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor="transparent"
                  colors={['transparent']}
                  progressBackgroundColor="transparent"
                  progressViewOffset={0}
                />
              ) : undefined}
            />
            {!isInitialLoading && (
              <CustomRefreshIndicator pullDistance={pullDistance} refreshing={isRefreshing} />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

interface EmptyStateProps {
  t: any;
  onPressCreate: () => void;
  isRefreshing: boolean;
}

const EmptyStateView: React.FC<EmptyStateProps> = ({ t, onPressCreate, isRefreshing }) => {
  return (
    <Animated.View
      entering={isRefreshing ? undefined : FadeInUp.duration(500).springify()}
      className="flex-1 items-center justify-center p-8 mt-16"
    >
      <View className="bg-amber-50 p-6 rounded-full mb-4">
        <Ionicons
          name="book-outline"
          size={64}
          color={Colors.primary[500]}
          style={{ opacity: 0.8 }}
        />
      </View>
      <Text className="text-gray-900 font-extrabold text-lg text-center mt-2">
        {t('my_recipes.no_recipes', 'No Recipes Yet')}
      </Text>
      <Text className="text-gray-400 text-sm mt-1.5 text-center max-w-[260px] leading-relaxed">
        {t('my_recipes.no_recipes_desc', "You haven't created any recipes yet. Start cooking and share your first dish!")}
      </Text>
      <TouchableOpacity
        onPress={onPressCreate}
        className="mt-6 bg-primary-500 px-6 py-3 rounded-full shadow-md shadow-amber-500/20"
        activeOpacity={0.85}
      >
        <Text className="text-white font-bold text-sm">
          {t('my_recipes.create_button', 'Create Recipe')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
