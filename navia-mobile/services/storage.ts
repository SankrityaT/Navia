import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Helper functions for easy access
export const getToken = async (key: string) => {
  return await SecureStore.getItemAsync(key);
};

export const setToken = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

export const removeToken = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};

export const storage = {
  // Regular storage
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  
  async getItem(key: string) {
    return await AsyncStorage.getItem(key);
  },
  
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
  
  // Secure storage (for tokens)
  async setSecureItem(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
  },
  
  async getSecureItem(key: string) {
    return await SecureStore.getItemAsync(key);
  },
  
  async removeSecureItem(key: string) {
    await SecureStore.deleteItemAsync(key);
  },
};
