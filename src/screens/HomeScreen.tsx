import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProfileDrawer } from '../components/ProfileDrawer';
import { LanguageBottomSheet } from '../components/LanguageBottomSheet';
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
import { IMAGE_URLS } from '../constants/Image_Url';
import { Colors } from '../constants/Colors';
import { auth } from '../services/firebase';

type HomeScreenProps = AppTabScreenProps<'Home'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const isFocused = useIsFocused();
  const { recipes, favorites, selectedCategory, searchQuery } = useSelector(
    (state: RootState) => state.recipes
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);

  const currentUser = auth().currentUser;
  const userPhoto = currentUser?.photoURL ? { uri: currentUser.photoURL } : { uri: IMAGE_URLS.profiles.chefRatul };

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
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
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
      </ScrollView>
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
