import React from 'react';
import { Member } from '../types';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportButtonsProps {
  members: Member[];
  title?: string;
  filename?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  members,
  title = 'Satsang Tenure Members Report',
  filename = 'STMS_Members_List',
}) => {
  const handleExcel = () => {
    if (members.length === 0) {
      toast.error('No data available to export');
      return;
    }
    exportToExcel(members, filename);
    toast.success('Excel report downloaded');
  };

  const handleCSV = () => {
    if (members.length === 0) {
      toast.error('No data available to export');
      return;
    }
    exportToCSV(members, filename);
    toast.success('CSV report downloaded');
  };

  const handlePDF = () => {
    if (members.length === 0) {
      toast.error('No data available to export');
      return;
    }
    exportToPDF(members, title, filename);
    toast.success('PDF document generated');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:inline">
        Export:
      </span>
      <button
        onClick={handleExcel}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-sm"
        title="Export to Microsoft Excel (.xlsx)"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        Excel
      </button>
      <button
        onClick={handleCSV}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-sm"
        title="Export to CSV (.csv)"
      >
        <Download className="w-3.5 h-3.5" />
        CSV
      </button>
      <button
        onClick={handlePDF}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-sm"
        title="Export to PDF Document (.pdf)"
      >
        <FileText className="w-3.5 h-3.5" />
        PDF
      </button>
    </div>
  );
};
