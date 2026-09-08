// src/services/auth.js
import api from './api';

// ============================================================
// ✅ AUTHENTICATION SERVICE - COMPLETE REPLACEMENT
// ============================================================

// --- OTP Request ---
export const requestOtp = async (method, identifier) => {
  try {
    const response = await api.post('/auth/request-otp', { 
      method, 
      [method]: identifier 
    });
    return response;
  } catch (error) {
    console.error('[Auth] Request OTP error:', error);
    throw error;
  }
};

// --- OTP Verification ---
export const verifyOtp = async (method, identifier, otp) => {
  try {
    const response = await api.post('/auth/verify-otp', { 
      method, 
      identifier, 
      otp 
    });
    
    // ✅ CRITICAL: Store token immediately after verification
    if (response.data && response.data.token) {
      const token = response.data.token;
      
      // Store in localStorage
      localStorage.setItem('mycare_token', token);
      
      // Set in axios defaults for all subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('[Auth] Token stored successfully');
    }
    
    return response;
  } catch (error) {
    console.error('[Auth] Verify OTP error:', error);
    throw error;
  }
};

// --- Registration ---
export const register = async (userData) => {
  try {
    // ✅ Token is automatically attached by the interceptor
    const response = await api.post('/auth/register', userData);
    
    // ✅ If new token returned, update it
    if (response.data && response.data.token) {
      const token = response.data.token;
      localStorage.setItem('mycare_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    return response;
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    throw error;
  }
};

// --- Login ---
export const login = async (identifier, password) => {
  try {
    const response = await api.post('/auth/login', { 
      identifier, 
      password 
    });
    
    if (response.data && response.data.token) {
      const token = response.data.token;
      localStorage.setItem('mycare_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    return response;
  } catch (error) {
    console.error('[Auth] Login error:', error);
    throw error;
  }
};

// --- Forgot Password ---
export const forgotPassword = async (identifier) => {
  try {
    const response = await api.post('/auth/forgot-password', { identifier });
    return response;
  } catch (error) {
    console.error('[Auth] Forgot password error:', error);
    throw error;
  }
};

// --- Reset Password ---
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { 
      token, 
      new_password: newPassword 
    });
    return response;
  } catch (error) {
    console.error('[Auth] Reset password error:', error);
    throw error;
  }
};

// --- Logout ---
export const logout = () => {
  localStorage.removeItem('mycare_token');
  localStorage.removeItem('mycare_user');
  delete api.defaults.headers.common['Authorization'];
  console.log('[Auth] Logged out successfully');
};

// --- Get Current User ---
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('mycare_user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('[Auth] Get current user error:', error);
    return null;
  }
};

// --- Get Token ---
export const getToken = () => {
  return localStorage.getItem('mycare_token');
};

// --- Check if Authenticated ---
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// ✅ Default export for convenience
export default {
  requestOtp,
  verifyOtp,
  register,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
};