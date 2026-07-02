import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { toggleLikeAPI, getUserLikesAPI } from '../../services/recipeService';
import { incrementRecipeLikesCount, decrementRecipeLikesCount } from './recipesSlice';
import { RootState } from '../store';

export const toggleLike = createAsyncThunk(
  'likes/toggleLikeStatus',
  async (recipeId: string, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isLiked = state.likes.likedRecipeIds.includes(recipeId);
    
    // Perform optimistic local toggle
    dispatch(likesSlice.actions.toggleLikeLocal(recipeId));
    if (isLiked) {
      dispatch(decrementRecipeLikesCount(recipeId));
    } else {
      dispatch(incrementRecipeLikesCount(recipeId));
    }

    try {
      await toggleLikeAPI(recipeId);
    } catch (error: any) {
      console.error('❌ Failed to toggle like in database, reverting:', error.message);
      // Revert local toggle on error
      dispatch(likesSlice.actions.toggleLikeLocal(recipeId));
      if (isLiked) {
        dispatch(incrementRecipeLikesCount(recipeId));
      } else {
        dispatch(decrementRecipeLikesCount(recipeId));
      }
      return rejectWithValue(error.message);
    }
  }
) as any;

export const fetchUserLikes = createAsyncThunk(
  'likes/fetchUserLikes',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await getUserLikesAPI();
      if (response.success && response.data?.likedRecipeIds) {
        dispatch(likesSlice.actions.setLikedRecipeIds(response.data.likedRecipeIds));
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch user likes:', error.message);
      return rejectWithValue(error.message);
    }
  }
) as any;

interface LikesState {
  likedRecipeIds: string[];
}

const initialState: LikesState = {
  likedRecipeIds: [],
};

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    toggleLikeLocal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.likedRecipeIds.indexOf(id);
      if (index > -1) {
        state.likedRecipeIds.splice(index, 1);
      } else {
        state.likedRecipeIds.push(id);
      }
    },
    setLikedRecipeIds: (state, action: PayloadAction<string[]>) => {
      state.likedRecipeIds = action.payload;
    },
    clearUserSessionState: (state) => {
      state.likedRecipeIds = [];
    },
  },
});

export const {
  toggleLikeLocal,
  setLikedRecipeIds,
  clearUserSessionState,
} = likesSlice.actions;

export default likesSlice.reducer;
