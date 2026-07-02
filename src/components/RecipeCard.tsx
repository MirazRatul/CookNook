import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Recipe } from '../constants/mockData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { HeartButton } from './HeartButton';
import { LikeButton } from './LikeButton';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  isLiked: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  onToggleLike: () => void;
  horizontal?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  isLiked,
  onPress,
  onToggleFavorite,
  onToggleLike,
  horizontal = false,
}) => {
  const layout = useResponsiveLayout();

  if (horizontal) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="flex-row bg-white rounded-3xl p-3 mb-4 border border-gray-200 items-center"
      >
        <Image
          source={{ uri: recipe.image }}
          className="rounded-2xl bg-gray-100"
          style={{
            width: layout.recipeCard.horizontalImageSize,
            height: layout.recipeCard.horizontalImageSize,
          }}
          resizeMode="cover"
        />
        <View className="flex-1 ml-4 pr-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-primary-600 bg-amber-50 px-2 py-0.5 rounded-md">
              {recipe.category}
            </Text>
            <HeartButton
              isFavorite={isFavorite}
              onPress={onToggleFavorite}
              size={20}
            />
          </View>
          <Text className="text-base font-bold text-gray-800 mt-1" numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">by {recipe.chefName}</Text>
          <View className="flex-row items-center justify-between mt-2 flex-wrap">
            <View className="flex-row items-center">
              <Ionicons name="star" size={13} color={Colors.primary[500]} />
              <Text className="text-xs font-bold text-gray-700 ml-1">{recipe.rating}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={13} color={Colors.gray[500]} />
              <Text className="text-xs text-gray-500 ml-1">{recipe.duration}m</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="flame-outline" size={13} color={Colors.gray[500]} />
              <Text className="text-xs text-gray-500 ml-1">{recipe.calories} kcal</Text>
            </View>
            <View className="flex-row items-center">
              <LikeButton
                isLiked={isLiked}
                onPress={onToggleLike}
                size={13}
              />
              <Text className="text-xs text-gray-500 ml-1 font-bold">{recipe.likesCount || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-white rounded-[32px] overflow-hidden border border-gray-200 mr-5"
      style={{
        width: layout.recipeCard.verticalWidth,
      }}
    >
      <View className="relative">
        <Image
          source={{ uri: recipe.image }}
          className="w-full bg-gray-100"
          style={{ height: layout.recipeCard.verticalImageHeight }}
          resizeMode="cover"
        />
        <View
          className="absolute top-4 left-4 px-3 py-1 rounded-full flex-row items-center"
          style={{ backgroundColor: Colors.whiteOpacity }}
        >
          <Ionicons name="star" size={14} color={Colors.primary[500]} />
          <Text className="text-xs font-bold text-gray-800 ml-1">{recipe.rating}</Text>
        </View>
        <View
          className="absolute top-4 right-4 p-2 rounded-full border border-gray-100"
          style={{
            backgroundColor: Colors.whiteOpacity,
          }}
        >
          <HeartButton
            isFavorite={isFavorite}
            onPress={onToggleFavorite}
            size={18}
            colorActive={Colors.danger}
            colorInactive={Colors.gray[600]}
          />
        </View>
      </View>

      <View className="p-5">
        <Text className="text-xs font-bold text-primary-600 bg-amber-50 self-start px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {recipe.category}
        </Text>
        <Text className="text-lg font-extrabold text-gray-800 mt-2" numberOfLines={1}>
          {recipe.title}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">by {recipe.chefName}</Text>
        <View className="flex-row items-center justify-between border-t border-gray-100 pt-3.5 mt-4">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color={Colors.gray[500]} />
            <Text className="text-xs text-gray-600 font-semibold ml-1">{recipe.duration} mins</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="flame-outline" size={14} color={Colors.gray[500]} />
            <Text className="text-xs text-gray-600 font-semibold ml-1">{recipe.calories} kcal</Text>
          </View>
          <View className="flex-row items-center">
            <LikeButton
              isLiked={isLiked}
              onPress={onToggleLike}
              size={14}
            />
            <Text className="text-xs text-gray-600 font-semibold ml-1">{recipe.likesCount || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
