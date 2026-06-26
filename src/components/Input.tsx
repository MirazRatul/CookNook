import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  error?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  iconName,
  error,
  isPassword = false,
  secureTextEntry,
  className = '',
  onBlur,
  onFocus,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? isPassword);

  const toggleSecure = () => {
    setIsSecure(!isSecure);
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View className={`w-full mb-4 ${className}`}>
      {label && (
        <Text className="text-gray-700 font-medium mb-1.5 text-sm">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center border rounded-xl px-3 bg-gray-50 h-12 transition-colors ${
          error
            ? 'border-red-500 bg-red-50/10'
            : isFocused
            ? 'border-primary-500 bg-white border-2'
            : 'border-gray-200'
        }`}
      >
        {iconName && (
          <Ionicons
            name={iconName as any}
            size={20}
            color={error ? Colors.danger : isFocused ? Colors.primary[500] : Colors.gray[400]}
            style={{ marginRight: 10 }}
          />
        )}

        <TextInput
          className="flex-1 text-gray-800 text-sm h-full py-0"
          textAlignVertical="center"
          placeholderTextColor={Colors.gray[400]}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={toggleSecure} activeOpacity={0.7} className="p-1">
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.gray[400]}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="text-red-500 text-xs mt-1 font-medium ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
