import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { LOGO_IMAGE } from '../constants/Image_Url';

interface LoadingIndicatorProps {
  message?: string;
  fullscreen?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  fullscreen = true,
}) => {
  const layout = useResponsiveLayout();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Continuous 360-degree rotation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1800,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // Do not reverse (keep spinning clockwise)
    );

    // Continuous pulse scale animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800, easing: Easing.ease }),
        withTiming(1.0, { duration: 800, easing: Easing.ease })
      ),
      -1,
      true // Reverse (pulse up and down)
    );
  }, []);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const indicatorContent = (
    <View className="items-center justify-center">
      <View className="relative items-center justify-center">
        {/* Pulsing Outer Glow Ring */}
        <Animated.View
          style={[
            logoStyle,
            {
              width: layout.scale(80),
              height: layout.scale(80),
              borderRadius: layout.scale(40),
            },
          ]}
          className="bg-amber-500/10 absolute border border-amber-500/20"
        />

        {/* Rotating Progress Arc Border */}
        <Animated.View
          style={[
            spinnerStyle,
            {
              width: layout.scale(70),
              height: layout.scale(70),
              borderRadius: layout.scale(35),
            },
          ]}
          className="border-2 border-transparent border-t-amber-500 border-r-amber-500/30 items-center justify-center"
        />

        {/* Center Culinary Icon */}
        <View
          style={{
            position: 'absolute',
            width: layout.scale(50),
            height: layout.scale(50),
            borderRadius: layout.scale(10),
          }}
          className="bg-white justify-center items-center shadow-md overflow-hidden"
        >
          <Image 
            source={LOGO_IMAGE} 
            style={{ width: layout.scale(40), height: layout.scale(40) }}
            resizeMode="contain"
          />
        </View>
      </View>

      {message ? (
        <Text
          className={
            fullscreen
              ? "text-gray-800 font-extrabold mt-6 text-base tracking-wider text-center"
              : "text-amber-700 font-bold mt-5 text-sm tracking-wide bg-amber-50/80 px-4 py-1.5 rounded-full border border-amber-100/40"
          }
        >
          {message}
        </Text>
      ) : null}
    </View>
  );

  if (fullscreen) {
    return (
      <View style={StyleSheet.absoluteFill} className="justify-center items-center z-[99999]">
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={65}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.85)' }]}
          />
        )}
        {indicatorContent}
      </View>
    );
  }

  return <View className="p-4 items-center justify-center">{indicatorContent}</View>;
};
