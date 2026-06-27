import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, MOCK_RECIPES } from '../../constants/mockData';

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
    toggleFavorite: (state, action: PayloadAction<string>) => {
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
  },
});

export const {
  toggleFavorite,
  setSearchQuery,
  setSelectedCategory,
  setSelectedRecipe,
  addRecipe,
  setUserRecipes,
  setUserRecipesNeedsRefresh,
} = recipesSlice.actions;

export default recipesSlice.reducer;
