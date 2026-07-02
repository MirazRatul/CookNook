import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { toggleFavoriteAPI } from '../../services/recipeService';

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavoriteStatus',
  async (recipeId: string, { dispatch, rejectWithValue }) => {
    // Perform optimistic local toggle
    dispatch(favoritesSlice.actions.toggleFavoriteLocal(recipeId));
    try {
      await toggleFavoriteAPI(recipeId);
    } catch (error: any) {
      console.error('❌ Failed to toggle favorite in database, reverting:', error.message);
      // Revert local toggle on error
      dispatch(favoritesSlice.actions.toggleFavoriteLocal(recipeId));
      return rejectWithValue(error.message);
    }
  }
) as any;

interface FavoritesState {
  favorites: string[];
}

const initialState: FavoritesState = {
  favorites: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
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
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload;
    },
    clearUserSessionState: (state) => {
      state.favorites = [];
    },
  },
});

export const {
  toggleFavoriteLocal,
  setFavorites,
  clearUserSessionState,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
