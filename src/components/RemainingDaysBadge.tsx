import React from 'react';
import { getRemainingDays } from '../utils/dateUtils';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface RemainingDaysBadgeProps {
  expiryDate: string;
}

export const RemainingDaysBadge: React.FC<RemainingDaysBadgeProps> = ({ expiryDate }) => {
  const days = getRemainingDays(expiryDate);

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        <AlertTriangle className="w-3.5 h-3.5" />
        Expired ({Math.abs(days)}d ago)
      </span>
    );
  }

  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 animate-pulse">
        <Clock className="w-3.5 h-3.5 text-red-600" />
        {days} Days Left
      </span>
    );
  }

  if (days <= 60) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        {days} Days Left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
      {days} Days Left
    </span>
  );
};
