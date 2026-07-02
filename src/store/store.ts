import { configureStore } from '@reduxjs/toolkit';
import recipesReducer from './slices/recipesSlice';
import favoritesReducer from './slices/favoritesSlice';
import likesReducer from './slices/likesSlice';

export const store = configureStore({
  reducer: {
    recipes: recipesReducer,
    favorites: favoritesReducer,
    likes: likesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
