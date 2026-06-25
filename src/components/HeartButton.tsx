import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface HeartButtonProps {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
  colorActive?: string;
  colorInactive?: string;
}

export const HeartButton: React.FC<HeartButtonProps> = ({
  isFavorite,
  onPress,
  size = 20,
  colorActive = '#ef4444',
  colorInactive = '#9ca3af',
}) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.4, { duration: 150 }),
      withDelay(150, withTiming(1.0, { duration: 150 }))
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Pressable onPress={handlePress} hitSlop={8} style={styles.pressable}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorite ? colorActive : colorInactive}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
