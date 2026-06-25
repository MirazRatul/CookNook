import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../navigation/types';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

// Prevent the native splash screen from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => {});

export const SplashScreenView: React.FC<RootStackScreenProps<'Splash'>> = ({ navigation }) => {
  const layout = useResponsiveLayout();
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  const logoSize = layout.scale(120);
  const iconSize = layout.scale(54);
  const titleSize = layout.scale(38);
  const subtitleSize = layout.scale(14);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      {
        translateY: withTiming(textOpacity.value === 0 ? 15 : 0, { duration: 600 }),
      },
    ],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  useEffect(() => {
    // 1. Hide native splash screen immediately so our animated one mounts
    SplashScreen.hideAsync().catch(() => {});

    // 2. Start logo scale and fade animations
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSpring(1.0, { damping: 12, stiffness: 90 });

    // 3. Animate app title and subtitle with a minor delay
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    // 4. Query storage for onboarding state
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('HAS_SEEN_ONBOARDING');
        
        // Wait at least 2.2 seconds to allow the splash animations to shine
        setTimeout(() => {
          containerOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
            if (finished) {
              runOnJS(navigateNext)(hasSeenOnboarding === 'true');
            }
          });
        }, 2200);
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
        navigateNext(false);
      }
    };

    const navigateNext = (onboarded: boolean) => {
      navigation.reset({
        index: 0,
        routes: [{ name: onboarded ? 'MainTabs' : 'Onboarding' }],
      });
    };

    checkOnboarding();
  }, []);

  return (
    <Animated.View 
      style={containerStyle} 
      className="flex-1 bg-white justify-center items-center"
    >
      <View className="items-center">
        {/* Animated Custom Logo */}
        <Animated.View 
          style={[logoStyle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}
          className="bg-amber-50 justify-center items-center mb-6 shadow-md"
        >
          <Ionicons name="restaurant" size={iconSize} color="#d97706" />
        </Animated.View>

        {/* Animated App Brand Name */}
        <Animated.View style={textStyle} className="items-center">
          <Text style={{ fontSize: titleSize }} className="font-black text-gray-900 tracking-wider text-center">
            CookNook
          </Text>
          <Text style={{ fontSize: subtitleSize }} className="text-gray-500 font-semibold mt-2 tracking-wide text-center">
            Your Personal Culinary Haven
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

