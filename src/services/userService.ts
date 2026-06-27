import apiClient from '../api/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  mobile: string;
  profile_pic: string | null;
  bio: string | null;
  address: string | null;
  experience_years: number | null;
  specialty: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileData {
  name: string;
  mobile: string;
  profile_pic?: string; // Local image URI for uploading
  bio?: string;
  address?: string;
  experience_years?: string;
  specialty?: string;
}

/**
 * Service to fetch user profile data from the backend.
 */
export const getUserProfileAPI = async (): Promise<{ success: boolean; data: UserProfile }> => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to retrieve profile.';
    throw new Error(errorMessage);
  }
};

/**
 * Service to create or update the user's profile details.
 * Packages files and text fields into a multipart/form-data request.
 */
export const updateUserProfileAPI = async (
  profileData: UpdateProfileData
): Promise<{ success: boolean; message: string; data: UserProfile }> => {
  const formData = new FormData();

  formData.append('name', profileData.name);
  formData.append('mobile', profileData.mobile);
  
  if (profileData.bio !== undefined) formData.append('bio', profileData.bio);
  if (profileData.address !== undefined) formData.append('address', profileData.address);
  if (profileData.experience_years !== undefined) {
    formData.append('experience_years', profileData.experience_years);
  }
  if (profileData.specialty !== undefined) formData.append('specialty', profileData.specialty);

  // If a new local image URI was selected, package it for upload
  if (profileData.profile_pic) {
    const uri = profileData.profile_pic;
    const filename = uri.split('/').pop() || 'profile_pic.jpg';
    
    // Infer image type from extension
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('profile_pic', {
      uri: uri,
      name: filename,
      type,
    } as any);
  }

  try {
    const response = await apiClient.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to update profile.';
    throw new Error(errorMessage);
  }
};
