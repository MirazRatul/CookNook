import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertContextType {
  showAlert: (
    title: string,
    message: string,
    buttons?: AlertButton[],
    variant?: AlertVariant
  ) => void;
  hideAlert: () => void;
}

const CustomAlertContext = createContext<CustomAlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(CustomAlertContext);
  if (!context) {
    throw new Error('useAlert must be used within a CustomAlertProvider');
  }
  return context;
};

const VARIANT_CONFIGS = {
  success: {
    iconName: 'checkmark-circle-outline' as const,
    iconColor: '#10B981', // emerald-500
    iconBg: 'bg-emerald-50/80 border border-emerald-100/50',
    buttonBg: 'bg-emerald-500',
    accentColor: '#10B981',
  },
  error: {
    iconName: 'alert-circle-outline' as const,
    iconColor: '#EF4444', // rose-500
    iconBg: 'bg-rose-50/80 border border-rose-100/50',
    buttonBg: 'bg-rose-500',
    accentColor: '#EF4444',
  },
  warning: {
    iconName: 'warning-outline' as const,
    iconColor: '#D97706', // primary-600
    iconBg: 'bg-amber-50/80 border border-amber-100/50',
    buttonBg: 'bg-amber-600',
    accentColor: '#D97706',
  },
  info: {
    iconName: 'restaurant-outline' as const, // culinary branding icon
    iconColor: '#F59E0B', // primary-500
    iconBg: 'bg-amber-50/80 border border-amber-100/50',
    buttonBg: 'bg-primary-500',
    accentColor: '#F59E0B',
  },
};

export const CustomAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<AlertButton[]>([]);
  const [variant, setVariant] = useState<AlertVariant>('info');

  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.96);
  const cardOpacity = useSharedValue(0);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const animateIn = () => {
    backdropOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
    cardScale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
    cardOpacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
  };

  const animateOut = (callback?: () => void) => {
    backdropOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) });
    cardScale.value = withTiming(0.96, { duration: 200, easing: Easing.in(Easing.quad) });
    cardOpacity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) }, () => {
      runOnJS(cleanup)(callback);
    });
  };

  const cleanup = (callback?: () => void) => {
    setVisible(false);
    setTitle('');
    setMessage('');
    setButtons([]);
    setVariant('info');
    backdropOpacity.value = 0;
    cardScale.value = 0.96;
    cardOpacity.value = 0;
    if (callback) {
      callback();
    }
  };

  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible]);

  const showAlert = useCallback((
    newTitle: string,
    newMessage: string,
    newButtons?: AlertButton[],
    newVariant?: AlertVariant
  ) => {
    setTitle(newTitle);
    setMessage(newMessage);
    setButtons(newButtons || [{ text: 'OK' }]);

    let detectedVariant: AlertVariant = newVariant || 'info';
    if (!newVariant) {
      const lowerTitle = newTitle.toLowerCase();
      if (lowerTitle.includes('error') || lowerTitle.includes('fail') || lowerTitle.includes('invalid')) {
        detectedVariant = 'error';
      } else if (lowerTitle.includes('success') || lowerTitle.includes('done') || lowerTitle.includes('share') || lowerTitle.includes('shared')) {
        detectedVariant = 'success';
      } else if (lowerTitle.includes('warning') || lowerTitle.includes('alert')) {
        detectedVariant = 'warning';
      }
    }
    setVariant(detectedVariant);

    backdropOpacity.value = 0;
    cardScale.value = 0.96;
    cardOpacity.value = 0;
    setVisible(true);
  }, [backdropOpacity, cardScale, cardOpacity]);

  const hideAlert = useCallback(() => {
    animateOut();
  }, []);

  const handleButtonPress = (onPress?: () => void) => {
    animateOut(onPress);
  };

  const handleBackPress = () => {
    const cancelButton = buttons.find(b => b.style === 'cancel');
    if (cancelButton && cancelButton.onPress) {
      handleButtonPress(cancelButton.onPress);
    } else {
      hideAlert();
    }
    return true;
  };

  const config = VARIANT_CONFIGS[variant];

  return (
    <CustomAlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={handleBackPress}
        statusBarTranslucent
      >
        <View className="flex-1 justify-center items-center px-6">
          {/* Warm dimmed backdrop overlay */}
          <Animated.View
            style={[StyleSheet.absoluteFill, backdropStyle, { backgroundColor: 'rgba(12, 10, 9, 0.5)' }]}
          />

          {/* Premium Glassmorphic Card Dialog */}
          <Animated.View
            style={[
              cardStyle,
              {
                shadowColor: '#78350f', // Warm dark amber shadow
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.08,
                shadowRadius: 24,
                elevation: 8,
              }
            ]}
            className="w-full max-w-[340px] bg-white rounded-[32px] p-6 items-center border border-amber-500/10"
          >
            <View className={`w-16 h-16 rounded-full items-center justify-center ${config.iconBg} mb-4 border border-white/40`}>
              <Ionicons name={config.iconName} size={28} color={config.iconColor} />
            </View>

            <Text className="text-xl font-black text-slate-800 text-center px-2">
              {title}
            </Text>
            <Text className="text-sm font-medium text-slate-600 mt-2 px-1 text-center leading-relaxed mb-6">
              {message}
            </Text>

            {buttons.length === 1 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleButtonPress(buttons[0].onPress)}
                className={`w-full py-3.5 rounded-2xl items-center justify-center ${config.buttonBg} shadow-sm`}
              >
                <Text className="text-white font-extrabold text-base">
                  {buttons[0].text}
                </Text>
              </TouchableOpacity>
            )}

            {buttons.length === 2 && (
              <View className="flex-row w-full gap-3">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleButtonPress(buttons[0].onPress)}
                  className="flex-1 py-3.5 bg-slate-100 rounded-2xl items-center justify-center"
                >
                  <Text className="text-slate-600 font-bold text-sm">
                    {buttons[0].text}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleButtonPress(buttons[1].onPress)}
                  className={`flex-1 py-3.5 ${config.buttonBg} rounded-2xl items-center justify-center shadow-sm`}
                >
                  <Text className="text-white font-extrabold text-sm">
                    {buttons[1].text}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {buttons.length > 2 && (
              <View className="w-full gap-2.5">
                {buttons.map((btn, idx) => {
                  const isPrimary = idx === buttons.length - 1;
                  const isDestructive = btn.style === 'destructive';
                  const bgClass = isDestructive
                    ? 'bg-rose-500'
                    : isPrimary
                    ? config.buttonBg
                    : 'bg-slate-100';
                  const textClass = isDestructive || isPrimary ? 'text-white' : 'text-slate-600';

                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      onPress={() => handleButtonPress(btn.onPress)}
                      className={`w-full py-3.5 rounded-2xl items-center justify-center ${bgClass}`}
                    >
                      <Text className={`${textClass} font-extrabold text-sm`}>
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </CustomAlertContext.Provider>
  );
};
