<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();

onMounted(() => {
  console.log('App.vue mounted - initializing auth');
  
  // Initialize auth from localStorage first
  authStore.initializeAuth();
  console.log('Auth initialized. Is authenticated:', authStore.isAuthenticated);
  
  // Check for auth token and user data from URL parameters (from main project login)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userData = urlParams.get('user');

  if (token && userData) {
    try {
      // Store auth data in localStorage for admin project using the correct keys
      localStorage.setItem('tasky_token', token);
      localStorage.setItem('tasky_user', userData);

      // Re-initialize auth with the new data
      authStore.initializeAuth();

      // Clean URL by removing parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      console.log('Auth data received from main project and stored');
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }
});
</script>
