import React from 'react';
import { Member } from '../types';
import { formatDateDisplay, getRemainingDays } from '../utils/dateUtils';
import { RemainingDaysBadge } from './RemainingDaysBadge';
import { Modal } from './Modal';
import {
  User,
  FileText,
  Calendar,
  Building2,
  IdCard,
  History,
  Printer,
  CheckCircle2,
  Clock,
  Award,
  BadgeCheck,
} from 'lucide-react';
import { exportToPDF } from '../utils/exportUtils';
import toast from 'react-hot-toast';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  if (!member) return null;

  const remainingDays = getRemainingDays(member.expiry_date);

  const handlePrintMember = () => {
    exportToPDF([member], `Member Profile & History - ${member.name}`, `Profile_${member.name.replace(/\s+/g, '_')}`);
    toast.success(`Exported profile for ${member.name}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Profile & Tenure History" maxWidth="xl">
      <div className="space-y-6 font-sans">
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black text-blue-200 shadow-inner shrink-0">
                {member.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-white">{member.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    {member.designation}
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-1 flex items-center gap-2">
                  <span>S/o / W/o: <strong>{member.father_name}</strong></span>
                  <span>&bull;</span>
                  <span>Area: <strong>{member.area}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-end gap-2">
              <RemainingDaysBadge expiryDate={member.expiry_date} />
              <span className="text-[11px] text-slate-300 font-mono">
                Aadhaar: {member.aadhaar}
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Complete Member Dashboard & Records
          </h3>
          <button
            onClick={handlePrintMember}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Download Profile PDF
          </button>
        </div>

        {/* Grid Section 1: Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Personal Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
              <IdCard className="w-4 h-4 text-blue-600" />
              Personal & Demographic Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Gender:</span>
                <span className="font-semibold text-slate-900">{member.gender}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth:</span>
                <span className="font-semibold text-slate-900">{formatDateDisplay(member.dob)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Age:</span>
                <span className="font-bold text-blue-700">{member.age} Years</span>
              </div>
              <div>
                <span className="text-slate-500 block">Qualification:</span>
                <span className="font-semibold text-slate-900">{member.qualification || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Card: Satsang Place & Location */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Location & Place Status
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block">Satsang Place Name:</span>
                <span className="font-bold text-slate-900 text-sm">{member.satsang_place}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Place Status:</span>
                  <span className="font-semibold text-slate-900">{member.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Area:</span>
                  <span className="font-semibold text-slate-900">{member.area}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Section 2: Approval Letters & Tenure History */}
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200/80 space-y-3">
          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-blue-200 pb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Approval Letter & Active Tenure Details
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
              <span className="text-slate-500 block text-[11px]">Approval Letter No:</span>
              <span className="font-mono font-bold text-blue-900 text-sm">{member.approval_letter_number}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
              <span className="text-slate-500 block text-[11px]">Date of Approval:</span>
              <span className="font-bold text-slate-800">{formatDateDisplay(member.approval_date)}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
              <span className="text-slate-500 block text-[11px]">Approval Period:</span>
              <span className="font-bold text-slate-800">{member.approval_period}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
              <span className="text-slate-500 block text-[11px]">Calculated Expiry:</span>
              <span className="font-bold text-rose-700">{formatDateDisplay(member.expiry_date)}</span>
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-blue-600" />
            Tenure & Letter History Log
          </h4>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Log Item 1: Current Active Tenure */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                    Active Tenure Approval (Letter: {member.approval_letter_number})
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {formatDateDisplay(member.approval_date)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Approved for <strong>{member.approval_period}</strong> tenure at {member.satsang_place}. Expiry Date set to {formatDateDisplay(member.expiry_date)}.
                </p>
              </div>
            </div>

            {/* Log Item 2: Registration Log */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100" />
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Member Registration Verified
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {formatDateDisplay(member.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Member profile registered into AIMS system for area {member.area}. Aadhaar: {member.aadhaar}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </Modal>
  );
};
