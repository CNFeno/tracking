// App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import DashboardContent from './components/layout/DashboardContent';
import AccessManagementContent from './components/layout/AccessManagementContent';
import AddAccessContent from './components/layout/AddAccessContent';
import PlateformeManagementContent from './components/layout/PlateformeManagementContent';
import LoginForm from './components/layout/LoginForm';
import AddUserForm from './components/layout/AddUserForm';
import UserManagementContent from './components/layout/UserManagementContent';
import RequireAuth from './components/auth/RequireAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Unauthorized from './components/layout/unauthorized';
//import { useEffect } from 'react';
import IdleLogout from './components/auth/IdleLogout';

function LayoutRoutes() {
  const location = useLocation();
  const hideSidebarRoutes = ['/login']; // 🚫 Liste des routes sans sidebar
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);
  const showIdleLogout = !hideSidebar; // Active le logout sauf sur /login

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showIdleLogout && <IdleLogout />} {/* 👈 Inactivité détectée */}
      {!hideSidebar && <Sidebar />}
      <div className="flex-1">
        <Routes>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardContent /></RequireAuth>} />
          <Route path="/access" element={<RequireAuth><AccessManagementContent /></RequireAuth>} />
          <Route path="/access/add" element={
            <RequireAuth>
              <ProtectedRoute allowedRoles={['ADMIN']}><AddAccessContent /></ProtectedRoute>
            </RequireAuth>} />
          <Route path="/access/:accessId" element={
            <RequireAuth><AddAccessContent /></RequireAuth>
          } />
          <Route path="/setting" element={
            <RequireAuth>
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PlateformeManagementContent />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/users" element={
            <RequireAuth>
              <ProtectedRoute allowedRoles={['ADMIN']}><UserManagementContent /></ProtectedRoute>
            </RequireAuth>} />
          <Route path="/users/add" element={
            <RequireAuth>
              <ProtectedRoute allowedRoles={['ADMIN']}><AddUserForm mode="add" /></ProtectedRoute>
            </RequireAuth>} />
          <Route path="/users/:usersId" element={
            <RequireAuth>
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AddUserForm />
              </ProtectedRoute>
            </RequireAuth>} />

        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router basename='/omit-suivi/accesstrack'>
      <LayoutRoutes />
    </Router>
  );
}
