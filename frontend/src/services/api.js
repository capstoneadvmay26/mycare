// src/services/api.js
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  // Using the env variable, fallback to localhost for dev
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AUTH & ONBOARDING
export const requestOtp = (data) => api.post('/auth/request-otp', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// MEDICATIONS (For Nurudeen - Today's task)
export const getMedications = (profileId) => api.get(`/medications?profile_id=${profileId}`);
export const addMedication = (data) => api.post('/medications', data);
export const updateMedication = (id, data) => api.put(`/medications/${id}`, data);
export const archiveMedication = (id) => api.patch(`/medications/${id}/archive`);
export const deleteMedication = (id) => api.delete(`/medications/${id}`);

export default api;
