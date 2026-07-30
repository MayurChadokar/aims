import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Member } from '../types';
import { formatDateDisplay, getRemainingDays } from './dateUtils';

/**
 * Format Member data into clean plain JSON objects for export
 */
function prepareMemberExportData(members: Member[]) {
  return members.map((m, index) => {
    const days = getRemainingDays(m.expiry_date);
    let remainingStatus = `${days} Days Left`;
    if (days < 0) remainingStatus = 'Expired';

    return {
      'S.No': index + 1,
      'Name': m.name,
      'Designation': m.designation,
      'Area': m.area,
      'Satsang Place': m.satsang_place,
      'Status': m.status,
      'Father / Husband Name': m.father_name,
      'Gender': m.gender,
      'Age': m.age,
      'Approval Letter No': m.approval_letter_number,
      'Approval Date': formatDateDisplay(m.approval_date),
      'Approval Period': m.approval_period,
      'Expiry Date': formatDateDisplay(m.expiry_date),
      'Remaining Days': remainingStatus,
      'Aadhaar': m.aadhaar,
    };
  });
}

/**
 * Export Member list to Excel (.xlsx)
 */
export function exportToExcel(members: Member[], filename = 'Satsang_Members_Report') {
  const exportData = prepareMemberExportData(members);
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
  
  // Set column widths
  const max_cols = [5, 20, 15, 12, 22, 10, 20, 8, 5, 18, 15, 12, 15, 15, 15];
  worksheet['!cols'] = max_cols.map(w => ({ wch: w }));

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export Member list to CSV (.csv)
 */
export function exportToCSV(members: Member[], filename = 'Satsang_Members_Report') {
  const exportData = prepareMemberExportData(members);
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Member list to PDF (.pdf) with professional government header
 */
export function exportToPDF(members: Member[], title = 'Satsang Tenure Members Report', filename = 'Satsang_Members_Report') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text('Approval Internal Management System (AIMS)', 14, 15);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${title} - Pithampur Area`, 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`, 14, 27);
  doc.text(`Total Records: ${members.length}`, 220, 27);

  const head = [['S.No', 'Name', 'Designation', 'Area', 'Satsang Place', 'Approval Date', 'Expiry Date', 'Remaining', 'Aadhaar']];

  const body = members.map((m, index) => {
    const days = getRemainingDays(m.expiry_date);
    let remainingStatus = `${days} Days Left`;
    if (days < 0) remainingStatus = 'Expired';

    return [
      index + 1,
      m.name,
      m.designation,
      m.area,
      m.satsang_place,
      formatDateDisplay(m.approval_date),
      formatDateDisplay(m.expiry_date),
      remainingStatus,
      m.aadhaar
    ];
  });

  autoTable(doc, {
    startY: 32,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138], // #1e3a8a
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { top: 32, left: 14, right: 14 }
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
