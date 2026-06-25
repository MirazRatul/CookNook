import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}) => {
  // Styles for different variants
  const variantStyles = {
    primary: 'bg-primary-500 active:bg-primary-600 border border-transparent',
    secondary: 'bg-amber-100 active:bg-amber-200 border border-transparent',
    outline: 'bg-transparent border border-gray-300 active:bg-gray-50',
    danger: 'bg-red-500 active:bg-red-600 border border-transparent',
  };

  const textStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-amber-800 font-semibold',
    outline: 'text-gray-700 font-medium',
    danger: 'text-white font-semibold',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 rounded-lg text-sm',
    md: 'px-4 py-2.5 rounded-xl text-base',
    lg: 'px-6 py-3.5 rounded-2xl text-lg',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? '#d97706' : '#ffffff'}
        />
      ) : (
        <Text className={`${textStyles[variant]} ${textSizeStyles[size]} text-center`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
