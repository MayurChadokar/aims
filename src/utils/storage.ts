import { User, SatsangPlace, Member, MasterSettings } from '../types';
import { DEFAULT_AREAS, DESIGNATION_OPTIONS, APPROVAL_PERIOD_OPTIONS, INITIAL_SATSANG_PLACES } from '../constants';

const USERS_KEY = 'stms_users';
const PLACES_KEY = 'stms_satsang_places';
const MEMBERS_KEY = 'stms_members';
const SETTINGS_KEY = 'stms_master_settings';

// Helper date math for initial seed
function getOffsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getPastDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

// Initial Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'System Administrator',
    email: 'admin@aims.pithampur.org',
    username: 'admin',
    gr_number: 'M00001',
    area: 'Pithampur',
    role: 'admin',
    is_disabled: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'usr-user-1',
    name: 'Pithampur Area Operator',
    email: 'user@aims.pithampur.org',
    username: 'pithampur_op',
    gr_number: 'M00002',
    area: 'Pithampur',
    role: 'user',
    is_disabled: false,
    created_at: new Date().toISOString(),
  },
];

// Initial Seed Members with diverse tenure expirations
const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    gr_number: 'GR-00101',
    area: 'Pithampur',
    satsang_place: 'ANJANIYA',
    status: 'POINT',
    designation: 'Satsang Karta',
    name: 'Rajesh Sharma',
    father_name: 'Ramesh Sharma',
    gender: 'Male',
    dob: '1980-05-14',
    age: 46,
    qualification: 'B.Com, M.A.',
    approval_letter_number: 'AP-2023-089',
    approval_date: getPastDate(22),
    approval_period: '2 Years',
    expiry_date: getOffsetDate(45), // Expiring in 45 days (Yellow)
    aadhaar: '987654321012',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    gr_number: 'GR-00102',
    area: 'Pithampur',
    satsang_place: 'RAJGARH',
    status: 'CENTRE',
    designation: 'Reader',
    name: 'Anil Verma',
    father_name: 'Suresh Verma',
    gender: 'Male',
    dob: '1985-08-20',
    age: 40,
    qualification: 'Graduate',
    approval_letter_number: 'AP-2024-102',
    approval_date: getPastDate(11),
    approval_period: '1 Year',
    expiry_date: getOffsetDate(18), // Expiring in 18 days (Yellow/Red)
    aadhaar: '876543210921',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    gr_number: 'GR-00103',
    area: 'Pithampur',
    satsang_place: 'PIPLIYA',
    status: 'CENTRE',
    designation: 'Pathi',
    name: 'Sunita Devi',
    father_name: 'Vijay Kumar',
    gender: 'Female',
    dob: '1990-02-10',
    age: 36,
    qualification: 'B.Ed',
    approval_letter_number: 'AP-2024-045',
    approval_date: getPastDate(5),
    approval_period: '6 Months',
    expiry_date: getOffsetDate(12), // Expiring in 12 days (Yellow/Red)
    aadhaar: '765432109832',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-4',
    gr_number: 'GR-00104',
    area: 'Pithampur',
    satsang_place: 'PITHAMPUR',
    status: 'CENTRE',
    designation: 'Satsang Karta',
    name: 'Mahesh Gupta',
    father_name: 'Jagdish Gupta',
    gender: 'Male',
    dob: '1975-12-01',
    age: 50,
    qualification: 'M.Com',
    approval_letter_number: 'AP-2022-301',
    approval_date: getPastDate(36),
    approval_period: '3 Years',
    expiry_date: getOffsetDate(-15), // Expired 15 days ago (Red)
    aadhaar: '654321098743',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-5',
    gr_number: 'GR-00105',
    area: 'Pithampur',
    satsang_place: 'DHAR',
    status: 'SUB CENTRE',
    designation: 'Reader',
    name: 'Priya Patel',
    father_name: 'Dharmesh Patel',
    gender: 'Female',
    dob: '1992-06-18',
    age: 34,
    qualification: 'M.Sc',
    approval_letter_number: 'AP-2023-112',
    approval_date: getPastDate(12),
    approval_period: '3 Years',
    expiry_date: getOffsetDate(730), // 2 Years left (Green)
    aadhaar: '543210987654',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-6',
    gr_number: 'GR-00106',
    area: 'Pithampur',
    satsang_place: 'BIDWAL',
    status: 'CENTRE',
    designation: 'Pathi',
    name: 'Vikram Singh',
    father_name: 'Harbansh Singh',
    gender: 'Male',
    dob: '1988-11-25',
    age: 37,
    qualification: 'B.A.',
    approval_letter_number: 'AP-2024-550',
    approval_date: getPastDate(8),
    approval_period: '1 Year',
    expiry_date: getOffsetDate(120), // 4 Months left (Green)
    aadhaar: '432109876565',
    created_at: new Date().toISOString(),
  },
];

export function initializeLocalStorage(): void {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  }

  const existingPlaces = localStorage.getItem(PLACES_KEY);
  let placesCount = 0;
  try {
    placesCount = existingPlaces ? JSON.parse(existingPlaces).length : 0;
  } catch (e) {
    placesCount = 0;
  }

  if (!existingPlaces || placesCount < 5 || existingPlaces.includes('Location A')) {
    localStorage.setItem(PLACES_KEY, JSON.stringify(INITIAL_SATSANG_PLACES));
  }

  const existingMembers = localStorage.getItem(MEMBERS_KEY);
  let membersCount = 0;
  try {
    membersCount = existingMembers ? JSON.parse(existingMembers).length : 0;
  } catch (e) {
    membersCount = 0;
  }

  if (!existingMembers || membersCount === 0 || existingMembers.includes('Location A')) {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(INITIAL_MEMBERS));
  }

  if (!localStorage.getItem(SETTINGS_KEY)) {
    const defaultSettings: MasterSettings = {
      areas: DEFAULT_AREAS,
      designations: DESIGNATION_OPTIONS,
      approvalPeriods: APPROVAL_PERIOD_OPTIONS,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
}

// Data Getters & Setters for Fallback Mode
export function getStoredUsers(): User[] {
  initializeLocalStorage();
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function saveStoredUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getStoredPlaces(): SatsangPlace[] {
  initializeLocalStorage();
  const places = JSON.parse(localStorage.getItem(PLACES_KEY) || '[]');
  if (!places || places.length === 0) {
    localStorage.setItem(PLACES_KEY, JSON.stringify(INITIAL_SATSANG_PLACES));
    return INITIAL_SATSANG_PLACES;
  }
  return places;
}

export function saveStoredPlaces(places: SatsangPlace[]): void {
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
}

export function getStoredMembers(): Member[] {
  initializeLocalStorage();
  return JSON.parse(localStorage.getItem(MEMBERS_KEY) || '[]');
}

export function saveStoredMembers(members: Member[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function getStoredSettings(): MasterSettings {
  initializeLocalStorage();
  return JSON.parse(
    localStorage.getItem(SETTINGS_KEY) ||
      JSON.stringify({
        areas: DEFAULT_AREAS,
        designations: DESIGNATION_OPTIONS,
        approvalPeriods: APPROVAL_PERIOD_OPTIONS,
      })
  );
}

export function saveStoredSettings(settings: MasterSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Generate sequential GR Number (e.g. M00001, M00002...)
export function generateNextUserGRNumber(): string {
  const users = getStoredUsers();
  let maxNum = 0;

  users.forEach((u) => {
    if (u.gr_number) {
      const match = u.gr_number.match(/M?(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return `M${String(nextNum).padStart(5, '0')}`;
}
