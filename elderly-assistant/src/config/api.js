// API Configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://careconnect-backend-h6ma.onrender.com');

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  REMINDERS: `${API_BASE_URL}/api/reminders`,
  SOS: `${API_BASE_URL}/api/sos`,
  CONTACTS: `${API_BASE_URL}/api/contacts`,
  FRIENDS: `${API_BASE_URL}/api/friends`,
  AI: `${API_BASE_URL}/api/ai`
};

export default API_BASE_URL;
