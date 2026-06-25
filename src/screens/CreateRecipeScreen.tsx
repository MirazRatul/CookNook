import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { addRecipe } from '../store/slices/recipesSlice';
import { Recipe, CATEGORIES } from '../constants/mockData';
import { Button } from '../components/Button';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { AppTabScreenProps } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { IMAGE_URLS } from '../constants/Image_Url';

type CreateRecipeScreenProps = AppTabScreenProps<'Create'>;

export const CreateRecipeScreen: React.FC<CreateRecipeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');

  // Ingredients and Instructions state
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');

  const [instructions, setInstructions] = useState<string[]>([]);
  const [newInstruction, setNewInstruction] = useState('');

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

  const handleCreate = () => {
    if (!title.trim() || !description.trim() || !duration || !calories) {
      Alert.alert('Error', 'Please fill in all core fields.');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient.');
      return;
    }

    if (instructions.length === 0) {
      Alert.alert('Error', 'Please add at least one instruction step.');
      return;
    }

    const categoryImages: Record<string, string> = IMAGE_URLS.categories;

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      image: categoryImages[category] || categoryImages.Breakfast,
      duration: parseInt(duration),
      difficulty,
      calories: parseInt(calories),
      rating: 5.0,
      reviewsCount: 1,
      chefName: 'Chef You',
      chefAvatar: IMAGE_URLS.profiles.chefRatul,
      category,
      ingredients,
      instructions,
    };

    dispatch(addRecipe(newRecipe));

    // Reset Form
    setTitle('');
    setDescription('');
    setCategory('Breakfast');
    setDuration('');
    setCalories('');
    setDifficulty('Easy');
    setIngredients([]);
    setInstructions([]);

    Alert.alert('Success', 'Your delicious recipe has been shared!');
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
        <Text className="text-2xl font-black text-gray-900 mb-6">Create a Recipe</Text>

        {/* Recipe Title */}
        <View className="mb-5">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">Recipe Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Creamy Tuscan Pasta"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Recipe Description */}
        <View className="mb-5">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us about your culinary creation..."
            multiline
            numberOfLines={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-left h-24"
            placeholderTextColor="#9ca3af"
            style={{ textAlignVertical: 'top' }}
          />
        </View>

        {/* Category Dropdown/Chips */}
        <View className="mb-5">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">Category</Text>
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

        {/* Cook Time, Calories, Difficulty Row */}
        <View
          className="mb-6"
          style={{
            flexDirection: layout.compactFormFields ? 'column' : 'row',
            gap: layout.compactFormFields ? 14 : 12,
          }}
        >
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-gray-800 mb-2">Cook Time (m)</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g. 25"
              keyboardType="number-pad"
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-center font-bold"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-extrabold text-gray-800 mb-2">Calories</Text>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g. 350"
              keyboardType="number-pad"
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 text-center font-bold"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-extrabold text-gray-800 mb-2">Difficulty</Text>
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
          <Text className="text-sm font-extrabold text-gray-800 mb-2">Ingredients</Text>
          <View className="flex-row mb-3">
            <TextInput
              value={newIngredient}
              onChangeText={setNewIngredient}
              placeholder="e.g. 2 cloves garlic, minced"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-l-2xl px-4 py-3.5 text-gray-800"
              placeholderTextColor="#9ca3af"
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
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* INSTRUCTIONS LIST */}
        <View className="mb-8">
          <Text className="text-sm font-extrabold text-gray-800 mb-2">Instructions / Steps</Text>
          <View className="flex-row mb-3">
            <TextInput
              value={newInstruction}
              onChangeText={setNewInstruction}
              placeholder="e.g. Heat butter in a pan over medium heat."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-l-2xl px-4 py-3.5 text-gray-800"
              placeholderTextColor="#9ca3af"
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
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* SUBMIT BUTTON */}
        <Button title="Share Recipe" onPress={handleCreate} size="lg" className="rounded-2xl" />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};
