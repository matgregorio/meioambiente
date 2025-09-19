import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import SchedulePage from '../pages/SchedulePage';
import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import DriverDashboardPage from '../pages/DriverDashboardPage';
import ConfirmationPage from '../pages/ConfirmationPage';
import VerificationPage from '../pages/VerificationPage';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="driver"
          element={
            <ProtectedRoute roles={['driver']}>
              <DriverDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="confirmation/:protocol" element={<ConfirmationPage />} />
        <Route path="verify/:protocol" element={<VerificationPage />} />
      </Route>
    </Routes>
  );
}
