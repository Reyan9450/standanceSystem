import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/api/auth/login', { email, password });

// Session
export const startSession = (classId, subject) => api.post('/api/session/start', { classId, subject });
export const getActiveSession = (classId) => api.get('/api/session/active', { params: { classId } });
export const endSession = (sessionId) => api.post('/api/session/end', { sessionId });

// Attendance
export const markAttendance = (sessionId) => api.post('/api/attendance/mark', { sessionId });
export const getSessionAttendance = (sessionId) => api.get(`/api/attendance/session/${sessionId}`);
export const approveAttendance = (id) => api.patch(`/api/attendance/${id}/approve`);
export const rejectAttendance = (id) => api.patch(`/api/attendance/${id}/reject`);
export const manualMark = (studentId, sessionId, status) => api.post('/api/attendance/manual', { studentId, sessionId, status });
export const submitAttendance = (sessionId) => api.post('/api/attendance/submit', { sessionId });
export const getAttendanceHistory = () => api.get('/api/attendance/history');

// Admin
export const createUser = (data) => api.post('/api/admin/users', data);
export const listUsers = () => api.get('/api/admin/users');
export const createClass = (name, teacherId) => api.post('/api/admin/classes', { name, teacherId });
export const assignStudent = (classId, studentId) => api.post(`/api/admin/classes/${classId}/assign`, { studentId });
export const getReports = () => api.get('/api/admin/reports');

export default api;
