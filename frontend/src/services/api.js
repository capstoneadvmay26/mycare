// src/services/api.js
import axios from 'axios';

// ============================================================
// ✅ API SERVICE — COMPLETE WORKING VERSION
// ============================================================

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://mycare-backend-23oc.onrender.com/api/v1';

// --- Axios Instance ---
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// ============================================================
// REQUEST INTERCEPTOR — Attach Bearer token to every request
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mycare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('[API] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
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
// RESPONSE INTERCEPTOR — Global error handling
// ============================================================
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API] Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });

      // Auto-logout on 401 (except for auth endpoints)
      if (error.response.status === 401) {
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        if (!isAuthEndpoint) {
          localStorage.removeItem('mycare_token');
          localStorage.removeItem('mycare_user');
          if (window.location.pathname !== '/onboarding') {
            window.location.href = '/onboarding';
          }
        }
      }

      if (error.response.status === 429) {
        console.warn('[API] Rate limit exceeded. Please wait a moment.');
      }

      if (error.response.status >= 500) {
        console.error('[API] Server error. Please try again later.');
      }
    } else if (error.request) {
      console.error('[API] No Response Error:', {
        message: error.message,
        url: error.config?.url,
      });
    } else {
      console.error('[API] Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================================
// AUTH ENDPOINTS
// ============================================================

/**
 * Request OTP for email or phone
 * Body: { method: "email" | "phone", identifier: "user@example.com" }
 */
export const requestOtp = async (method, identifier) => {
  return api.post('/auth/request-otp', { method, identifier });
};

/**
 * Verify OTP
 * Body: { method: "email" | "phone", identifier: "user@example.com", otp: "123456" }
 */
export const verifyOtp = async (method, identifier, otp) => {
  return api.post('/auth/verify-otp', { method, identifier, otp });
};

/**
 * Register new user
 * Body: { full_name, date_of_birth, gender, password }
 * ⚠️ Requires Bearer token from verify-otp
 */
export const register = async (userData) => {
  return api.post('/auth/register', userData);
};

/**
 * Login with password
 * Body: { identifier, password }
 */
export const login = async (identifier, password) => {
  return api.post('/auth/login', { identifier, password });
};

export const forgotPassword = async (identifier) => {
  return api.post('/auth/forgot-password', { identifier });
};

export const resetPassword = async (token, newPassword) => {
  return api.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  });
};

// ============================================================
// PROFILE ENDPOINTS
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
// MEDICATION ENDPOINTS
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
  return api.post(`/medications/${medicationId}/skipped`, {
    timestamp,
    reason,
  });
};

// ============================================================
// ADHERENCE ENDPOINTS
// ============================================================

export const getAdherenceSummary = async (profileId) => {
  return api.get('/adherence/summary', { params: { profile_id: profileId } });
};

export const getAdherenceHistory = async (profileId, period = 'week') => {
  return api.get('/adherence/history', {
    params: { profile_id: profileId, period },
  });
};

// ============================================================
// SYMPTOM ENDPOINTS
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

// ============================================================
// HISTORY ENDPOINTS — ✅ Updated to match backend contract
// ============================================================

/**
 * Get all history events (symptoms, medications, check-ins)
 * Params: { profile_id, type: "all" | "symptoms" | "medications" | "check-ins" }
 */
export const getHistory = async (profileId, type = 'all') => {
  return api.get('/history', {
    params: { profile_id: profileId, type },
  });
};

/**
 * Get medication adherence history
 * Params: { profile_id, period: "week" | "month" | ... }
 */
export const getMedicationHistory = async (profileId, period = 'week') => {
  return api.get('/medications/history', {
    params: { profile_id: profileId, period },
  });
};

/**
 * Get symptom logs history
 * Params: { profile_id, period: "week" | "month" | ... }
 */
export const getSymptomHistory = async (profileId, period = 'month') => {
  return api.get('/symptoms/history', {
    params: { profile_id: profileId, period },
  });
};

/**
 * Generate consult brief JSON for a profile
 * Params: { profile_id }
 */
export const getConsultBrief = async (profileId) => {
  return api.get('/reports/consult-brief', {
    params: { profile_id: profileId },
  });
};

// ============================================================
// SETTINGS ENDPOINTS
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
  return api.post('/billing/paystack/initialize', {
    profile_id: profileId,
  });
};

// ============================================================
// DATA EXPORT & ACCOUNT MANAGEMENT
// ============================================================

export const exportData = async () => {
  return api.get('/data/export');
};

export const deleteAccount = async () => {
  return api.delete('/account');
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;