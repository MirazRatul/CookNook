import React from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  FadeInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { IMAGE_URLS } from '../constants/Image_Url';
import { useDispatch } from 'react-redux';
import { auth } from '../services/firebase';
import { logOutUser } from '../services/authService';
import { clearUserSessionState as clearRecipesSessionState } from '../store/slices/recipesSlice';
import { clearUserSessionState as clearFavoritesSessionState } from '../store/slices/favoritesSlice';
import { clearUserSessionState as clearLikesSessionState } from '../store/slices/likesSlice';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCreate: () => void;
  onOpenLanguageSheet: () => void;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToCreate,
  onOpenLanguageSheet,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const progress = useSharedValue(0);
  const [shouldRender, setShouldRender] = React.useState(isOpen);
  const [isSettingsExpanded, setIsSettingsExpanded] = React.useState(false);

  // Get current Firebase user details
  const currentUser = auth().currentUser;
  const userDisplayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Chef User';
  const userEmail = currentUser?.email || 'user@cooknook.com';
  const userPhoto = currentUser?.photoURL ? { uri: currentUser.photoURL } : { uri: IMAGE_URLS.profiles.chefRatul };

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      progress.value = withTiming(1, { duration: 300 });
    } else {
      progress.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
      // Reset settings expansion when drawer closes
      setIsSettingsExpanded(false);
    }
  }, [isOpen]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
    };
  });

  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: (1 - progress.value) * DRAWER_WIDTH,
        },
      ],
    };
  });

  if (!shouldRender) return null;

  const menuItems = [
    { id: 0, label: t('drawer.profile', 'Profile'), icon: 'person-outline', onPress: () => { onClose(); navigation.navigate('Profile'); } },
    { id: 1, label: t('drawer.my_recipes', 'My Recipes'), icon: 'book-outline', onPress: () => { onClose(); navigation.navigate('UserRecipe'); } },
    { id: 2, label: t('drawer.create_new_recipe'), icon: 'add-circle-outline', onPress: () => { onClose(); onNavigateToCreate(); } },
    { id: 3, label: t('drawer.settings'), icon: 'settings-outline', onPress: () => setIsSettingsExpanded(!isSettingsExpanded) },
    { id: 4, label: t('drawer.help_feedback'), icon: 'help-circle-outline', onPress: onClose },
    {
      id: 5,
      label: t('drawer.logout'),
      icon: 'log-out-outline',
      onPress: async () => {
        onClose();
        try {
          await logOutUser();
          dispatch(clearRecipesSessionState());
          dispatch(clearFavoritesSessionState());
          dispatch(clearLikesSessionState());
          navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }],
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
      isDanger: true,
    },
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} pointerEvents="box-none">
      {/* Dimmed Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: Colors.backdrop }, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer Content Panel */}
      <Animated.View
        className="shadow-2xl border-l border-gray-100"
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            backgroundColor: Colors.white,
            width: DRAWER_WIDTH,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 20,
          },
          drawerStyle,
        ]}
      >
        {/* Profile Card */}
        <TouchableOpacity
          onPress={() => { onClose(); navigation.navigate('Profile'); }}
          activeOpacity={0.9}
          className="px-6 pb-6 border-b border-gray-100"
        >
          <View className="flex-row justify-between items-center">
            <View className="relative">
              <Image
                source={userPhoto}
                className="w-20 h-20 rounded-full border-4 border-amber-50 shadow-md"
              />
              <View className="absolute bottom-0 right-0 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white items-center justify-center">
                <View className="w-1.5 h-1.5 rounded-full bg-white" />
              </View>
            </View>
 
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-gray-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={Colors.gray[700]} />
            </TouchableOpacity>
          </View>
 
          <Text className="text-xl font-black text-gray-900 mt-4">
            {userDisplayName}
          </Text>
          <Text className="text-xs font-semibold text-gray-400 mt-0.5">
            {userEmail}
          </Text>
        </TouchableOpacity>

        {/* Stats Row */}
        <View className="flex-row justify-between px-6 py-5 border-b border-gray-100">
          <View className="items-center flex-1">
            <Text className="text-lg font-black text-gray-800">12</Text>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{t('drawer.recipes_count')}</Text>
          </View>
          <View className="w-[1px] h-6 bg-gray-100 self-center" />
          <View className="items-center flex-1">
            <Text className="text-lg font-black text-gray-800">4.8k</Text>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{t('drawer.likes_count')}</Text>
          </View>
          <View className="w-[1px] h-6 bg-gray-100 self-center" />
          <View className="items-center flex-1">
            <Text className="text-lg font-black text-gray-800">32</Text>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{t('drawer.followers_count')}</Text>
          </View>
        </View>

        {/* Menu Items List */}
        <View className="flex-1 px-4 mt-6">
          {menuItems.map((item) => (
            <View key={item.id}>
              <TouchableOpacity
                onPress={item.onPress}
                className="flex-row items-center p-3.5 rounded-2xl mb-1.5 active:bg-gray-50"
                activeOpacity={0.7}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    item.isDanger ? 'bg-red-50' : 'bg-amber-50'
                  }`}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={item.isDanger ? Colors.danger : Colors.primary[600]}
                  />
                </View>
                <Text
                  className={`text-sm font-extrabold ml-4 flex-1 ${
                    item.isDanger ? 'text-red-500' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name={
                    item.id === 3
                      ? isSettingsExpanded
                        ? 'chevron-down'
                        : 'chevron-forward'
                      : 'chevron-forward'
                  }
                  size={14}
                  color={item.isDanger ? Colors.dangerLight : Colors.gray[400]}
                />
              </TouchableOpacity>

              {/* Settings Sub-items */}
              {item.id === 3 && isSettingsExpanded && (
                <Animated.View 
                  entering={FadeInDown.duration(200)}
                  className="pl-14 pr-4 mb-2"
                >
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onOpenLanguageSheet();
                    }}
                    className="flex-row items-center py-2.5 active:opacity-70"
                  >
                    <Ionicons name="globe-outline" size={16} color={Colors.gray[500]} />
                    <Text className="text-sm font-semibold text-gray-600 ml-3 flex-1">
                      {t('drawer.language')}
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color={Colors.gray[400]} />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};
