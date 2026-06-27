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
  scrollY: SharedValue<number>;
  refreshing: boolean;
}

export const CustomRefreshIndicator: React.FC<CustomRefreshIndicatorProps> = ({
  scrollY,
  refreshing,
}) => {
  const rotation = useSharedValue(0);

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
    } else {
      // Reset rotation when finished
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [refreshing]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    // Determine opacity: fade in between 0px and 60px pull
    const opacity = refreshing
      ? 1
      : interpolate(-scrollY.value, [0, 60], [0, 1], Extrapolate.CLAMP);

    // Determine scale: scale up from 0.6 to 1.1 based on pull distance
    const scale = refreshing
      ? 1.0
      : interpolate(-scrollY.value, [0, 80], [0.6, 1.1], Extrapolate.CLAMP);

    // Translate Y: float down slightly as pulled, then lock at 16px when refreshing
    const translateY = refreshing
      ? 16
      : interpolate(-scrollY.value, [0, 80], [-30, 20], Extrapolate.CLAMP);

    return {
      opacity,
      transform: [
        { translateY },
        { scale },
      ],
    };
  });

  const animatedCircleStyle = useAnimatedStyle(() => {
    // Determine rotation: use continuous spin if refreshing, otherwise track scroll Y value
    const rotateValue = refreshing
      ? `${rotation.value}deg`
      : `${Math.max(-scrollY.value, 0) * 3.5}deg`;

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
