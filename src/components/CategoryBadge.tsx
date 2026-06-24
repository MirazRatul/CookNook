import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface CategoryBadgeProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  name,
  isSelected,
  onPress,
  className = '',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`px-4 py-2 rounded-full mr-2.5 border ${
        isSelected
          ? 'bg-primary-500 border-primary-500 shadow-sm'
          : 'bg-white border-gray-200'
      } ${className}`}
    >
      <Text
        className={`font-semibold text-sm ${
          isSelected ? 'text-white' : 'text-gray-600'
        }`}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};
