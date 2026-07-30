import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Hash, UserCheck, KeyRound, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [grNumber, setGrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grNumber || !password) return;

    setIsSubmitting(true);
    const success = await login(grNumber, password);
    setIsSubmitting(false);

    if (success) {
      if (grNumber.toLowerCase().includes('m00001') || grNumber.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/register');
      }
    }
  };

  const handleDemoAdmin = async () => {
    setGrNumber('M00001');
    setPassword('admin123');
    setIsSubmitting(true);
    const ok = await login('M00001', 'admin123');
    setIsSubmitting(false);
    if (ok) navigate('/admin/dashboard');
  };

  const handleDemoUser = async () => {
    setGrNumber('M00002');
    setPassword('user123');
    setIsSubmitting(true);
    const ok = await login('M00002', 'user123');
    setIsSubmitting(false);
    if (ok) navigate('/user/register');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10"
      >
        {/* Header Branding */}
        <div className="bg-gov-blue p-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <Shield className="w-9 h-9 text-blue-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AIMS Portal</h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">
            Approval Internal Management System
          </p>
          <p className="text-[11px] text-blue-300/90 mt-0.5 font-normal">
            Pithampur Area Internal Approval System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              GR Number
            </label>
            <div className="relative">
              <Hash className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={grNumber}
                onChange={(e) => setGrNumber(e.target.value)}
                placeholder="e.g. M00001"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gov-blue hover:bg-blue-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Secure Sign In</span>
              </>
            )}
          </button>

          {/* Quick Demo Access Buttons */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-semibold text-center mb-3 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Authentication (GR Number):</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                Admin (M00001)
              </button>
              <button
                type="button"
                onClick={handleDemoUser}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                User (M00002)
              </button>
            </div>
          </div>
        </form>

        {/* Footer info */}
        <div className="px-8 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
          All rights reserved to Pithampur Area Internal Approval System
        </div>
      </motion.div>
    </div>
  );
};
