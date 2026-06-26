import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { BottomSheet } from './BottomSheet';

interface LanguageBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageBottomSheet: React.FC<LanguageBottomSheetProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (langCode: string) => {
    try {
      await i18n.changeLanguage(langCode);
      await AsyncStorage.setItem('APP_LANGUAGE', langCode);
      onClose();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLang = i18n.language || 'en';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('drawer.select_language')}
      sheetHeight={280}
    >
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
    </BottomSheet>
  );
};
