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
import { Colors } from '../constants/Colors';

interface LikeButtonProps {
  isLiked: boolean;
  onPress: () => void;
  size?: number;
  colorActive?: string;
  colorInactive?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  onPress,
  size = 18,
  colorActive = Colors.primary[500],
  colorInactive = Colors.gray[400],
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
          name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
          size={size}
          color={isLiked ? colorActive : colorInactive}
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
