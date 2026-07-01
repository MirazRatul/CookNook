import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import * as ImagePicker from 'expo-image-picker';
import { addRecipe, setUploadStatus, clearUploadStatus } from '../store/slices/recipesSlice';
import { Recipe, CATEGORIES } from '../constants/mockData';
import { Button } from '../components/Button';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { AppTabScreenProps } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { IMAGE_URLS } from '../constants/Image_Url';
import { useAlert } from '../context/CustomAlertContext';
import { Colors } from '../constants/Colors';
import { createRecipeAPI } from '../services/recipeService';
import { Video } from 'react-native-compressor';
import { LoadingIndicator } from '../components/LoadingIndicator';

type CreateRecipeScreenProps = AppTabScreenProps<'Create'>;

export const CreateRecipeScreen: React.FC<CreateRecipeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const { showAlert } = useAlert();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const uploadStatus = useSelector((state: RootState) => state.recipes.uploadStatus);

  // Ingredients and Instructions state
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');

  const [instructions, setInstructions] = useState<string[]>([]);
  const [newInstruction, setNewInstruction] = useState('');

  // Gallery Image Picker
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        t('create.permission_denied_title', 'Permission Denied'),
        t('create.permission_gallery_desc', 'We need gallery permissions to let you select recipe photos.'),
        undefined,
        'error'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const pickedUris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...pickedUris]);
    }
  };

  // Camera Photo Picker
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        t('create.permission_denied_title', 'Permission Denied'),
        t('create.permission_camera_desc', 'We need camera permissions to let you snap recipe photos.'),
        undefined,
        'error'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      setImages(prev => [...prev, pickedUri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  // Video Picker from Gallery
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        t('create.permission_denied_title', 'Permission Denied'),
        t('create.permission_gallery_desc', 'We need gallery permissions to let you select a recipe video.'),
        undefined,
        'error'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideo(result.assets[0].uri);
    }
  };

  const removeVideo = () => {
    setVideo(null);
  };

  // Handle additions
  const handleAddIngredient = () => {
    if (newIngredient.trim() === '') return;
    setIngredients([...ingredients, newIngredient.trim()]);
    setNewIngredient('');
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim() === '') return;
    setInstructions([...instructions, newInstruction.trim()]);
    setNewInstruction('');
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, idx) => idx !== index));
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !duration || !calories) {
      showAlert(t('create.error_title', 'Error'), t('create.error_missing_fields'), undefined, 'error');
      return;
    }

    if (ingredients.length === 0) {
      showAlert(t('create.error_title', 'Error'), t('create.error_no_ingredients'), undefined, 'error');
      return;
    }

    if (instructions.length === 0) {
      showAlert(t('create.error_title', 'Error'), t('create.error_no_instructions'), undefined, 'error');
      return;
    }

    if (images.length === 0) {
      showAlert(
        t('create.error_title', 'Error'), 
        t('create.error_no_images', 'Please add at least one recipe photo.'), 
        undefined, 
        'error'
      );
      return;
    }

    const recipePayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      duration: parseInt(duration) || 0,
      calories: parseInt(calories) || 0,
      difficulty,
      ingredients,
      instructions,
      images,
      video,
    };

    // Dispatch initial background state
    dispatch(setUploadStatus({
      isUploading: true,
      progress: 0,
      statusText: t('create.preparing', 'Preparing recipe details...')
    }));

    // Reset Form fields immediately so the form clears!
    setTitle('');
    setDescription('');
    setCategory('Breakfast');
    setDuration('');
    setCalories('');
    setDifficulty('Easy');
    setIngredients([]);
    setInstructions([]);
    setImages([]);
    setVideo(null);

    // Redirect to Home immediately!
    navigation.navigate('Home');

    // Run the upload workflow in the background!
    (async () => {
      let finalVideoUri = recipePayload.video;
      try {
        if (recipePayload.video) {
          dispatch(setUploadStatus({
            isUploading: true,
            progress: 0,
            statusText: t('create.compressing_video_start', 'Compressing video: 0%')
          }));

          console.log('🎬 Starting optimized background client-side video compression...');
          let lastCompressPercent = -1;
          finalVideoUri = await Video.compress(
            recipePayload.video,
            {
              compressionMethod: 'manual',
              maxSize: 540, // 540p is optimized for mobile feeds and compresses 3x faster
              bitrate: 1000000, // 1.0Mbps keeps a 10-minute video under 75MB
              minimumFileSizeForCompress: 0,
            },
            (progress) => {
              const compPercent = Math.round(progress * 100);
              if (compPercent !== lastCompressPercent) {
                lastCompressPercent = compPercent;
                dispatch(setUploadStatus({
                  isUploading: true,
                  progress: Math.round(compPercent * 0.4), // Let compression represent first 40% of bar
                  statusText: t('create.compressing_video_progress', `Compressing video: ${compPercent}%`)
                }));
              }
            }
          );
        }

        dispatch(setUploadStatus({
          isUploading: true,
          progress: 40,
          statusText: t('create.uploading_data', 'Uploading details & files: 0%')
        }));

        let lastUploadPercent = -1;
        const response = await createRecipeAPI({
          ...recipePayload,
          video: finalVideoUri,
        }, (percentage) => {
          if (percentage !== lastUploadPercent) {
            lastUploadPercent = percentage;
            // Upload represents the remaining 60% of progress (from 40% to 100%)
            const overallProgress = Math.round(40 + (percentage * 0.6));
            dispatch(setUploadStatus({
              isUploading: true,
              progress: overallProgress,
              statusText: t('create.uploading_progress', `Uploading details & files: ${percentage}%`)
            }));
          }
        });

        if (response.success && response.data) {
          const categoryImages: Record<string, string> = IMAGE_URLS.categories;

          const newRecipe: Recipe = {
            id: response.data.id.toString(),
            title: response.data.title,
            description: response.data.description,
            image: response.data.images[0] || categoryImages[recipePayload.category] || categoryImages.Breakfast,
            duration: response.data.duration,
            difficulty: response.data.difficulty,
            calories: response.data.calories,
            rating: 5.0,
            reviewsCount: 1,
            chefName: response.data.chef_name,
            chefAvatar: response.data.chef_avatar || IMAGE_URLS.profiles.chefRatul,
            category: response.data.category,
            ingredients: response.data.ingredients,
            instructions: response.data.instructions,
            images: response.data.images,
            userId: response.data.user_id,
            videoUrl: response.data.video_url || (recipePayload.video ? 'processing' : undefined),
          };

          // Dispatch new recipe to home feed instantly
          dispatch(addRecipe(newRecipe));
          
          // Flash complete & clear
          dispatch(setUploadStatus({
            isUploading: true,
            progress: 100,
            statusText: t('create.upload_success', 'Success! Recipe shared.')
          }));

          setTimeout(() => {
            dispatch(clearUploadStatus());
          }, 2000);
        }
      } catch (error: any) {
        console.error('❌ Error publishing recipe in background:', error);
        dispatch(setUploadStatus({
          isUploading: true,
          progress: 0,
          statusText: '',
          error: error.message || 'Failed to share recipe. Tap to dismiss.'
        }));
      }
    })();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View
        className="pt-2"
        style={{
          paddingHorizontal: layout.spacing.screen,
          paddingBottom: insets.bottom + 104,
          width: '100%',
          maxWidth: layout.formMaxWidth,
          alignSelf: 'center',
        }}
      >
        <Text className="text-2xl font-black text-gray-900 mb-6">{t('create.create_recipe')}</Text>

        {/* Recipe Title */}
        <View className="mb-5">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.recipe_title')}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('create.title_placeholder')}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800"
            placeholderTextColor={Colors.gray[400]}
          />
        </View>

        {/* Recipe Description */}
        <View className="mb-5">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.description')}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('create.desc_placeholder')}
            multiline
            numberOfLines={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-left h-24"
            placeholderTextColor={Colors.gray[400]}
            style={{ textAlignVertical: 'top' }}
          />
        </View>

        {/* Category Dropdown/Chips */}
        <View className="mb-5">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.category')}</Text>
          <View className="flex-row flex-wrap">
            {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                activeOpacity={0.8}
                className={`px-4 py-2 border rounded-full mr-2.5 mb-2.5 ${
                  category === cat
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    category === cat ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recipe Photos Picker (Camera & Gallery) */}
        <View className="mb-6">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.images_label', 'Recipe Photos')}</Text>
          
          <View className="flex-row gap-3 mb-3.5">
            <TouchableOpacity
              onPress={takePhoto}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl py-3"
            >
              <Ionicons name="camera-outline" size={20} color={Colors.primary[600]} style={{ marginRight: 6 }} />
              <Text className="text-xs font-bold text-gray-600">{t('create.take_photo', 'Take Photo')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImages}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl py-3"
            >
              <Ionicons name="images-outline" size={20} color={Colors.primary[600]} style={{ marginRight: 6 }} />
              <Text className="text-xs font-bold text-gray-600">{t('create.choose_gallery', 'Add Images')}</Text>
            </TouchableOpacity>
          </View>

          {/* Picked Images Thumbnails */}
          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
              {images.map((uri, idx) => (
                <View key={idx} className="relative mr-3.5 mb-1.5">
                  <Image
                    source={{ uri }}
                    style={{ width: layout.scale(80), height: layout.scale(80) }}
                    className="rounded-2xl bg-gray-100 border border-gray-200"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    activeOpacity={0.8}
                    className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-100"
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recipe Video Picker (Optional) */}
        <View className="mb-6">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.video_label', 'Recipe Video (Optional)')}</Text>
          
          {!video ? (
            <TouchableOpacity
              onPress={pickVideo}
              activeOpacity={0.8}
              className="flex-row items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl py-4"
            >
              <Ionicons name="videocam-outline" size={22} color={Colors.primary[600]} style={{ marginRight: 8 }} />
              <Text className="text-xs font-bold text-gray-600">{t('create.add_video', 'Upload Recipe Video')}</Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-amber-50/65 border border-amber-100 rounded-2xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="bg-amber-500/10 p-2.5 rounded-xl mr-3">
                  <Ionicons name="videocam" size={24} color={Colors.primary[600]} />
                </View>
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-800">
                    {video.split('/').pop() || 'recipe_video.mp4'}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {t('create.video_ready', 'Video ready for optimized upload')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={removeVideo}
                activeOpacity={0.8}
                className="bg-white rounded-full p-1.5 shadow-sm border border-gray-100"
              >
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Cook Time, Calories, Difficulty Row */}
        <View
          className="mb-6"
          style={{
            flexDirection: layout.compactFormFields ? 'column' : 'row',
            gap: layout.compactFormFields ? 14 : 12,
          }}
        >
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.cook_time_mins')}</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder={t('create.cook_time_placeholder')}
              keyboardType="number-pad"
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-center font-bold"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.calories_label')}</Text>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              placeholder={t('create.calories_placeholder')}
              keyboardType="number-pad"
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-center font-bold"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.difficulty_label')}</Text>
            <View className="bg-gray-50 border border-gray-200 rounded-2xl flex-row overflow-hidden justify-between">
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => setDifficulty(diff)}
                  activeOpacity={0.8}
                  className={`flex-1 py-3.5 items-center justify-center ${
                    difficulty === diff ? 'bg-primary-500' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black ${
                      difficulty === diff ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {diff[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* INGREDIENTS LIST */}
        <View className="mb-6">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.ingredients_label')}</Text>
          <View className="flex-row mb-3">
            <TextInput
              value={newIngredient}
              onChangeText={setNewIngredient}
              placeholder={t('create.ingredient_placeholder')}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-l-2xl px-4 py-3.5 text-gray-800"
              placeholderTextColor={Colors.gray[400]}
            />
            <TouchableOpacity
              onPress={handleAddIngredient}
              activeOpacity={0.8}
              className="bg-primary-500 rounded-r-2xl px-4 justify-center items-center"
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* List items */}
          {ingredients.map((ing, idx) => (
            <View
              key={idx}
              className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3 mb-2"
            >
              <Text className="text-sm font-medium text-gray-700 flex-1">{ing}</Text>
              <TouchableOpacity onPress={() => handleRemoveIngredient(idx)}>
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* INSTRUCTIONS LIST */}
        <View className="mb-8">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">{t('create.instructions_label')}</Text>
          <View className="flex-row mb-3">
            <TextInput
              value={newInstruction}
              onChangeText={setNewInstruction}
              placeholder={t('create.instruction_placeholder')}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-l-2xl px-4 py-3.5 text-gray-800"
              placeholderTextColor={Colors.gray[400]}
            />
            <TouchableOpacity
              onPress={handleAddInstruction}
              activeOpacity={0.8}
              className="bg-primary-500 rounded-r-2xl px-4 justify-center items-center"
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* List items */}
          {instructions.map((step, idx) => (
            <View
              key={idx}
              className="flex-row items-start justify-between bg-gray-50 border border-gray-100 rounded-xl p-3 mb-2"
            >
              <Text className="text-sm font-bold text-primary-600 mr-2">{idx + 1}.</Text>
              <Text className="text-sm font-medium text-gray-700 flex-1">{step}</Text>
              <TouchableOpacity onPress={() => handleRemoveInstruction(idx)} className="mt-0.5 ml-2">
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* SUBMIT BUTTON */}
        <Button 
          title={t('create.share_recipe')} 
          onPress={handleCreate} 
          disabled={uploadStatus.isUploading}
          size="lg" 
          className="rounded-2xl" 
        />
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
