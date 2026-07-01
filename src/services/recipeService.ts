import { Platform } from 'react-native';
import apiClient from '../api/api';

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
  video?: string | null; // Local video URI from ImagePicker
}

/**
 * Service to submit new recipes along with multiple image uploads and video to the backend.
 * Packages files and text fields into a multipart/form-data request.
 */
export const createRecipeAPI = async (
  recipeData: CreateRecipeData,
  onProgress?: (percentage: number) => void
) => {
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

  // Package the video URI for multipart upload if provided
  if (recipeData.video) {
    const filename = recipeData.video.split('/').pop() || 'recipe_video.mp4';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `video/${match[1]}` : 'video/mp4';

    formData.append('video', {
      uri: Platform.OS === 'ios' ? recipeData.video.replace('file://', '') : recipeData.video,
      name: filename,
      type,
    } as any);
  }

  console.log('📤 Sending recipe to backend via Axios API Client...');

  try {
    const response = await apiClient.post('/recipes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to create recipe on the server.';
    throw new Error(errorMessage);
  }
};

/**
 * Retrieve paginated created recipes for the logged-in user.
 * @param page The page number (default 1)
 * @param limit The number of items per batch (default 10)
 */
export const getUserRecipesAPI = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await apiClient.get('/recipes/my-recipes', {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to load user recipes from the server.';
    throw new Error(errorMessage);
  }
};

/**
 * Toggle favorite status of a recipe in the backend.
 * @param recipeId The ID of the recipe to toggle favorite status for
 */
export const toggleFavoriteAPI = async (recipeId: string) => {
  try {
    const response = await apiClient.post('/recipes/favorites/toggle', { recipeId });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to toggle recipe favorite on the server.';
    throw new Error(errorMessage);
  }
};

/**
 * Retrieve all favorite recipe IDs of the logged-in user.
 */
export const getFavoritesAPI = async () => {
  try {
    const response = await apiClient.get('/recipes/favorites');
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to load favorite recipes from the server.';
    throw new Error(errorMessage);
  }
};

/**
 * Retrieve all recipes from the database (seeded mock + user created).
 * @param page The page number (default 1)
 * @param limit The number of items per batch (default 100)
 */
export const getAllRecipesAPI = async (page: number = 1, limit: number = 100) => {
  try {
    const response = await apiClient.get('/recipes', {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to load all recipes from the server.';
    throw new Error(errorMessage);
  }
};

/**
 * Fetch a single recipe by its ID from the backend database.
 * @param recipeId The ID of the recipe
 */
export const getRecipeByIdAPI = async (recipeId: string) => {
  try {
    const response = await apiClient.get(`/recipes/${recipeId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to load recipe details from the server.';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a recipe by its ID from the backend database.
 * @param recipeId The ID of the recipe to delete
 */
export const deleteRecipeAPI = async (recipeId: string) => {
  try {
    const response = await apiClient.delete(`/recipes/${recipeId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to delete recipe from the server.';
    throw new Error(errorMessage);
  }
};
