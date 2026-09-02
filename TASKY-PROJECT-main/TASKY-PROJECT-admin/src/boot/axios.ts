import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

export default boot(({ app }) => {
  // Add request interceptor to include JWT token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('tasky_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - logout user
        localStorage.removeItem('tasky_token');
        localStorage.removeItem('tasky_user');
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }
  );

  app.config.globalProperties.$api = api;
});

export { api };
