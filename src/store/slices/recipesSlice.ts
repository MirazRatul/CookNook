import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, MOCK_RECIPES } from '../../constants/mockData';

interface RecipesState {
  recipes: Recipe[];
  favorites: string[];
  searchQuery: string;
  selectedCategory: string;
  selectedRecipe: Recipe | null;
}

const initialState: RecipesState = {
  recipes: MOCK_RECIPES,
  favorites: [],
  searchQuery: '',
  selectedCategory: 'All',
  selectedRecipe: null,
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
    },
  },
});

export const {
  toggleFavorite,
  setSearchQuery,
  setSelectedCategory,
  setSelectedRecipe,
  addRecipe,
} = recipesSlice.actions;

export default recipesSlice.reducer;
