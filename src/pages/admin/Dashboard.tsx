import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardMetrics, fetchMembers } from '../../services/api';
import { ExpiryAlertBanner } from '../../components/ExpiryAlertBanner';
import { RemainingDaysBadge } from '../../components/RemainingDaysBadge';
import { Member } from '../../types';
import { formatDateDisplay } from '../../utils/dateUtils';
import {
  Users,
  UserCheck,
  BookOpen,
  Scroll,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    totalSatsangKarta: 0,
    totalReaders: 0,
    totalPathi: 0,
    expiringCount: 0,
    expiredCount: 0,
    recentEntries: [] as Member[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Members',
      count: metrics.totalMembers,
      icon: Users,
      color: 'bg-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      path: '/admin/members',
    },
    {
      title: 'Total Satsang Karta',
      count: metrics.totalSatsangKarta,
      icon: UserCheck,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      path: '/admin/satsang-karta',
    },
    {
      title: 'Total Readers',
      count: metrics.totalReaders,
      icon: BookOpen,
      color: 'bg-sky-600',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      path: '/admin/reader',
    },
    {
      title: 'Total Pathi',
      count: metrics.totalPathi,
      icon: Scroll,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      path: '/admin/pathi',
    },
    {
      title: 'Expiring (Within 2 Months)',
      count: metrics.expiringCount,
      icon: AlertTriangle,
      color: 'bg-amber-600',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      path: '/admin/members?tab=expiring',
      highlight: true,
    },
    {
      title: 'Expired Members',
      count: metrics.expiredCount,
      icon: Clock,
      color: 'bg-rose-600',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      path: '/admin/members?tab=expiring',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-sans"
    >
      {/* Prominent Expiry Alert Banner at top of Dashboard */}
      <ExpiryAlertBanner expiringCount={metrics.expiringCount} />

      {/* Overview Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-gov border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Executive Dashboard Summary
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status overview of all Satsang members, designations, and tenure expirations.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/members')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gov-blue hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all shrink-0"
        >
          <span>View All Members</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate(card.path)}
            className={`cursor-pointer group p-5 rounded-2xl border ${card.borderColor} ${card.bgColor} hover:shadow-gov-lg transition-all relative overflow-hidden flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
              >
                <card.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div className={`text-3xl font-extrabold ${card.textColor}`}>
                {card.count}
              </div>
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 flex items-center gap-1">
                Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Entries Table */}
      <div className="bg-white rounded-2xl shadow-gov border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              Recent Member Registrations
            </h3>
            <p className="text-xs text-slate-500">Latest 5 member records entered in the system</p>
          </div>
          <button
            onClick={() => navigate('/admin/members')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Area / Place</th>
                <th className="p-3.5">Approval Date</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Tenure Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.recentEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No recent member records found.
                  </td>
                </tr>
              ) : (
                metrics.recentEntries.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{m.name}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                        {m.designation}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{m.satsang_place}</div>
                      <div className="text-[10px] text-slate-400">{m.area}</div>
                    </td>
                    <td className="p-3.5 font-medium">{formatDateDisplay(m.approval_date)}</td>
                    <td className="p-3.5 font-medium">{formatDateDisplay(m.expiry_date)}</td>
                    <td className="p-3.5">
                      <RemainingDaysBadge expiryDate={m.expiry_date} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
