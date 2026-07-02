import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated';
import { REFRESH_LOGO } from '../constants/Image_Url';

interface CustomRefreshIndicatorProps {
  pullDistance: SharedValue<number>;
  refreshing: boolean;
  topOffset?: number;
  prominent?: boolean;
}

export const CustomRefreshIndicator: React.FC<CustomRefreshIndicatorProps> = ({
  pullDistance,
  refreshing,
  topOffset = 0,
  prominent = false,
}) => {
  const rotation = useSharedValue(0);
  const refreshingProgress = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      // Start continuous spinning animation when refreshing is active
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1200,
          easing: Easing.linear,
        }),
        -1, // Infinite loop
        false // Do not reverse (keep clockwise direction)
      );
      // Smoothly animate refreshing transition to active (1)
      refreshingProgress.value = withTiming(1, { duration: 300 });
    } else {
      // Reset rotation when finished
      cancelAnimation(rotation);
      rotation.value = 0;
      // Smoothly animate refreshing transition to inactive (0)
      refreshingProgress.value = withTiming(0, { duration: 300 });
    }
  }, [refreshing]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const opacityDistance = prominent ? 36 : 60;
    const scaleDistance = prominent ? 58 : 80;
    const translateDistance = prominent ? 70 : 80;
    const inactiveScale = prominent ? 0.82 : 0.6;
    const activeScale = prominent ? 1.08 : 1.0;
    const hiddenTranslateY = prominent ? -18 : -40;
    const activeTranslateY = prominent ? 28 : 20;

    // Determine pull-based opacity, scale, and translateY (primarily used on iOS)
    const pullOpacity = interpolate(pullDistance.value, [0, opacityDistance], [0, 1], Extrapolate.CLAMP);
    const pullScale = interpolate(pullDistance.value, [0, scaleDistance], [inactiveScale, 1.12], Extrapolate.CLAMP);
    const pullTranslateY = interpolate(pullDistance.value, [0, translateDistance], [hiddenTranslateY, activeTranslateY], Extrapolate.CLAMP);

    // Blend values smoothly using refreshingProgress to prevent snapping on Android/iOS when starting or ending refresh
    const opacity = interpolate(refreshingProgress.value, [0, 1], [pullOpacity, 1]);
    const scale = interpolate(refreshingProgress.value, [0, 1], [pullScale, activeScale]);
    const translateY = interpolate(refreshingProgress.value, [0, 1], [pullTranslateY, activeTranslateY]);

    return {
      opacity,
      transform: [
        { translateY },
        { scale },
      ],
    };
  });

  const animatedCircleStyle = useAnimatedStyle(() => {
    // Determine rotation: use continuous spin if refreshing, otherwise track pull distance
    const rotateValue = refreshing
      ? `${rotation.value}deg`
      : `${Math.max(pullDistance.value, 0) * 3.5}deg`;

    return {
      transform: [
        { rotate: rotateValue },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { top: topOffset },
        animatedContainerStyle,
      ]}
    >
      <View style={styles.wrapper}>
        <Animated.View
          style={[
            styles.circle,
            animatedCircleStyle,
          ]}
        />
        <Image
          source={REFRESH_LOGO}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none', // Allow scrolling gesture events to pass through
  },
  wrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: 65,
    height: 65,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: 'rgba(245, 158, 11, 0.15)', // Light amber track background
    borderTopColor: '#D97706', // Dark amber spinner arc
    borderRightColor: '#D97706',
  },
  logo: {
    width: 60,
    height: 60,
  },
});
