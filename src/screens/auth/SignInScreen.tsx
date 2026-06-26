import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RootStackScreenProps } from '../../navigation/types';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { SocialButton } from '../../components/SocialButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { logInWithEmail, signInWithGoogle } from '../../services/authService';
import { IMAGE_URLS, LOGO_IMAGE } from '../../constants/Image_Url';
import { useAlert } from '../../context/CustomAlertContext';
import { signInSchema } from '../../utils/validationSchemas';

export const SignInScreen: React.FC<RootStackScreenProps<'SignIn'>> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const layout = useResponsiveLayout();
  const { showAlert } = useAlert();
  
  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const params = route.params;

  useEffect(() => {
    if (params?.showVerificationAlert) {
      showAlert(
        t('auth.verify_email_title', 'Verify Your Email'),
        t('auth.verify_email_desc', { defaultValue: 'A verification link has been sent to {{email}}. Please verify your email before logging in.', email: params.email }),
        undefined,
        'success'
      );
      if (params.email) {
        setValue('email', params.email);
      }
      navigation.setParams({ showVerificationAlert: undefined, email: undefined });
    }
  }, [params]);
  
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

  const handleLogin = async (data: any) => {
    setLoading(true);
    setGeneralError('');
    try {
      await logInWithEmail(data.email, data.password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      if (error.message && error.message.includes('Verification pending')) {
        showAlert(
          'Email Verification',
          error.message,
          undefined,
          'warning'
        );
      } else {
        setGeneralError(error.message || 'Login failed. Please check your credentials.');
      }
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ImageBackground
        source={{ uri: IMAGE_URLS.onboarding.cook }}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Darkened overlay to make elements pop */}
        <View className="flex-1 bg-black/45">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: layout.spacing.screen,
              paddingVertical: layout.scale(20),
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View 
              style={{ maxWidth: layout.isTablet ? 460 : undefined }} 
              className="w-full self-center py-4"
            >
              {/* Logo & Header */}
              <Animated.View style={headerAnimatedStyle} className="items-center mb-6">
                <View 
                  style={{ width: layout.scale(64), height: layout.scale(64), borderRadius: layout.scale(14) }} 
                  className="bg-white/15 backdrop-blur-md justify-center items-center mb-2 shadow-inner border border-white/20 overflow-hidden"
                >
                  <Image 
                    source={LOGO_IMAGE} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                <Text className="text-3xl font-black text-white tracking-wider">
                  CookNook
                </Text>
                <Text className="text-amber-200/90 font-medium mt-1 text-center text-sm">
                  {t('auth.culinary_haven')}
                </Text>
              </Animated.View>

              {/* Glassmorphic Form Card */}
              <Animated.View 
                style={[
                  cardAnimatedStyle,
                  {
                    shadowColor: Colors.black,
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.15,
                    shadowRadius: 15,
                    elevation: 5,
                  }
                ]}
                className="bg-white/95 border border-white/20 rounded-[32px] p-6"
              >
                <Text className="text-xl font-extrabold text-gray-800 mb-5">
                  {t('auth.sign_in')}
                </Text>

                {generalError ? (
                  <View className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex-row items-center">
                    <Ionicons name="alert-circle" size={20} color={Colors.danger} style={{ marginRight: 8 }} />
                    <Text className="text-red-700 flex-1 font-medium text-xs">
                      {generalError}
                    </Text>
                  </View>
                ) : null}

                <FormInput
                  control={control}
                  name="email"
                  label={t('auth.email_address')}
                  placeholder={t('auth.email_placeholder')}
                  iconName="mail-outline"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <FormInput
                  control={control}
                  name="password"
                  label={t('auth.password')}
                  placeholder={t('auth.password_placeholder')}
                  iconName="lock-closed-outline"
                  isPassword
                  autoCapitalize="none"
                />

                <TouchableOpacity 
                  activeOpacity={0.7} 
                  className="self-end mb-5"
                  onPress={() => showAlert(t('auth.forgot_password'), t('auth.reset_password_desc', 'An email password reset link will be sent in the future.'), undefined, 'info')}
                >
                  <Text className="text-right font-bold text-primary-600 text-sm">
                    {t('auth.forgot_password')}
                  </Text>
                </TouchableOpacity>

                <Button
                  title={t('auth.sign_in')}
                  onPress={handleSubmit(handleLogin)}
                  loading={loading}
                  className="mb-4 py-3.5 rounded-xl shadow-sm bg-primary-500"
                />

                {/* Divider */}
                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-[1px] bg-gray-200" />
                  <Text className="text-gray-400 font-bold text-[10px] px-3 uppercase tracking-widest">
                    {t('auth.or_connect_with')}
                  </Text>
                  <View className="flex-1 h-[1px] bg-gray-200" />
                </View>

                {/* Google Sign-In */}
                <SocialButton
                  title={t('auth.sign_in_google')}
                  onPress={handleGoogleLogin}
                  iconName="logo-google"
                  iconColor={Colors.googleRed}
                  loading={googleLoading}
                  className="mb-5 shadow-sm"
                />

                {/* Footer */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-500 font-medium text-sm">
                    {t('auth.no_account')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('SignUp')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-primary-600 font-bold text-sm">
                      {t('auth.sign_up')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>

      {/* Custom Fullscreen Loading Indicator */}
      {(loading || googleLoading) && (
        <LoadingIndicator message={t('auth.signing_in')} />
      )}
    </KeyboardAvoidingView>
  );
};
