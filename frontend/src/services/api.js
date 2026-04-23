import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear auth state and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// Session
export const startSession = (classId, subject) =>
  api.post('/session/start', { classId, subject });

export const getActiveSession = (classId) =>
  api.get('/session/active', { params: { classId } });

export const endSession = (sessionId) =>
  api.post('/session/end', { sessionId });

// Attendance
export const markAttendance = (sessionId) =>
  api.post('/attendance/mark', { sessionId });

export const getSessionAttendance = (sessionId) =>
  api.get(`/attendance/session/${sessionId}`);

export const approveAttendance = (id) =>
  api.patch(`/attendance/${id}/approve`);

export const rejectAttendance = (id) =>
  api.patch(`/attendance/${id}/reject`);

export const manualMark = (studentId, sessionId, status) =>
  api.post('/attendance/manual', { studentId, sessionId, status });

export const submitAttendance = (sessionId) =>
  api.post('/attendance/submit', { sessionId });

export const getAttendanceHistory = () =>
  api.get('/attendance/history');

// Admin
export const createUser = (data) =>
  api.post('/admin/users', data);

export const listUsers = () =>
  api.get('/admin/users');

export const createClass = (name, teacherId) =>
  api.post('/admin/classes', { name, teacherId });

export const assignStudent = (classId, studentId) =>
  api.post(`/admin/classes/${classId}/assign`, { studentId });

export const getReports = () =>
  api.get('/admin/reports');

export default api;
