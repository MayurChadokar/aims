import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExpiryAlertBannerProps {
  expiringCount: number;
}

export const ExpiryAlertBanner: React.FC<ExpiryAlertBannerProps> = ({ expiringCount }) => {
  const navigate = useNavigate();

  if (expiringCount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/admin/members?tab=expiring')}
      className="cursor-pointer group relative overflow-hidden mb-6 p-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/80 transition-all shadow-sm flex items-center justify-between"
    >
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-amber-500 text-white rounded-lg shadow-sm flex items-center justify-center animate-bounce">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-amber-900 flex items-center gap-2">
            <span>⚠️ Attention Required</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-200 text-amber-900 rounded-full border border-amber-300">
              High Priority
            </span>
          </h4>
          <p className="text-sm font-medium text-amber-800 mt-0.5">
            <span className="font-bold underline decoration-amber-500">{expiringCount} Members</span> are going to expire within the next 2 months.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-white/80 group-hover:bg-white px-3 py-2 rounded-lg border border-amber-200 shadow-xs transition-colors shrink-0">
        <span>View Expiring List</span>
        <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};
