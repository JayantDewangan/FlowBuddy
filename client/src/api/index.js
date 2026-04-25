import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to include the Bearer token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle 401 errors silently for the initial check
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If it's a 401 and we're just checking auth state, don't log it as an error
    if (error.response?.status === 401 && error.config?.url === '/auth/me') {
      return Promise.resolve({ data: null });
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  registerViewer: (data) => api.post('/auth/register-viewer', data),
  login: (data) => api.post('/auth/login', data),
  requestOtp: (data) => api.post('/auth/request-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  google: (data) => api.post('/auth/google', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Cycle
export const cycleAPI = {
  getAll: () => api.get('/cycle'),
  create: (data) => api.post('/cycle', data),
  update: (id, data) => api.put(`/cycle/${id}`, data),
  delete: (id) => api.delete(`/cycle/${id}`),
};

// Daily Log
export const logAPI = {
  getAll: (params) => api.get('/log', { params }),
  upsert: (data) => api.post('/log', data),
  delete: (id) => api.delete(`/log/${id}`),
};

// Insights
export const insightsAPI = {
  get: () => api.get('/insights'),
  getCalendar: (month, year) => api.get('/insights/calendar', { params: { month, year } }),
};

// Trusted Circle
export const circleAPI = {
  regenerateInvite: () => api.post('/circle/invite/regenerate'),
  getViewers: () => api.get('/circle/viewers'),
  updatePrivacy: (viewerId, data) => api.put(`/circle/viewers/${viewerId}`, data),
  updateRelationship: (viewerId, relationship) => api.put(`/circle/viewers/${viewerId}/relationship`, { relationship }),
  revokeViewer: (viewerId) => api.delete(`/circle/viewers/${viewerId}`),
};

// Viewer
export const viewerAPI = {
  getDashboard: () => api.get('/viewer/dashboard'),
};

// Settings
export const settingsAPI = {
  subscribePush: (subscription) => api.post('/settings/push-subscribe', { subscription }),
  unsubscribePush: (endpoint) => api.delete('/settings/push-subscribe', { data: { endpoint } }),
  updateNotifications: (data) => api.put('/settings/notifications', data),
  updateProfile: (data) => api.put('/settings/profile', data),
};

// Messages
export const messageAPI = {
  send: (data) => api.post('/messages', data),
  getHistory: (partnerId) => api.get(`/messages/history/${partnerId}`),
  getConversations: () => api.get('/messages/conversations'),
  getIncoming: () => api.get('/messages/incoming'),
  markRead: (id) => api.patch(`/messages/${id}`),
};

export default api;
