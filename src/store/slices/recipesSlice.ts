import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, MOCK_RECIPES } from '../../constants/mockData';

interface RecipesState {
  recipes: Recipe[];
  searchQuery: string;
  selectedCategory: string;
  selectedRecipe: Recipe | null;
  userRecipes: Recipe[];
  userRecipesNeedsRefresh: boolean;
  userRecipesHasMore: boolean;
  uploadStatus: {
    isUploading: boolean;
    progress: number;
    statusText: string;
    error: string | null;
  };
}

const initialState: RecipesState = {
  recipes: MOCK_RECIPES,
  searchQuery: '',
  selectedCategory: 'All',
  selectedRecipe: null,
  userRecipes: [],
  userRecipesNeedsRefresh: true,
  userRecipesHasMore: true,
  uploadStatus: {
    isUploading: false,
    progress: 0,
    statusText: '',
    error: null,
  },
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedRecipe: (state, action: PayloadAction<Recipe | null>) => {
      state.selectedRecipe = action.payload;
    },
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipes.unshift(action.payload);
      // Prepend to local my recipes list as well so it updates instantly
      state.userRecipes.unshift(action.payload);
      state.userRecipesNeedsRefresh = true;
    },
    setUserRecipes: (
      state,
      action: PayloadAction<{ recipes: Recipe[]; page: number; hasMore: boolean }>
    ) => {
      const { recipes, page, hasMore } = action.payload;
      if (page === 1) {
        state.userRecipes = recipes;
      } else {
        // Prevent duplicate appending
        const existingIds = new Set(state.userRecipes.map((r) => r.id));
        const newRecipes = recipes.filter((r) => !existingIds.has(r.id));
        state.userRecipes = [...state.userRecipes, ...newRecipes];
      }
      state.userRecipesHasMore = hasMore;
      state.userRecipesNeedsRefresh = false;
    },
    setUserRecipesNeedsRefresh: (state, action: PayloadAction<boolean>) => {
      state.userRecipesNeedsRefresh = action.payload;
    },
    addFavoriteRecipes: (state, action: PayloadAction<Recipe[]>) => {
      const existingIds = new Set(state.recipes.map((r) => r.id));
      const newRecipes = action.payload.filter((r) => !existingIds.has(r.id));
      state.recipes = [...state.recipes, ...newRecipes];
    },
    setRecipes: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
    },
    incrementRecipeLikesCount: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const updateLikes = (recipe: Recipe) => {
        if (recipe.id === id) {
          recipe.likesCount = (recipe.likesCount || 0) + 1;
        }
      };
      state.recipes.forEach(updateLikes);
      state.userRecipes.forEach(updateLikes);
      if (state.selectedRecipe) {
        updateLikes(state.selectedRecipe);
      }
    },
    decrementRecipeLikesCount: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const updateLikes = (recipe: Recipe) => {
        if (recipe.id === id) {
          recipe.likesCount = Math.max(0, (recipe.likesCount || 0) - 1);
        }
      };
      state.recipes.forEach(updateLikes);
      state.userRecipes.forEach(updateLikes);
      if (state.selectedRecipe) {
        updateLikes(state.selectedRecipe);
      }
    },
    updateChefProfile: (state, action: PayloadAction<{ chefName: string; chefAvatar: string; userId: string }>) => {
      const { chefName, chefAvatar, userId } = action.payload;
      
      // Update in userRecipes list if the recipe was created by this user
      state.userRecipes = state.userRecipes.map((r) => {
        if (r.userId === userId) {
          return { ...r, chefName, chefAvatar };
        }
        return r;
      });

      // Update in main recipes list if the recipe was created by this user
      state.recipes = state.recipes.map((r) => {
        if (r.userId === userId) {
          return { ...r, chefName, chefAvatar };
        }
        return r;
      });

      // Also update selectedRecipe if active and created by this user
      if (state.selectedRecipe && state.selectedRecipe.userId === userId) {
        state.selectedRecipe = {
          ...state.selectedRecipe,
          chefName,
          chefAvatar,
        };
      }
    },
    clearUserSessionState: (state) => {
      state.userRecipes = [];
      state.userRecipesNeedsRefresh = true;
      state.userRecipesHasMore = true;
      state.selectedRecipe = null;
    },
    setUploadStatus: (
      state,
      action: PayloadAction<{ isUploading: boolean; progress: number; statusText: string; error?: string | null }>
    ) => {
      const { isUploading, progress, statusText, error = null } = action.payload;
      state.uploadStatus = { isUploading, progress, statusText, error };
    },
    clearUploadStatus: (state) => {
      state.uploadStatus = {
        isUploading: false,
        progress: 0,
        statusText: '',
        error: null,
      };
    },
    updateRecipeVideoUrl: (state, action: PayloadAction<{ recipeId: string; videoUrl: string }>) => {
      const { recipeId, videoUrl } = action.payload;
      state.recipes = state.recipes.map((r) =>
        r.id === recipeId ? { ...r, videoUrl } : r
      );
      state.userRecipes = state.userRecipes.map((r) =>
        r.id === recipeId ? { ...r, videoUrl } : r
      );
      if (state.selectedRecipe && state.selectedRecipe.id === recipeId) {
        state.selectedRecipe.videoUrl = videoUrl;
      }
    },
    removeRecipe: (state, action: PayloadAction<string>) => {
      const recipeId = action.payload;
      state.recipes = state.recipes.filter((r) => r.id !== recipeId);
      state.userRecipes = state.userRecipes.filter((r) => r.id !== recipeId);
    },
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setSelectedRecipe,
  addRecipe,
  setUserRecipes,
  setUserRecipesNeedsRefresh,
  addFavoriteRecipes,
  setRecipes,
  incrementRecipeLikesCount,
  decrementRecipeLikesCount,
  updateChefProfile,
  clearUserSessionState,
  setUploadStatus,
  clearUploadStatus,
  updateRecipeVideoUrl,
  removeRecipe,
} = recipesSlice.actions;

export default recipesSlice.reducer;
