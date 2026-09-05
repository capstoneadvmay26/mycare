import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  // Using the env variable, fallback to localhost for dev
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
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

// ==========================================
// AUTH & ONBOARDING (For feature / Foundation)
// ==========================================
export const requestOtp = (data) => api.post('/auth/request-otp', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// ==========================================
// MEDICATIONS (For Nurudeen - Today's task)
// ==========================================
export const getMedications = (profile_id) => api.get('/medications', { params: { profile_id } });
export const addMedication = (data) => api.post('/medications', data);
export const editMedication = (id, data) => api.put(`/medications/${id}`, data);
export const archiveMedication = (id) => api.delete(`/medications/${id}`);
export const markDoseTaken = (id, data) => api.post(`/medications/${id}/taken`, data);
export const markDoseSkipped = (id, data) => api.post(`/medications/${id}/skipped`, data);
export const getAdherenceSummary = (profile_id) => api.get('/adherence/summary', { params: { profile_id } });

// ==========================================
// PROFILES (For Zavirah - Today's task)
// ==========================================
export const getProfiles = () => api.get('/profiles');
export const getProfile = (id) => api.get(`/profiles/${id}`);
export const addProfile = (data) => api.post('/profiles', data);
export const editProfile = (id, data) => api.put(`/profiles/${id}`, data);
export const deleteProfile = (id) => api.delete(`/profiles/${id}`);
export const switchProfile = (profile_id) => api.post('/profiles/switch', { profile_id });

// ==========================================
// SYMPTOMS & HISTORY (For Day 3)
// ==========================================
export const getSymptomOptions = () => api.get('/symptoms/options');
export const logSymptom = (data) => api.post('/symptoms/log', data);
export const getHistory = (params) => api.get('/history', { params });

export default api;
