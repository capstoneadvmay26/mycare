// src/services/auth.js
import api from './api';

// ✅ DEVELOPMENT MODE - Bypasses OTP verification
const isDevelopment = import.meta.env.DEV;

// Mock user for development
const MOCK_USER = {
  id: 'mock-user-001',
  full_name: 'Tolu Ademola',
  email: 'tolu@mycare.com',
  phone: '+2348037106942',
  date_of_birth: '1995-05-15',
  gender: 'Male',
  is_primary: true
};

const MOCK_TOKEN = 'mock-jwt-token-for-development-only';

// ✅ Real API call for sending OTP
export const requestOtp = async (method, identifier) => {
  return api.post('/auth/request-otp', { method, [method]: identifier });
};

// ✅ DEVELOPMENT BYPASS: Accepts any 6-digit OTP
export const verifyOtp = async (method, identifier, otp) => {
  if (isDevelopment) {
    if (otp.length === 6) {
      console.log('[DEV] OTP bypassed for:', identifier);
      return {
        data: {
          token: MOCK_TOKEN,
          is_new_user: true,
          user: MOCK_USER
        }
      };
    }
    throw new Error('Invalid OTP format');
  }
  // Production: Use real API
  return api.post('/auth/verify-otp', { method, identifier, otp });
};

// ✅ DEVELOPMENT BYPASS: Returns mock user
export const register = async (userData) => {
  if (isDevelopment) {
    console.log('[DEV] Registration bypassed for:', userData.full_name);
    const mockUser = { ...MOCK_USER, full_name: userData.full_name };
    return {
      data: {
        token: MOCK_TOKEN,
        user: mockUser
      }
    };
  }
  return api.post('/auth/register', userData);
};

export const login = async (identifier, password) => {
  if (isDevelopment) {
    console.log('[DEV] Login bypassed for:', identifier);
    return {
      data: {
        token: MOCK_TOKEN,
        user: MOCK_USER
      }
    };
  }
  return api.post('/auth/login', { identifier, password });
};

export const forgotPassword = async (identifier) => {
  return api.post('/auth/forgot-password', { identifier });
};

export const resetPassword = async (token, newPassword) => {
  return api.post('/auth/reset-password', { token, new_password: newPassword });
};

export default {
  requestOtp,
  verifyOtp,
  register,
  login,
  forgotPassword,
  resetPassword
};