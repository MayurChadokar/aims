import React from 'react';
import { Menu, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, title }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              {title || 'Approval Internal Management System (AIMS)'}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Pithampur Area Internal Approval System
            </p>
          </div>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            {currentUser?.role === 'admin' ? (
              <Shield className="w-4 h-4 text-blue-600" />
            ) : (
              <UserIcon className="w-4 h-4 text-emerald-600" />
            )}
            <span className="text-xs font-semibold text-slate-700">
              {currentUser?.name} {currentUser?.gr_number ? `(${currentUser.gr_number})` : ''}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {currentUser?.area || 'Pithampur'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
