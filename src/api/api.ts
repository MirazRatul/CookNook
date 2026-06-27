import axios from 'axios';
import { auth } from '../services/firebase';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
  android: 'http://192.168.10.24:5001/api/v1',
  ios: 'http://192.168.10.24:5001/api/v1',
  default: 'http://localhost:5001/api/v1',
});

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor: Automatically fetches the Firebase ID Token
// and appends it as a Bearer token in the Authorization header.
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        // getIdToken() retrieves the current cached token or refreshes it if expired
        const token = await currentUser.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('❌ Error fetching auth token for request interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
