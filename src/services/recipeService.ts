import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5001/api/v1',
  ios: 'http://localhost:5001/api/v1',
  default: 'http://localhost:5001/api/v1',
});

export interface CreateRecipeData {
  title: string;
  description: string;
  category: string;
  duration: number;
  calories: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  images: string[]; // Local file URIs from ImagePicker
}

/**
 * Service to submit new recipes along with multiple image uploads to the backend.
 * Packages files and text fields into a multipart/form-data request.
 */
export const createRecipeAPI = async (recipeData: CreateRecipeData) => {
  const formData = new FormData();

  formData.append('title', recipeData.title);
  formData.append('description', recipeData.description);
  formData.append('category', recipeData.category);
  formData.append('duration', recipeData.duration.toString());
  formData.append('calories', recipeData.calories.toString());
  formData.append('difficulty', recipeData.difficulty);
  formData.append('ingredients', JSON.stringify(recipeData.ingredients));
  formData.append('instructions', JSON.stringify(recipeData.instructions));

  // Package the image URIs for multipart upload
  recipeData.images.forEach((uri, index) => {
    const filename = uri.split('/').pop() || `recipe_image_${index}.jpg`;
    
    // Infer the image mime type from file extension
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('images', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type,
    } as any);
  });

  console.log(`📤 Sending recipe to backend: ${API_BASE_URL}/recipes`);

  const response = await fetch(`${API_BASE_URL}/recipes`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
      // Note: Fetch automatically sets the appropriate 'multipart/form-data; boundary=...' header,
      // so we MUST NOT set it manually or it will corrupt the boundary.
    },
  });

  const responseJson = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = responseJson?.error?.message || 'Failed to create recipe on the server.';
    throw new Error(errorMessage);
  }

  return responseJson;
};
