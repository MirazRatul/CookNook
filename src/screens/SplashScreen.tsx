import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
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
import { RootStackScreenProps } from '../navigation/types';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { REFRESH_LOGO } from '../constants/Image_Url';

import { auth } from '../services/firebase';

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

    // 3. Animate app title and subtitle with a delay
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    // Pre-calculate target screen during the animation delay
    let resolvedNextScreen: 'Onboarding' | 'SignIn' | 'MainTabs' = 'Onboarding';

    const performInit = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('HAS_SEEN_ONBOARDING');
        const user = auth().currentUser;
        let isLoggedIn = false;

        if (user) {
          try {
            // Reload user state to get the latest emailVerified field from Firebase
            await user.reload();
            const updatedUser = auth().currentUser;
            isLoggedIn = updatedUser !== null && updatedUser.emailVerified;
            
            if (!isLoggedIn) {
              await auth().signOut();
            }
          } catch (error) {
            console.error('Error verifying user session at splash:', error);
            try {
              await auth().signOut();
            } catch (e) {}
          }
        }

        if (hasSeenOnboarding === 'true') {
          resolvedNextScreen = isLoggedIn ? 'MainTabs' : 'SignIn';
        } else {
          resolvedNextScreen = 'Onboarding';
        }
      } catch (error) {
        console.error('Error during splash init check:', error);
        resolvedNextScreen = 'Onboarding';
      }
    };

    // Start background check immediately on mount
    const initPromise = performInit();

    // Wait at least 2.2 seconds to allow the splash animations to play
    const splashTimer = setTimeout(async () => {
      // Ensure the background session resolution is complete before starting fade-out
      await initPromise;

      containerOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(navigateToTarget)();
        }
      });
    }, 2200);

    const navigateToTarget = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: resolvedNextScreen }],
      });
    };

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  return (
    <Animated.View 
      style={containerStyle} 
      className="flex-1 bg-white justify-center items-center"
    >
      <View className="items-center">
        {/* Animated Custom Logo */}
        <Animated.View 
          style={[logoStyle, { width: logoSize, height: logoSize }]}
          className="justify-center items-center mb-6"
        >
          <Image 
            source={REFRESH_LOGO} 
            style={{ width: logoSize, height: logoSize }}
            resizeMode="contain"
          />
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

