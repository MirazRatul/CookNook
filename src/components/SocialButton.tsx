import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  title,
  onPress,
  iconName,
  iconColor = Colors.googleBlue, // default Google Blue
  loading = false,
  disabled = false,
  className = '',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center border border-gray-200 bg-white rounded-xl h-12 px-4 shadow-sm active:bg-gray-50 ${className}`}
      style={{ opacity: disabled ? 0.6 : 1 }}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.gray[500]} />
      ) : (
        <View className="flex-row items-center justify-center">
          {iconName === 'logo-google' ? (
            <Image
              source={{ uri: 'https://developers.google.com/static/identity/images/g-logo.png' }}
              style={{ width: 20, height: 20, marginRight: 10 }}
              resizeMode="contain"
            />
          ) : (
            <Ionicons
              name={iconName as any}
              size={20}
              color={iconColor}
              style={{ marginRight: 10 }}
            />
          )}
          <Text className="text-gray-700 font-semibold text-base text-center">
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
