import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { SocialButton } from '../../components/SocialButton';
import { logInWithEmail, signInWithGoogle } from '../../services/authService';
import { IMAGE_URLS } from '../../constants/Image_Url';

export const SignInScreen: React.FC<RootStackScreenProps<'SignIn'>> = ({ navigation }) => {
  const layout = useResponsiveLayout();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Errors state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Smooth Fade & Soft Scale Animation Values (No spring bounces)
  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.96);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  useEffect(() => {
    // Elegant, smooth timing transitions
    headerOpacity.value = withTiming(1, { 
      duration: 700, 
      easing: Easing.out(Easing.quad) 
    });
    headerScale.value = withTiming(1.0, { 
      duration: 700, 
      easing: Easing.out(Easing.quad) 
    });
    
    cardOpacity.value = withDelay(150, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.quad) 
    }));
    cardScale.value = withDelay(150, withTiming(1.0, { 
      duration: 800, 
      easing: Easing.out(Easing.quad) 
    }));
  }, []);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!email) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError('');
    try {
      await logInWithEmail(email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      setGeneralError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setGeneralError('');
    try {
      await signInWithGoogle();
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      setGeneralError(error.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: IMAGE_URLS.onboarding.cook }}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Darkened overlay to make elements pop */}
      <View className="flex-1 bg-black/45">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: layout.spacing.screen,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View 
              style={{ maxWidth: layout.isTablet ? 460 : undefined }} 
              className="w-full self-center py-10"
            >
              {/* Logo & Header */}
              <Animated.View style={headerAnimatedStyle} className="items-center mb-6">
                <View 
                  style={{ width: layout.scale(64), height: layout.scale(64), borderRadius: layout.scale(32) }} 
                  className="bg-white/15 backdrop-blur-md justify-center items-center mb-2 shadow-inner border border-white/20"
                >
                  <Ionicons name="restaurant" size={layout.scale(28)} color="#fbbf24" />
                </View>
                <Text className="text-3xl font-black text-white tracking-wider">
                  CookNook
                </Text>
                <Text className="text-amber-200/90 font-medium mt-1 text-center text-sm">
                  Your Personal Culinary Haven
                </Text>
              </Animated.View>

              {/* Glassmorphic Form Card */}
              <Animated.View 
                style={[
                  cardAnimatedStyle,
                  {
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.15,
                    shadowRadius: 15,
                    elevation: 5,
                  }
                ]}
                className="bg-white/95 border border-white/20 rounded-[32px] p-6"
              >
                <Text className="text-xl font-extrabold text-gray-800 mb-5">
                  Sign In
                </Text>

                {generalError ? (
                  <View className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex-row items-center">
                    <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                    <Text className="text-red-700 flex-1 font-medium text-xs">
                      {generalError}
                    </Text>
                  </View>
                ) : null}

                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  iconName="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  error={emailError}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  iconName="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  error={passwordError}
                  isPassword
                  autoCapitalize="none"
                />

                <TouchableOpacity 
                  activeOpacity={0.7} 
                  className="self-end mb-5"
                  onPress={() => Alert.alert('Reset Password', 'An email password reset link will be sent in the future.')}
                >
                  <Text className="text-right font-bold text-primary-600 text-sm">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  className="mb-4 py-3.5 rounded-xl shadow-sm bg-primary-500"
                />

                {/* Divider */}
                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-[1px] bg-gray-200" />
                  <Text className="text-gray-400 font-bold text-[10px] px-3 uppercase tracking-widest">
                    Or Connect With
                  </Text>
                  <View className="flex-1 h-[1px] bg-gray-200" />
                </View>

                {/* Google Sign-In */}
                <SocialButton
                  title="Sign in with Google"
                  onPress={handleGoogleLogin}
                  iconName="logo-google"
                  iconColor="#EA4335"
                  loading={googleLoading}
                  className="mb-5 shadow-sm"
                />

                {/* Footer */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-500 font-medium text-sm">
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('SignUp')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-primary-600 font-bold text-sm">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};
