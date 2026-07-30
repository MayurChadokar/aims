import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { fetchMembers } from '../services/api';
import { getRemainingDays } from '../utils/dateUtils';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expiringCount, setExpiringCount] = useState(0);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const members = await fetchMembers();
        const count = members.filter((m) => {
          const days = getRemainingDays(m.expiry_date);
          return days <= 60;
        }).length;
        setExpiringCount(count);
      } catch (err) {
        console.error(err);
      }
    }
    if (isAuthenticated) {
      loadMetrics();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading AIMS Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/user/register" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        expiringCount={expiringCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white font-medium">
          Approval Internal Management System (AIMS) &copy; {new Date().getFullYear()} &bull; All rights reserved to Pithampur Area
        </footer>
      </div>
    </div>
  );
};
