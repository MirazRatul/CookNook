import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../navigation/types';
import { Colors } from '../constants/Colors';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { IMAGE_URLS } from '../constants/Image_Url';

interface OnboardingSlide {
  key: string;
  title: string;
  description: string;
  image: string;
  icon: string;
}

const slides: OnboardingSlide[] = [
  {
    key: '1',
    title: 'Discover Recipes',
    description: 'Find your next culinary adventure from our curated selection of gourmet recipes and secret chef preparations.',
    image: IMAGE_URLS.onboarding.discover,
    icon: 'restaurant-outline',
  },
  {
    key: '2',
    title: 'Cook Like a Pro',
    description: 'Follow clean, step-by-step instructions designed to scale beautifully on both phones and tablets.',
    image: IMAGE_URLS.onboarding.cook,
    icon: 'book-outline',
  },
  {
    key: '3',
    title: 'Share Your Creations',
    description: 'Publish your own custom recipes, build your digital cook book, and share the joy of food with others.',
    image: IMAGE_URLS.onboarding.share,
    icon: 'share-social-outline',
  },
];

export const OnboardingScreen: React.FC<RootStackScreenProps<'Onboarding'>> = ({ navigation }) => {
  const { t } = useTranslation();
  const layout = useResponsiveLayout();
  const imageHeight = layout.height * 0.52;
  const iconSize = layout.scale(28);
  const titleSize = layout.scale(26);
  const descSize = layout.scale(14);
  const buttonSize = layout.scale(48);
  const buttonIconSize = layout.scale(22);
  const skipTextSize = layout.scale(15);

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('HAS_SEEN_ONBOARDING', 'true');
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Fallback navigation in case storage fails
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View className="flex-1 bg-white">
        {/* Curved Header Image */}
        <View style={{ height: imageHeight }} className="w-full rounded-b-[40px] overflow-hidden bg-gray-100">
          <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
        </View>

        {/* Description & Icon Card */}
        <View 
          style={{ 
            paddingHorizontal: layout.spacing.screen, 
            maxWidth: layout.isTablet ? 480 : undefined 
          }} 
          className="flex-1 pt-9 items-center self-center"
        >
          <View 
            style={{ width: layout.scale(60), height: layout.scale(60), borderRadius: layout.scale(30) }} 
            className="bg-amber-50 justify-center items-center mb-4"
          >
            <Ionicons name={item.icon as any} size={iconSize} color={Colors.primary[600]} />
          </View>
          <Text style={{ fontSize: titleSize }} className="font-black text-gray-800 text-center mb-3">
            {t(`onboarding.slide${item.key}_title`)}
          </Text>
          <Text style={{ fontSize: descSize, lineHeight: layout.scale(22) }} className="text-gray-500 text-center font-medium">
            {t(`onboarding.slide${item.key}_desc`)}
          </Text>
        </View>
      </View>
    );
  };

  const renderNextButton = () => (
    <View 
      style={{ width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }} 
      className="bg-amber-600 justify-center items-center mr-1 shadow-md"
    >
      <Ionicons name="arrow-forward" size={buttonIconSize} color={Colors.white} />
    </View>
  );

  const renderDoneButton = () => (
    <View 
      style={{ width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }} 
      className="bg-amber-600 justify-center items-center mr-1 shadow-md"
    >
      <Ionicons name="checkmark" size={buttonIconSize} color={Colors.white} />
    </View>
  );

  const renderSkipButton = () => (
    <View style={{ height: buttonSize }} className="justify-center items-center ml-1">
      <Text style={{ fontSize: skipTextSize }} className="text-gray-500 font-bold">{t('onboarding.skip')}</Text>
    </View>
  );

  const dotWidth = layout.scale(8);
  const activeDotWidth = layout.scale(24);
  const dotHeight = layout.scale(8);

  const dotStyle = {
    backgroundColor: Colors.gray[200],
    width: dotWidth,
    height: dotHeight,
    borderRadius: dotHeight / 2,
    marginHorizontal: 4,
  };

  const activeDotStyle = {
    backgroundColor: Colors.primary[600],
    width: activeDotWidth,
    height: dotHeight,
    borderRadius: dotHeight / 2,
    marginHorizontal: 4,
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom', 'left', 'right']}>
      <AppIntroSlider
        data={slides}
        renderItem={renderSlide}
        onDone={handleFinish}
        onSkip={handleFinish}
        showSkipButton
        renderNextButton={renderNextButton}
        renderDoneButton={renderDoneButton}
        renderSkipButton={renderSkipButton}
        dotStyle={dotStyle}
        activeDotStyle={activeDotStyle}
      />
    </SafeAreaView>
  );
};
