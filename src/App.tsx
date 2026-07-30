import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { UserLayout } from './layouts/UserLayout';

// Pages
import { Login } from './pages/Login';
import { MemberRegistration } from './pages/user/MemberRegistration';
import { Dashboard } from './pages/admin/Dashboard';
import { DesignationPage } from './pages/admin/DesignationPage';
import { UserManagement } from './pages/admin/UserManagement';
import { SatsangPlaceManagement } from './pages/admin/SatsangPlaceManagement';
import { Settings } from './pages/admin/Settings';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/user/register" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* User Portal (Mobile First) */}
          <Route path="/user" element={<UserLayout />}>
            <Route path="register" element={<MemberRegistration />} />
            <Route index element={<Navigate to="register" replace />} />
          </Route>

          {/* Admin Portal (Desktop Dashboard) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="members"
              element={<DesignationPage pageTitle="All Satsang Members" />}
            />
            <Route
              path="satsang-karta"
              element={
                <DesignationPage
                  fixedDesignation="Satsang Karta"
                  pageTitle="Satsang Karta Directory"
                />
              }
            />
            <Route
              path="reader"
              element={
                <DesignationPage fixedDesignation="Reader" pageTitle="Reader Directory" />
              }
            />
            <Route
              path="pathi"
              element={
                <DesignationPage fixedDesignation="Pathi" pageTitle="Pathi Directory" />
              }
            />
            <Route path="satsang-places" element={<SatsangPlaceManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
