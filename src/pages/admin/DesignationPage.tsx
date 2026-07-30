import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchMembers, fetchSatsangPlaces, fetchMasterSettings } from '../../services/api';
import { Member, DesignationType, SatsangPlace, MasterSettings, ApprovalPeriodType } from '../../types';
import { formatDateDisplay, getRemainingDays } from '../../utils/dateUtils';
import { RemainingDaysBadge } from '../../components/RemainingDaysBadge';
import { ExportButtons } from '../../components/ExportButtons';
import { MemberProfileModal } from '../../components/MemberProfileModal';
import { ImportExcelModal } from '../../components/ImportExcelModal';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface DesignationPageProps {
  fixedDesignation?: DesignationType;
  pageTitle: string;
}

export const DesignationPage: React.FC<DesignationPageProps> = ({
  fixedDesignation,
  pageTitle,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') === 'expiring' ? 'expiring' : 'full';

  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [satsangPlaces, setSatsangPlaces] = useState<SatsangPlace[]>([]);
  const [masterSettings, setMasterSettings] = useState<MasterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedProfileMember, setSelectedProfileMember] = useState<Member | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedDesignation, setSelectedDesignation] = useState<string>(
    fixedDesignation || 'All'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPlace, setSelectedPlace] = useState<string>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'approval_date' | 'expiry_date' | 'age' | 'newest' | 'oldest'>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Load backend data
  const loadData = async () => {
    setLoading(true);
    try {
      const allMembers = await fetchMembers();
      const places = await fetchSatsangPlaces();
      const settings = await fetchMasterSettings();

      setMembers(allMembers);
      setSatsangPlaces(places);
      setMasterSettings(settings);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load members list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fixedDesignation]);

  useEffect(() => {
    if (fixedDesignation) {
      setSelectedDesignation(fixedDesignation);
    }
  }, [fixedDesignation]);

  // Filter & Sort Logic
  const filteredMembers = useMemo(() => {
    let result = [...members];

    if (fixedDesignation) {
      result = result.filter((m) => m.designation === fixedDesignation);
    } else if (selectedDesignation !== 'All') {
      result = result.filter((m) => m.designation === selectedDesignation);
    }

    if (activeTabParam === 'expiring') {
      result = result.filter((m) => {
        const days = getRemainingDays(m.expiry_date);
        return days <= 60;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.aadhaar.includes(q) ||
          m.approval_letter_number.toLowerCase().includes(q)
      );
    }

    if (selectedArea !== 'All') {
      result = result.filter((m) => m.area === selectedArea);
    }

    if (selectedStatus !== 'All') {
      result = result.filter((m) => m.status === selectedStatus);
    }

    if (selectedPlace !== 'All') {
      result = result.filter((m) => m.satsang_place === selectedPlace);
    }

    if (selectedPeriod !== 'All') {
      result = result.filter((m) => m.approval_period === selectedPeriod);
    }

    if (selectedGender !== 'All') {
      result = result.filter((m) => m.gender === selectedGender);
    }

    switch (sortBy) {
      case 'approval_date':
        result.sort((a, b) => new Date(b.approval_date).getTime() - new Date(a.approval_date).getTime());
        break;
      case 'expiry_date':
        result.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
        break;
      case 'age':
        result.sort((a, b) => b.age - a.age);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
    }

    return result;
  }, [
    members,
    fixedDesignation,
    activeTabParam,
    searchQuery,
    selectedArea,
    selectedDesignation,
    selectedStatus,
    selectedPlace,
    selectedPeriod,
    selectedGender,
    sortBy,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTabParam,
    searchQuery,
    selectedArea,
    selectedDesignation,
    selectedStatus,
    selectedPlace,
    selectedPeriod,
    selectedGender,
    sortBy,
    pageSize,
  ]);

  const totalRecords = filteredMembers.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + pageSize);

  const handleTabChange = (tab: 'full' | 'expiring') => {
    if (tab === 'expiring') {
      setSearchParams({ tab: 'expiring' });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenProfileModal = (member: Member) => {
    setSelectedProfileMember(member);
    setIsProfileModalOpen(true);
  };

  const handleExtensionClick = (member: Member) => {
    // TODO: Extension Approval Workflow - Future backend workflow integration
    toast(`Extension request initiated for ${member.name}. (UI Ready - Backend Workflow Pending)`, {
      icon: '⏳',
      duration: 4000,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedArea('All');
    if (!fixedDesignation) setSelectedDesignation('All');
    setSelectedStatus('All');
    setSelectedPlace('All');
    setSelectedPeriod('All');
    setSelectedGender('All');
    setSortBy('newest');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-sans"
    >
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-gov border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{pageTitle}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage tenure details, search, filter, export, and bulk import Excel data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg transition-colors shadow-xs"
            title="Import Member Records from Excel Sheet"
          >
            <Upload className="w-3.5 h-3.5 text-blue-700" />
            <span>Import Excel / CSV</span>
          </button>

          <ExportButtons
            members={filteredMembers}
            title={`${pageTitle} - ${activeTabParam === 'expiring' ? 'Expiring List' : 'Full List'}`}
            filename={`STMS_${pageTitle.replace(/\s+/g, '_')}`}
          />
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-5 pt-3 rounded-2xl shadow-gov">
        <button
          onClick={() => handleTabChange('full')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTabParam === 'full'
              ? 'border-blue-600 text-blue-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Tab 1: Full List</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
            {fixedDesignation
              ? members.filter((m) => m.designation === fixedDesignation).length
              : members.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('expiring')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTabParam === 'expiring'
              ? 'border-amber-500 text-amber-800 font-extrabold bg-amber-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-amber-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Tab 2: Expiring Within 2 Months</span>
          <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-200 text-amber-900 border border-amber-300">
            {
              (fixedDesignation
                ? members.filter((m) => m.designation === fixedDesignation)
                : members
              ).filter((m) => getRemainingDays(m.expiry_date) <= 60).length
            }
          </span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-gov border border-slate-200 space-y-4">
        {/* Search & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member by Name, Aadhaar Number, or Approval Letter No..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="approval_date">Sort: Approval Date</option>
              <option value="expiry_date">Sort: Expiry Date</option>
              <option value="age">Sort: Age (Highest First)</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="All">All Areas</option>
              {masterSettings?.areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {!fixedDesignation && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Designation
              </label>
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="All">All Designations</option>
                <option value="Satsang Karta">Satsang Karta</option>
                <option value="Reader">Reader</option>
                <option value="Pathi">Pathi</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="POINT">POINT</option>
              <option value="CENTRE">CENTRE</option>
              <option value="SUB CENTRE">SUB CENTRE</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Satsang Place</label>
            <select
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 truncate"
            >
              <option value="All">All Places</option>
              {satsangPlaces.map((sp) => (
                <option key={sp.id} value={sp.name}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="All">All Periods</option>
              {masterSettings?.approvalPeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing {filteredMembers.length} records matching criteria</span>
          <button
            onClick={handleResetFilters}
            className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-gov border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Area</th>
                <th className="p-3.5">Satsang Place</th>
                <th className="p-3.5">Approval Date</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Remaining Days</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading members...
                  </td>
                </tr>
              ) : paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No member records found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Quick Profile Trigger */}
                    <td className="p-3.5">
                      <button
                        onClick={() => handleOpenProfileModal(m)}
                        className="font-bold text-slate-900 hover:text-blue-700 text-left transition-colors group flex items-center gap-1.5"
                        title="Click to view full member history dashboard"
                      >
                        <span>{m.name}</span>
                        <Eye className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Aadhaar: {m.aadhaar} | Letter: {m.approval_letter_number}
                      </div>
                    </td>

                    <td className="p-3.5 font-medium">{m.area}</td>
                    <td className="p-3.5 font-medium text-slate-800">{m.satsang_place}</td>
                    <td className="p-3.5 font-medium">{formatDateDisplay(m.approval_date)}</td>
                    <td className="p-3.5 font-medium text-slate-900">{formatDateDisplay(m.expiry_date)}</td>

                    <td className="p-3.5">
                      <RemainingDaysBadge expiryDate={m.expiry_date} />
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          m.status === 'POINT' || m.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : m.status === 'CENTRE'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : m.status === 'SUB CENTRE'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>

                    {/* Actions: View History & Extension UI Buttons */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenProfileModal(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all shadow-xs"
                          title="View Full History Dashboard"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>History</span>
                        </button>

                        <button
                          onClick={() => handleExtensionClick(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
                          title="Request Extension"
                        >
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Extension</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Show rows:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="py-1 px-2.5 bg-white border border-slate-300 rounded-lg font-bold outline-none"
            >
              <option value={10}>10 Rows</option>
              <option value={25}>25 Rows</option>
              <option value={50}>50 Rows</option>
              <option value={100}>100 Rows</option>
            </select>
            <span className="ml-2 font-medium">
              Showing {totalRecords > 0 ? startIndex + 1 : 0} to{' '}
              {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords} entries
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-100 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-100 font-semibold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Member History Profile Modal */}
      <MemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        member={selectedProfileMember}
      />

      {/* Bulk Excel Import Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadData}
      />
    </motion.div>
  );
};
