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
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
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
import { logInWithEmail, signInWithGoogle, sendPasswordReset } from '../../services/authService';
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

  // Forgot Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

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
      if (error.message === 'verification-pending') {
        showAlert(
          t('auth.verify_email_title', 'Verify Your Email'),
          t('auth.errors.email_not_verified', { email: data.email }),
          undefined,
          'warning'
        );
      } else {
        setGeneralError(error.message || t('auth.errors.default', 'Login failed. Please check your credentials.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      setResetError(t('auth.email_placeholder'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setResetError(t('auth.errors.invalid_email'));
      return;
    }

    setResetLoading(true);
    setResetError('');
    try {
      await sendPasswordReset(resetEmail.trim());
      setIsResetModalOpen(false);
      setResetEmail('');
      showAlert(
        t('auth.reset_email_sent_title'),
        t('auth.reset_email_sent_desc', { email: resetEmail.trim() }),
        undefined,
        'success'
      );
    } catch (error: any) {
      setResetError(error.message || t('auth.errors.default'));
    } finally {
      setResetLoading(false);
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
              className="w-full self-center"
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

              {/* Login Card */}
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
                className="bg-white/95 rounded-3xl p-6 shadow-xl"
              >
                <Text className="text-2xl font-black text-gray-800 mb-6">
                  {t('auth.sign_in')}
                </Text>

                {generalError ? (
                  <View className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5 flex-row items-center">
                    <Ionicons name="alert-circle" size={20} color={Colors.danger} />
                    <Text className="text-red-600 text-xs font-semibold ml-2.5 flex-1 leading-relaxed">
                      {generalError}
                    </Text>
                  </View>
                ) : null}

                {/* Form Input fields */}
                <FormInput
                  control={control}
                  name="email"
                  label={t('auth.email_address')}
                  placeholder={t('auth.email_placeholder')}
                  iconName="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  onPress={() => {
                    setResetEmail('');
                    setResetError('');
                    setIsResetModalOpen(true);
                  }}
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

                {/* Google Sign-in */}
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

      {/* Forgot Password Modal */}
      <Modal
        visible={isResetModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsResetModalOpen(false)}
      >
        <View style={StyleSheet.absoluteFill} className="bg-black/60 justify-center items-center px-6">
          <View 
            style={{ 
              width: '100%', 
              maxWidth: layout.isTablet ? 420 : undefined, 
              backgroundColor: Colors.white,
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-black text-gray-800">
                {t('auth.forgot_password_title')}
              </Text>
              <TouchableOpacity
                onPress={() => setIsResetModalOpen(false)}
                className="p-1.5 bg-gray-100 rounded-full"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              {t('auth.forgot_password_desc')}
            </Text>

            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                {t('auth.email_address')}
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50/50">
                <Ionicons name="mail-outline" size={20} color={Colors.gray[400]} />
                <TextInput
                  value={resetEmail}
                  onChangeText={(text) => {
                    setResetEmail(text);
                    if (resetError) setResetError('');
                  }}
                  placeholder={t('auth.email_placeholder')}
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 py-3 ml-3 text-sm font-bold text-gray-700 h-[48px]"
                  style={{ textAlignVertical: 'center' }}
                />
              </View>
              {resetError ? (
                <Text className="text-red-500 text-xs font-semibold mt-1.5 pl-1">
                  {resetError}
                </Text>
              ) : null}
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setIsResetModalOpen(false)}
                className="px-5 py-3 rounded-xl bg-gray-100 items-center justify-center mr-3"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-extrabold text-gray-600">
                  {t('auth.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handlePasswordReset}
                disabled={resetLoading}
                className="px-5 py-3 rounded-xl bg-amber-600 items-center justify-center flex-row shadow-sm active:bg-amber-700"
                activeOpacity={0.7}
              >
                {resetLoading ? (
                  <ActivityIndicator size="small" color={Colors.white} className="mr-2" />
                ) : null}
                <Text className="text-sm font-extrabold text-white">
                  {t('auth.send_link')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
