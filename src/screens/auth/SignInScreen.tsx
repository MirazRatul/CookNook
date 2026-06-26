import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { SocialButton } from '../../components/SocialButton';
import { logInWithEmail, signInWithGoogle } from '../../services/authService';

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

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(40);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  useEffect(() => {
    // Start entry animations
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSpring(1.0, { damping: 12 });
    
    formOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(200, withSpring(0, { damping: 15 }));
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
      // Navigate to home tabs
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
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
          style={{ maxWidth: layout.isTablet ? 450 : undefined }} 
          className="w-full self-center py-8"
        >
          {/* Logo & Header */}
          <Animated.View style={logoAnimatedStyle} className="items-center mb-8">
            <View 
              style={{ width: layout.scale(70), height: layout.scale(70), borderRadius: layout.scale(35) }} 
              className="bg-amber-50 justify-center items-center mb-3 shadow-sm border border-amber-100"
            >
              <Ionicons name="restaurant" size={layout.scale(32)} color="#d97706" />
            </View>
            <Text className="text-3xl font-black text-gray-900 tracking-wider">
              CookNook
            </Text>
            <Text className="text-gray-500 font-medium mt-1 text-center">
              Welcome back! Please sign in to continue
            </Text>
          </Animated.View>

          {/* Form Content */}
          <Animated.View style={formAnimatedStyle}>
            {generalError ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                <Text className="text-red-700 flex-1 font-medium text-sm">
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
              className="align-self-end mb-6"
              onPress={() => Alert.alert('Reset Password', 'An email password reset link will be built in the future.')}
            >
              <Text className="text-right font-semibold text-primary-600 text-sm">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              className="mb-5 py-3.5 rounded-xl shadow-sm"
            />

            {/* Divider */}
            <View className="flex-row items-center mb-5">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="text-gray-400 font-medium text-xs px-3 uppercase tracking-wider">
                Or Continue With
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
              className="mb-8 shadow-sm"
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
  );
};
