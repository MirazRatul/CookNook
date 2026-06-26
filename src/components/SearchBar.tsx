import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search recipes, ingredients...',
  className = '',
}) => {
  return (
    <View className={`flex-row items-center bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2.5 ${className}`}>
      <Ionicons name="search-outline" size={20} color={Colors.gray[400]} className="mr-2" />
      <TextInput
        className="flex-1 text-gray-800 text-[16px] font-normal p-0"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray[400]}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
};
