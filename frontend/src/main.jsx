import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/teacher" element={
          <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/student" element={
          <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
