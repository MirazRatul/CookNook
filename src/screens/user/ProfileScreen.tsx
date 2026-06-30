import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { updateChefProfile } from '../../store/slices/recipesSlice';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { BottomSheet } from '../../components/BottomSheet';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useAlert } from '../../context/CustomAlertContext';
import { auth } from '../../services/firebase';
import { getUserProfileAPI, updateUserProfileAPI } from '../../services/userService';
import { IMAGE_URLS } from '../../constants/Image_Url';

const COUNTRY_CODES = [
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+1', name: 'United States/Canada', flag: '🇺🇸' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
];

const parsePhoneNumber = (fullNumber: string) => {
  if (!fullNumber) return { countryCode: '+880', nationalNumber: '' };
  // Sort country codes by length descending to match longer prefix first
  const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sortedCodes) {
    if (fullNumber.startsWith(c.code)) {
      return {
        countryCode: c.code,
        nationalNumber: fullNumber.slice(c.code.length),
      };
    }
  }
  return {
    countryCode: '+880',
    nationalNumber: fullNumber,
  };
};

export const ProfileScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const { showAlert } = useAlert();
  const dispatch = useDispatch();
  const isUploading = useSelector((state: RootState) => state.recipes.uploadStatus.isUploading);

  // Core Form States
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialty, setSpecialty] = useState('');

  // Country Code Picker States
  const [selectedCountryCode, setSelectedCountryCode] = useState('+880');
  const [isCountrySheetOpen, setIsCountrySheetOpen] = useState(false);
  const [isMobileFocused, setIsMobileFocused] = useState(false);
  
  // Profile Picture States
  // Can be a remote URL (string starting with http) or a local picked URI (string)
  const [profilePic, setProfilePic] = useState<string | null>(null);
  
  // Loading & Action Locks
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await getUserProfileAPI();
      if (response.success && response.data) {
        setName(response.data.name || '');
        
        // Parse database number into code and local number
        const { countryCode, nationalNumber } = parsePhoneNumber(response.data.mobile || '');
        setSelectedCountryCode(countryCode);
        setMobile(nationalNumber);

        setBio(response.data.bio || '');
        setAddress(response.data.address || '');
        setExperienceYears(response.data.experience_years ? response.data.experience_years.toString() : '');
        setSpecialty(response.data.specialty || '');
        setProfilePic(response.data.profile_pic);
      }
    } catch (error: any) {
      console.log('⚠️ Failed to load profile, using fallback defaults:', error.message);
      // Fallback: Populate defaults from current Firebase user
      const currentUser = auth().currentUser;
      if (currentUser) {
        setName(currentUser.displayName || '');
        setProfilePic(currentUser.photoURL || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Image Source Selection Modal or Alert option sheet
  const handleImageOptionPress = () => {
    showAlert(
      t('profile.image_source_title', 'Profile Photo'),
      t('profile.image_source_desc', 'Select how you want to add your profile photo.'),
      [
        {
          text: t('profile.camera', 'Take Photo'),
          onPress: takePhoto,
        },
        {
          text: t('profile.gallery', 'Choose from Gallery'),
          onPress: pickFromGallery,
        },
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
      ],
      'info'
    );
  };

  // Camera Picker
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        t('common.permission_denied', 'Permission Denied'),
        t('profile.camera_permission_desc', 'We need camera permissions to snap a profile photo.'),
        undefined,
        'error'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  // Gallery Picker
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        t('common.permission_denied', 'Permission Denied'),
        t('profile.gallery_permission_desc', 'We need photo library permissions to select a profile photo.'),
        undefined,
        'error'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!name.trim()) {
      showAlert(t('common.error', 'Error'), t('profile.error_name_required', 'Chef Name is a mandatory field.'), undefined, 'error');
      return;
    }

    if (!mobile.trim()) {
      showAlert(t('common.error', 'Error'), t('profile.error_mobile_required', 'Mobile number is a mandatory field.'), undefined, 'error');
      return;
    }

    if (!profilePic) {
      showAlert(t('common.error', 'Error'), t('profile.error_image_required', 'Please upload a profile picture.'), undefined, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const fullMobile = selectedCountryCode + mobile.trim();
      const isLocalFile = !profilePic.startsWith('http');
      const payload = {
        name: name.trim(),
        mobile: fullMobile,
        bio: bio.trim(),
        address: address.trim(),
        experience_years: experienceYears.trim(),
        specialty: specialty.trim(),
        profile_pic: isLocalFile ? profilePic : undefined,
      };

      const response = await updateUserProfileAPI(payload);
      if (response.success && response.data) {
        // Sync local Redux store recipes to instantly update names/photos on all screens
        dispatch(
          updateChefProfile({
            chefName: response.data.name,
            chefAvatar: response.data.profile_pic || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c',
            userId: response.data.id,
          })
        );

        // Sync profile details to the Firebase Auth user profile
        const currentUser = auth().currentUser;
        if (currentUser) {
          await currentUser.updateProfile({
            displayName: response.data.name,
            photoURL: response.data.profile_pic || undefined,
          });
          // Force reload to refresh local auth cache references
          await currentUser.reload();
        }

        showAlert(
          t('common.success', 'Success'),
          t('profile.success_update', 'Profile updated successfully!'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
          'success'
        );
      }
    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      showAlert(
        t('common.error', 'Error'),
        error.message || 'Failed to save profile. Please try again.',
        undefined,
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator message={t('profile.loading', 'Loading profile details...')} fullscreen={true} />;
  }

  // Get image source dynamically
  const imageSource = profilePic
    ? { uri: profilePic }
    : { uri: IMAGE_URLS.profiles.chefRatul };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === selectedCountryCode) || COUNTRY_CODES[0];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={isUploading ? ['left', 'right'] : ['top', 'left', 'right']}>
      {/* Premium Header */}
      <View
        className="flex-row items-center justify-between pb-4 border-b border-gray-100"
        style={{ paddingHorizontal: layout.spacing.screen }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 bg-gray-50 border border-gray-100 rounded-full"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.gray[800]} />
        </TouchableOpacity>
        <Text className="text-lg font-black text-gray-900">{t('profile.title', 'Chef Profile')}</Text>
        <View className="w-10 h-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View
            className="pt-6"
            style={{
              paddingHorizontal: layout.spacing.screen,
              paddingBottom: insets.bottom + 48,
              width: '100%',
              maxWidth: layout.formMaxWidth,
              alignSelf: 'center',
            }}
          >
            {/* Interactive Profile Photo Section */}
            <View className="items-center mb-6">
              <View className="relative shadow-xl">
                <Image
                  source={imageSource}
                  style={{ width: layout.scale(100), height: layout.scale(100) }}
                  className="rounded-full border-4 border-amber-100 bg-gray-50"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={handleImageOptionPress}
                  activeOpacity={0.85}
                  className="absolute bottom-0 right-0 bg-primary-500 w-9 h-9 rounded-full border-2 border-white items-center justify-center shadow-lg"
                >
                  <Ionicons name="camera" size={16} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-400 text-xs font-bold mt-2.5">
                {t('profile.upload_prompt', 'Tap the camera to update photo')}
              </Text>
            </View>

            {/* Profile Fields Cards */}
            <View className="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 mb-6">
              
              {/* Chef Name Field */}
              <Input
                label={t('profile.name_label', 'Chef Name') + ' *'}
                value={name}
                onChangeText={setName}
                placeholder={t('profile.name_placeholder', 'Enter your name')}
              />

              {/* Row for Mobile & Experience Labels */}
              <View className="flex-row mb-1.5" style={{ gap: 12 }}>
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium text-sm">
                    {t('profile.mobile_label', 'Mobile Number')} <Text className="text-red-500">*</Text>
                  </Text>
                </View>
                <View style={{ width: layout.scale(95) }}>
                  <Text className="text-gray-700 font-medium text-sm text-center" numberOfLines={1}>
                    {t('profile.experience_short', 'Exp (Yrs)')}
                  </Text>
                </View>
              </View>

              {/* Row for Mobile & Experience Inputs */}
              <View className="flex-row mb-4" style={{ gap: 12 }}>
                {/* Mobile & Country Code Box */}
                <View 
                  className={`flex-row items-center border rounded-xl px-3 bg-gray-50 h-12 flex-1 transition-colors ${
                    isMobileFocused ? 'border-primary-500 bg-white border-2' : 'border-gray-200'
                  }`}
                >
                  <TouchableOpacity
                    onPress={() => setIsCountrySheetOpen(true)}
                    activeOpacity={0.7}
                    className="flex-row items-center pr-2.5 mr-2.5 border-r border-gray-200 h-full"
                  >
                    <Text className="text-sm mr-1">{selectedCountry.flag}</Text>
                    <Text className="text-sm font-semibold text-gray-800">{selectedCountry.code}</Text>
                    <Ionicons name="chevron-down" size={10} color={Colors.gray[500]} style={{ marginLeft: 3 }} />
                  </TouchableOpacity>

                  <TextInput
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    placeholder={t('profile.mobile_placeholder', 'Enter mobile no')}
                    className="flex-1 text-gray-800 text-[14px] p-0"
                    placeholderTextColor={Colors.gray[400]}
                    onFocus={() => setIsMobileFocused(true)}
                    onBlur={() => setIsMobileFocused(false)}
                  />
                </View>

                {/* Experience Box */}
                <View style={{ width: layout.scale(95) }}>
                  <Input
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                    keyboardType="number-pad"
                    placeholder="e.g. 5"
                    style={{ textAlign: 'center' }}
                    className="mb-0"
                  />
                </View>
              </View>

              {/* Specialty Field */}
              <Input
                label={t('profile.specialty_label', 'Culinary Specialty')}
                value={specialty}
                onChangeText={setSpecialty}
                placeholder={t('profile.specialty_placeholder', 'e.g., Italian, Desserts, Vegan')}
              />

              {/* Address Field */}
              <Input
                label={t('profile.address_label', 'Kitchen Location / Address')}
                value={address}
                onChangeText={setAddress}
                placeholder={t('profile.address_placeholder', 'Enter city or street address')}
              />

              {/* Bio Field */}
              <Input
                label={t('profile.bio_label', 'Bio / Cook Story')}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={2}
                placeholder={t('profile.bio_placeholder', 'Write a short story about your culinary journey...')}
                className="mb-1"
              />

            </View>

            {/* SAVE BUTTON */}
            <Button
              title={isSaving ? t('common.saving', 'Saving Changes...') : t('profile.save_button', 'Save Profile')}
              onPress={handleSave}
              loading={isSaving}
              size="lg"
              className="rounded-2xl"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Picker Bottom Sheet */}
      <BottomSheet
        isOpen={isCountrySheetOpen}
        onClose={() => setIsCountrySheetOpen(false)}
        title={t('profile.select_country_code', 'Select Country')}
        sheetHeight={400}
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {COUNTRY_CODES.map((country) => (
            <TouchableOpacity
              key={country.code + country.name}
              onPress={() => {
                setSelectedCountryCode(country.code);
                setIsCountrySheetOpen(false);
              }}
              className={`flex-row items-center justify-between py-3.5 border-b border-gray-50 ${
                selectedCountryCode === country.code ? 'bg-amber-50/40 rounded-xl px-2' : ''
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">{country.flag}</Text>
                <Text className="text-sm font-semibold text-gray-800">{country.name}</Text>
              </View>
              <Text className="text-sm font-black text-primary-600">{country.code}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>

      {/* Fullscreen blur loading indicator on save */}
      {isSaving && (
        <LoadingIndicator message={t('profile.saving_message', 'Saving profile details...')} fullscreen={true} />
      )}
    </SafeAreaView>
  );
};
