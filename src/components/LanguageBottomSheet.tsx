import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

interface LanguageBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHEET_HEIGHT = 280;

export const LanguageBottomSheet: React.FC<LanguageBottomSheetProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [shouldRender, setShouldRender] = React.useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      progress.value = withTiming(1, { duration: 300 });
    } else {
      progress.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [isOpen]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value * 0.5,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: (1 - progress.value) * SHEET_HEIGHT,
        },
      ],
    };
  });

  const handleLanguageChange = async (langCode: string) => {
    try {
      await i18n.changeLanguage(langCode);
      await AsyncStorage.setItem('APP_LANGUAGE', langCode);
      onClose();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  if (!shouldRender) return null;

  const currentLang = i18n.language || 'en';

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 99999 }]} pointerEvents="box-none">
      {/* Dimmed Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: SHEET_HEIGHT,
            backgroundColor: Colors.white,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 24,
            paddingTop: 16,
          },
          sheetStyle,
        ]}
        className="shadow-2xl border-t border-gray-100"
      >
        {/* Handle Bar */}
        <View className="w-12 h-1.5 bg-gray-200 rounded-full mb-6 self-center" />

        {/* Title */}
        <Text className="text-xl font-black text-gray-800 mb-6 text-center">
          {t('drawer.select_language')}
        </Text>

        {/* Language Options */}
        <View>
          {/* English Option */}
          <TouchableOpacity
            onPress={() => handleLanguageChange('en')}
            className={`flex-row items-center p-4 rounded-2xl border ${
              currentLang.startsWith('en')
                ? 'border-amber-500 bg-amber-50/40'
                : 'border-gray-100 bg-gray-50/50'
            }`}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-4">
              <Text className="text-base">🇺🇸</Text>
            </View>
            <Text className={`text-sm font-extrabold flex-1 ${
              currentLang.startsWith('en') ? 'text-amber-600' : 'text-gray-700'
            }`}>
              {t('drawer.english')}
            </Text>
            {currentLang.startsWith('en') && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary[600]} />
            )}
          </TouchableOpacity>

          {/* Spanish Option */}
          <TouchableOpacity
            onPress={() => handleLanguageChange('es')}
            className={`flex-row items-center p-4 rounded-2xl border mt-3 ${
              currentLang.startsWith('es')
                ? 'border-amber-500 bg-amber-50/40'
                : 'border-gray-100 bg-gray-50/50'
            }`}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center mr-4">
              <Text className="text-base">🇪🇸</Text>
            </View>
            <Text className={`text-sm font-extrabold flex-1 ${
              currentLang.startsWith('es') ? 'text-amber-600' : 'text-gray-700'
            }`}>
              {t('drawer.spanish')}
            </Text>
            {currentLang.startsWith('es') && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary[600]} />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};
