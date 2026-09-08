// src/services/api.js
import axios from 'axios';

// ============================================================
// ✅ API SERVICE - COMPLETE REPLACEMENT
// ============================================================

// --- Base URL Configuration ---
// Use environment variable or fallback to production URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://mycare-b8tr.onrender.com/api/v1';

// --- Create Axios Instance ---
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// ============================================================
// ✅ REQUEST INTERCEPTOR - Add Token to Every Request
// ============================================================
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('mycare_token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log('[API] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================
// ✅ RESPONSE INTERCEPTOR - Handle Errors Globally
// ============================================================
api.interceptors.response.use(
  (response) => {
    // Log response for debugging
    console.log('[API] Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    
    return response;
  },
  (error) => {
    // Handle specific error statuses
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('[API] Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn('[API] Unauthorized - Token may be expired');
        
        // Don't redirect for login/register endpoints
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        if (!isAuthEndpoint) {
          // Clear token and redirect to onboarding
          localStorage.removeItem('mycare_token');
          localStorage.removeItem('mycare_user');
          
          // Redirect to onboarding
          if (window.location.pathname !== '/onboarding') {
            window.location.href = '/onboarding';
          }
        }
      }
      
      // Handle 429 Too Many Requests
      if (error.response.status === 429) {
        console.warn('[API] Rate limit exceeded. Please wait a moment.');
      }
      
      // Handle 500 Server Error
      if (error.response.status >= 500) {
        console.error('[API] Server error. Please try again later.');
      }
      
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API] No Response Error:', {
        message: error.message,
        url: error.config?.url,
      });
    } else {
      // Something happened in setting up the request
      console.error('[API] Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// ✅ AUTH ENDPOINTS
// ============================================================

export const requestOtp = async (method, identifier) => {
  return api.post('/auth/request-otp', { method, [method]: identifier });
};

export const verifyOtp = async (method, identifier, otp) => {
  return api.post('/auth/verify-otp', { method, identifier, otp });
};

export const register = async (userData) => {
  return api.post('/auth/register', userData);
};

export const login = async (identifier, password) => {
  return api.post('/auth/login', { identifier, password });
};

export const forgotPassword = async (identifier) => {
  return api.post('/auth/forgot-password', { identifier });
};

export const resetPassword = async (token, newPassword) => {
  return api.post('/auth/reset-password', { token, new_password: newPassword });
};

// ============================================================
// ✅ PROFILE ENDPOINTS
// ============================================================

export const getProfiles = async () => {
  return api.get('/profiles');
};

export const getProfile = async (profileId) => {
  return api.get(`/profiles/${profileId}`);
};

export const createProfile = async (profileData) => {
  return api.post('/profiles', profileData);
};

export const updateProfile = async (profileId, profileData) => {
  return api.put(`/profiles/${profileId}`, profileData);
};

export const deleteProfile = async (profileId) => {
  return api.delete(`/profiles/${profileId}`);
};

export const switchProfile = async (profileId) => {
  return api.post('/profiles/switch', { profile_id: profileId });
};

// ============================================================
// ✅ MEDICATION ENDPOINTS
// ============================================================

export const getMedications = async (profileId) => {
  return api.get('/medications', { params: { profile_id: profileId } });
};

export const getMedication = async (medicationId) => {
  return api.get(`/medications/${medicationId}`);
};

export const addMedication = async (medicationData) => {
  return api.post('/medications', medicationData);
};

export const updateMedication = async (medicationId, medicationData) => {
  return api.put(`/medications/${medicationId}`, medicationData);
};

export const deleteMedication = async (medicationId) => {
  return api.delete(`/medications/${medicationId}`);
};

export const markMedicationTaken = async (medicationId, timestamp) => {
  return api.post(`/medications/${medicationId}/taken`, { timestamp });
};

export const markMedicationSkipped = async (medicationId, timestamp, reason) => {
  return api.post(`/medications/${medicationId}/skipped`, { timestamp, reason });
};

// ============================================================
// ✅ ADHERENCE ENDPOINTS
// ============================================================

export const getAdherenceSummary = async (profileId) => {
  return api.get('/adherence/summary', { params: { profile_id: profileId } });
};

export const getAdherenceHistory = async (profileId, period = 'week') => {
  return api.get('/adherence/history', { params: { profile_id: profileId, period } });
};

// ============================================================
// ✅ SYMPTOM ENDPOINTS
// ============================================================

export const getSymptoms = async (profileId) => {
  return api.get('/symptoms', { params: { profile_id: profileId } });
};

export const logSymptom = async (symptomData) => {
  return api.post('/symptoms/log', symptomData);
};

export const getSymptomStatus = async (symptomId) => {
  return api.get(`/symptoms/${symptomId}/status`);
};

export const submitCheckIn = async (symptomId, status) => {
  return api.post(`/symptoms/${symptomId}/check-in`, { status });
};

export const getSymptomHistory = async (profileId) => {
  return api.get('/symptoms/history', { params: { profile_id: profileId } });
};

// ============================================================
// ✅ HISTORY ENDPOINTS
// ============================================================

export const getHistory = async (profileId, type = 'all', dateFrom = null) => {
  return api.get('/history', { 
    params: { 
      profile_id: profileId, 
      type, 
      date_from: dateFrom 
    } 
  });
};

export const getConsultBrief = async (profileId) => {
  return api.get('/reports/consult-brief', { params: { profile_id: profileId } });
};

// ============================================================
// ✅ SETTINGS ENDPOINTS
// ============================================================

export const getNotificationSettings = async () => {
  return api.get('/settings/notifications');
};

export const updateNotificationSettings = async (settings) => {
  return api.put('/settings/notifications', settings);
};

export const getSubscriptionStatus = async () => {
  return api.get('/account/subscription');
};

export const initializePayment = async (profileId) => {
  return api.post('/billing/paystack/initialize', { profile_id: profileId });
};

// ============================================================
// ✅ DATA EXPORT
// ============================================================

export const exportData = async () => {
  return api.get('/data/export');
};

// ============================================================
// ✅ ACCOUNT MANAGEMENT
// ============================================================

export const deleteAccount = async () => {
  return api.delete('/account');
};

// ============================================================
// ✅ DEFAULT EXPORT
// ============================================================

export default api;