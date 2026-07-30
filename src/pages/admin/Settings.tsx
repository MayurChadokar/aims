import React, { useEffect, useState } from 'react';
import { fetchMasterSettings, updateMasterSettings, syncAllLocalDataToSupabase } from '../../services/api';
import { isSupabaseConfigured } from '../../supabase/client';
import { MasterSettings, DesignationType, ApprovalPeriodType } from '../../types';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Plus, Trash2, Shield, Database, UploadCloud, CheckCircle2, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<MasterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // New item inputs
  const [newArea, setNewArea] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newPeriod, setNewPeriod] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMasterSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load master settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePushToDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllLocalDataToSupabase();
      if (res.success) {
        toast.success(res.message, { duration: 6000 });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Failed to sync data to database');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAddArea = () => {
    if (!newArea.trim()) return;
    if (settings.areas.includes(newArea.trim())) {
      toast.error('Area already exists');
      return;
    }
    const updated = { ...settings, areas: [...settings.areas, newArea.trim()] };
    setSettings(updated);
    updateMasterSettings(updated);
    setNewArea('');
    toast.success('Area added');
  };

  const handleRemoveArea = (item: string) => {
    if (settings.areas.length <= 1) {
      toast.error('At least one area must remain');
      return;
    }
    const updated = { ...settings, areas: settings.areas.filter((a) => a !== item) };
    setSettings(updated);
    updateMasterSettings(updated);
    toast.success('Area removed');
  };

  const handleAddDesignation = () => {
    if (!newDesignation.trim()) return;
    const updated = {
      ...settings,
      designations: [...settings.designations, newDesignation.trim() as DesignationType],
    };
    setSettings(updated);
    updateMasterSettings(updated);
    setNewDesignation('');
    toast.success('Designation added');
  };

  const handleRemoveDesignation = (item: DesignationType) => {
    if (settings.designations.length <= 1) {
      toast.error('At least one designation must remain');
      return;
    }
    const updated = {
      ...settings,
      designations: settings.designations.filter((d) => d !== item),
    };
    setSettings(updated);
    updateMasterSettings(updated);
    toast.success('Designation removed');
  };

  const handleAddPeriod = () => {
    if (!newPeriod.trim()) return;
    const updated = {
      ...settings,
      approvalPeriods: [...settings.approvalPeriods, newPeriod.trim() as ApprovalPeriodType],
    };
    setSettings(updated);
    updateMasterSettings(updated);
    setNewPeriod('');
    toast.success('Approval period added');
  };

  const handleRemovePeriod = (item: ApprovalPeriodType) => {
    if (settings.approvalPeriods.length <= 1) {
      toast.error('At least one approval period must remain');
      return;
    }
    const updated = {
      ...settings,
      approvalPeriods: settings.approvalPeriods.filter((p) => p !== item),
    };
    setSettings(updated);
    updateMasterSettings(updated);
    toast.success('Approval period removed');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-sans max-w-4xl"
    >
      {/* Database Connection & Sync Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-blue-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl shrink-0">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  Supabase PostgreSQL Database Status
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    isSupabaseConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL MODE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Every new Satsang Place, Member registration, or Excel import created in the app is directly pushed to the database. Click below to push all 29 default Satsang Places and Member records directly into Supabase DB.
              </p>
            </div>
          </div>

          <button
            onClick={handlePushToDatabase}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all shrink-0 active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Push All Data to Supabase DB</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Area Options */}
      <div className="bg-white p-6 rounded-2xl shadow-gov border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Master Area List
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            placeholder="Add new Area (e.g. Bhopal)"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleAddArea}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Area
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {settings.areas.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
            >
              {a}
              <button
                onClick={() => handleRemoveArea(a)}
                className="text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 2. Designation Options */}
      <div className="bg-white p-6 rounded-2xl shadow-gov border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          Master Designation Options
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newDesignation}
            onChange={(e) => setNewDesignation(e.target.value)}
            placeholder="Add new Designation option"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleAddDesignation}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Designation
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {settings.designations.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200"
            >
              {d}
              <button
                onClick={() => handleRemoveDesignation(d)}
                className="text-indigo-400 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Approval Periods */}
      <div className="bg-white p-6 rounded-2xl shadow-gov border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Master Approval Tenure Periods
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value)}
            placeholder="Add Approval Period (e.g. 10 Years)"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleAddPeriod}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Period
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {settings.approvalPeriods.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200"
            >
              {p}
              <button
                onClick={() => handleRemovePeriod(p)}
                className="text-emerald-400 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
