import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ShieldCheck, User } from 'lucide-react';

export const UserLayout: React.FC = () => {
  const { isAuthenticated, currentUser, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 bg-gov-blue text-white shadow-md px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-sm border border-white/30">
              AIMS
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Member Registration</h1>
              <p className="text-[11px] text-blue-200">Pithampur Area Internal Approval System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-1.5 bg-blue-700 hover:bg-blue-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1 border border-blue-500"
                title="Switch to Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* User Info Strip */}
      <div className="bg-slate-200 border-b border-slate-300 px-4 py-2 text-xs text-slate-700">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="font-medium flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-blue-600" />
            Logged in as: <strong className="text-slate-900">{currentUser?.name} {currentUser?.gr_number ? `(${currentUser.gr_number})` : ''}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold">
            Area: {currentUser?.area || 'Pithampur'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 text-center text-xs text-slate-500 bg-white border-t border-slate-200 font-medium">
        All rights reserved to Pithampur Area Internal Approval System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};
