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
  multiline,
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
        className={`flex-row border rounded-xl px-3 bg-gray-50 transition-colors ${
          multiline ? 'items-start py-2.5 h-20' : 'items-center h-12'
        } ${
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
            style={multiline ? { marginRight: 10, marginTop: 2 } : { marginRight: 10 }}
          />
        )}

        <TextInput
          className="flex-1 text-gray-800 text-[14px] p-0"
          placeholderTextColor={Colors.gray[400]}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          style={multiline ? [{ textAlignVertical: 'top', height: '100%' }, props.style] : props.style}
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
