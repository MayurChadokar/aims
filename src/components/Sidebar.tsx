import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Scroll,
  UserCog,
  Settings,
  LogOut,
  Building2,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  expiringCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  setMobileOpen,
  expiringCount = 0,
}) => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Members', path: '/admin/members', icon: Users, badge: expiringCount > 0 ? expiringCount : null },
    { label: 'Satsang Karta', path: '/admin/satsang-karta', icon: UserCheck },
    { label: 'Reader', path: '/admin/reader', icon: BookOpen },
    { label: 'Pathi', path: '/admin/pathi', icon: Scroll },
    { label: 'Places', path: '/admin/satsang-places', icon: Building2 },
    { label: 'Users', path: '/admin/users', icon: UserCog },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            AIMS
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">AIMS Portal</h1>
            <p className="text-xs text-slate-400">Approval Management</p>
          </div>
        </div>

        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info Card */}
      <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 text-blue-400 font-semibold flex items-center justify-center text-xs uppercase border border-slate-600">
          {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-medium text-white truncate">{currentUser?.name || 'Administrator'}</p>
          <p className="text-[11px] text-blue-400 font-mono truncate">{currentUser?.gr_number || currentUser?.role || 'Admin'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Registration Direct Link for Admins */}
      <div className="p-3 border-t border-slate-800">
        <NavLink
          to="/user/register"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800 rounded-lg transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Switch to User Form
        </NavLink>
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0 h-screen sticky top-0">{content}</div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
};
