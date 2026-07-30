import { ApprovalPeriodType } from '../types';
import { differenceInDays, addMonths, addYears, parseISO, format, isValid } from 'date-fns';

/**
 * Calculates exact age in years based on Date of Birth string (YYYY-MM-DD)
 */
export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Calculates Expiry Date based on Approval Date & Approval Period string
 * Example: '10 Jan 2025' + '2 Years' = '10 Jan 2027' (returns 'YYYY-MM-DD')
 */
export function calculateExpiryDate(approvalDateStr: string, period: ApprovalPeriodType): string {
  if (!approvalDateStr || !period) return '';
  const startDate = parseISO(approvalDateStr);
  if (!isValid(startDate)) return '';

  let expiryDate: Date;

  switch (period) {
    case '6 Months':
      expiryDate = addMonths(startDate, 6);
      break;
    case '1 Year':
      expiryDate = addYears(startDate, 1);
      break;
    case '2 Years':
      expiryDate = addYears(startDate, 2);
      break;
    case '3 Years':
      expiryDate = addYears(startDate, 3);
      break;
    case '4 Years':
      expiryDate = addYears(startDate, 4);
      break;
    case '5 Years':
      expiryDate = addYears(startDate, 5);
      break;
    case '6 Years':
      expiryDate = addYears(startDate, 6);
      break;
    default:
      expiryDate = addYears(startDate, 1);
  }

  return format(expiryDate, 'yyyy-MM-dd');
}

/**
 * Returns remaining days from current date to Expiry Date
 */
export function getRemainingDays(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  const expiryDate = parseISO(expiryDateStr);
  if (!isValid(expiryDate)) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return differenceInDays(expiryDate, today);
}

/**
 * Helper to check if a member is expiring within 60 days (or 2 months)
 */
export function isExpiringWithin60Days(expiryDateStr: string): boolean {
  const days = getRemainingDays(expiryDateStr);
  return days >= 0 && days <= 60;
}

/**
 * Helper to check if a member is already expired
 */
export function isExpired(expiryDateStr: string): boolean {
  const days = getRemainingDays(expiryDateStr);
  return days < 0;
}

/**
 * Format ISO date string into readable user display e.g., '10 Jan 2025'
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '-';
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, 'dd MMM yyyy');
}
