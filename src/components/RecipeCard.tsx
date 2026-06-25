import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../constants/mockData';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  horizontal?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  onPress,
  onToggleFavorite,
  horizontal = false,
}) => {
  const layout = useResponsiveLayout();

  if (horizontal) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="flex-row bg-white rounded-3xl p-3 mb-4 shadow-sm border border-gray-100 items-center"
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
            <TouchableOpacity onPress={onToggleFavorite} activeOpacity={0.7} className="p-1">
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#ef4444' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>
          <Text className="text-base font-bold text-gray-800 mt-1" numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">by {recipe.chefName}</Text>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center">
              <Ionicons name="star" size={13} color="#f59e0b" />
              <Text className="text-xs font-bold text-gray-700 ml-1">{recipe.rating}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={13} color="#6b7280" />
              <Text className="text-xs text-gray-500 ml-1">{recipe.duration}m</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="flame-outline" size={13} color="#6b7280" />
              <Text className="text-xs text-gray-500 ml-1">{recipe.calories} kcal</Text>
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
      className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 mr-5"
      style={{ width: layout.recipeCard.verticalWidth }}
    >
      <View className="relative">
        <Image
          source={{ uri: recipe.image }}
          className="w-full bg-gray-100"
          style={{ height: layout.recipeCard.verticalImageHeight }}
          resizeMode="cover"
        />
        <View className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full flex-row items-center">
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text className="text-xs font-bold text-gray-800 ml-1">{recipe.rating}</Text>
        </View>
        <TouchableOpacity
          onPress={onToggleFavorite}
          activeOpacity={0.7}
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-sm"
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#ef4444' : '#4b5563'}
          />
        </TouchableOpacity>
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
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text className="text-xs text-gray-600 font-semibold ml-1">{recipe.duration} mins</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="flame-outline" size={14} color="#6b7280" />
            <Text className="text-xs text-gray-600 font-semibold ml-1">{recipe.calories} kcal</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
