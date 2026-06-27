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
import { LOGO_IMAGE } from '../constants/Image_Url';

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

  const animatedStyle = useAnimatedStyle(() => {
    // Determine opacity: fade in between 0px and 60px pull
    const opacity = refreshing
      ? 1
      : interpolate(-scrollY.value, [0, 60], [0, 1], Extrapolate.CLAMP);

    // Determine scale: scale up from 0.6 to 1.1 based on pull distance
    const scale = refreshing
      ? 1.0
      : interpolate(-scrollY.value, [0, 80], [0.6, 1.1], Extrapolate.CLAMP);

    // Determine rotation: use continuous spin if refreshing, otherwise track scroll Y value
    const rotateValue = refreshing
      ? `${rotation.value}deg`
      : `${Math.max(-scrollY.value, 0) * 3.5}deg`;

    // Translate Y: float down slightly as pulled, then lock at 16px when refreshing
    const translateY = refreshing
      ? 16
      : interpolate(-scrollY.value, [0, 80], [-30, 20], Extrapolate.CLAMP);

    return {
      opacity,
      transform: [
        { translateY },
        { scale },
        { rotate: rotateValue },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
      ]}
    >
      <View style={styles.spinnerWrapper} className="shadow-md border border-amber-100 bg-white">
        <Image
          source={LOGO_IMAGE}
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
  spinnerWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 28,
    height: 28,
  },
});
