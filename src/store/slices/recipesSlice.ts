import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Recipe, MOCK_RECIPES } from '../../constants/mockData';
import { toggleFavoriteAPI } from '../../services/recipeService';

export const toggleFavorite = createAsyncThunk(
  'recipes/toggleFavoriteStatus',
  async (recipeId: string, { dispatch, rejectWithValue }) => {
    // Perform optimistic local toggle
    dispatch(recipesSlice.actions.toggleFavoriteLocal(recipeId));
    try {
      await toggleFavoriteAPI(recipeId);
    } catch (error: any) {
      console.error('❌ Failed to toggle favorite in database, reverting:', error.message);
      // Revert local toggle on error
      dispatch(recipesSlice.actions.toggleFavoriteLocal(recipeId));
      return rejectWithValue(error.message);
    }
  }
) as any;

interface RecipesState {
  recipes: Recipe[];
  favorites: string[];
  searchQuery: string;
  selectedCategory: string;
  selectedRecipe: Recipe | null;
  userRecipes: Recipe[];
  userRecipesNeedsRefresh: boolean;
  userRecipesHasMore: boolean;
}

const initialState: RecipesState = {
  recipes: MOCK_RECIPES,
  favorites: [],
  searchQuery: '',
  selectedCategory: 'All',
  selectedRecipe: null,
  userRecipes: [],
  userRecipesNeedsRefresh: true,
  userRecipesHasMore: true,
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    toggleFavoriteLocal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.favorites.indexOf(id);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(id);
      }
    },
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
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload;
    },
    addFavoriteRecipes: (state, action: PayloadAction<Recipe[]>) => {
      const existingIds = new Set(state.recipes.map((r) => r.id));
      const newRecipes = action.payload.filter((r) => !existingIds.has(r.id));
      state.recipes = [...state.recipes, ...newRecipes];
    },
    setRecipes: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
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
  },
});

export const {
  toggleFavoriteLocal,
  setSearchQuery,
  setSelectedCategory,
  setSelectedRecipe,
  addRecipe,
  setUserRecipes,
  setUserRecipesNeedsRefresh,
  setFavorites,
  addFavoriteRecipes,
  setRecipes,
  updateChefProfile,
} = recipesSlice.actions;

export default recipesSlice.reducer;
