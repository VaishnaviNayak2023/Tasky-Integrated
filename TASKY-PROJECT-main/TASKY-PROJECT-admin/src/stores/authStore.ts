import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const API_BASE_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  role: 'pm' | 'employee';
  professionalRole?: string | undefined;
  professionalRoleOther?: string | null | undefined;
  avatar?: string | undefined;
  employeeCode?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const token = ref<string | null>(null);

  // Mock invite codes
  const validInviteCodes = ['TASKY2024', 'WELCOME2024', 'TEAM2024', 'JOIN2024'];

  // Initialize from localStorage
  const initializeAuth = () => {
    const savedUser = localStorage.getItem('tasky_user');
    const savedToken = localStorage.getItem('tasky_token');

    if (savedUser && savedToken) {
      user.value = JSON.parse(savedUser);
      token.value = savedToken;
      isAuthenticated.value = true;
    }
  };

  const login = async (id: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: id, password }),
      });

      const data = await response.json();

      if (data.success) {
        user.value = data.user;
        token.value = data.token;
        isAuthenticated.value = true;

        localStorage.setItem('tasky_user', JSON.stringify(data.user));
        localStorage.setItem('tasky_token', token.value || '');

        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const registerPM = async (
    userData: Omit<User, 'id'> & {
      managerId: string;
      password: string;
      organisationName?: string;
      inviteCode?: string;
    },
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/pm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        user.value = data.user;
        token.value = data.token;
        isAuthenticated.value = true;

        localStorage.setItem('tasky_user', JSON.stringify(data.user));
        localStorage.setItem('tasky_token', token.value || '');
        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || 'Registration failed' };
    } catch (error) {
      console.error('Register PM error:', error);
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const registerEmployee = async (
    userData: Omit<User, 'id'> & {
      employeeId: string;
      inviteCode: string;
      password: string;
      professionalRoleOther?: string | null;
    },
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        user.value = data.user;
        token.value = data.token;
        isAuthenticated.value = true;

        localStorage.setItem('tasky_user', JSON.stringify(data.user));
        localStorage.setItem('tasky_token', token.value || '');
        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || 'Registration failed' };
    } catch (error) {
      console.error('Register Employee error:', error);
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const forgotPassword = async (role: 'pm' | 'employee', id: string, email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, identifier: id, email }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      }

      return { success: false, error: data.error || 'Failed to send reset link' };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const resetPassword = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: '' }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      }

      return { success: false, error: data.error || 'Failed to reset password' };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;

    localStorage.removeItem('tasky_user');
    localStorage.removeItem('tasky_token');
  };

  const updateProfile = async (
    userId: string,
    profileData: {
      firstName: string;
      surname: string;
      email: string;
      phone: string;
      avatar?: string;
    },
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        user.value = { ...user.value, ...data.user };
        localStorage.setItem('tasky_user', JSON.stringify(user.value));
        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || 'Failed to update profile' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const validateInviteCode = (code: string): boolean => {
    return validInviteCodes.includes(code);
  };

  const currentUser = computed(() => user.value);
  const userRole = computed(() => user.value?.role);

  return {
    user,
    isAuthenticated,
    token,
    currentUser,
    userRole,
    initializeAuth,
    login,
    registerPM,
    registerEmployee,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    validateInviteCode,
  };
});
