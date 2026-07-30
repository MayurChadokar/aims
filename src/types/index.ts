export type UserRole = 'admin' | 'user';

export type PlaceStatus = 'POINT' | 'CENTRE' | 'SUB CENTRE' | 'Active' | 'Pending' | 'Temporary';

export type DesignationType = 'Satsang Karta' | 'Reader' | 'Pathi';

export type GenderType = 'Male' | 'Female';

export type ApprovalPeriodType =
  | '6 Months'
  | '1 Year'
  | '2 Years'
  | '3 Years'
  | '4 Years'
  | '5 Years'
  | '6 Years';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  gr_number?: string;
  area: string;
  role: UserRole;
  is_disabled?: boolean;
  created_at: string;
}

export interface SatsangPlace {
  id: string;
  name: string;
  status: PlaceStatus;
  area: string;
  created_at: string;
}

export interface Member {
  id: string;
  gr_number?: string;
  area: string;
  satsang_place: string;
  status: PlaceStatus;
  designation: DesignationType;
  name: string;
  father_name: string;
  gender: GenderType;
  dob: string;
  age: number;
  qualification: string;
  approval_letter_number: string;
  approval_date: string;
  approval_period: ApprovalPeriodType;
  expiry_date: string;
  aadhaar: string;
  created_by?: string;
  created_at: string;
}

export interface MasterSettings {
  areas: string[];
  designations: DesignationType[];
  approvalPeriods: ApprovalPeriodType[];
}

export interface MemberFilterParams {
  searchQuery?: string;
  area?: string;
  designation?: DesignationType | 'All';
  status?: PlaceStatus | 'All';
  satsang_place?: string | 'All';
  approval_period?: ApprovalPeriodType | 'All';
  gender?: GenderType | 'All';
  sortBy?: 'approval_date' | 'expiry_date' | 'age' | 'created_at_desc' | 'created_at_asc';
  expiringWithinMonths?: number; // e.g. 2 for Tab 2
}

export type ExportFormat = 'excel' | 'csv' | 'pdf';
