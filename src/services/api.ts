import { supabase, isSupabaseConfigured } from '../supabase/client';
import {
  User,
  SatsangPlace,
  Member,
  MasterSettings,
  MemberFilterParams,
  DesignationType,
} from '../types';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredPlaces,
  saveStoredPlaces,
  getStoredMembers,
  saveStoredMembers,
  getStoredSettings,
  saveStoredSettings,
} from '../utils/storage';
import { getRemainingDays } from '../utils/dateUtils';

// ==========================================
// MEMBERS API SERVICE
// ==========================================

export async function fetchMembers(filters: MemberFilterParams = {}): Promise<Member[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('members').select('*');

    if (filters.area && filters.area !== 'All') {
      query = query.eq('area', filters.area);
    }
    if (filters.designation && filters.designation !== 'All') {
      query = query.eq('designation', filters.designation);
    }
    if (filters.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }
    if (filters.satsang_place && filters.satsang_place !== 'All') {
      query = query.eq('satsang_place', filters.satsang_place);
    }
    if (filters.approval_period && filters.approval_period !== 'All') {
      query = query.eq('approval_period', filters.approval_period);
    }
    if (filters.gender && filters.gender !== 'All') {
      query = query.eq('gender', filters.gender);
    }

    const { data, error } = await query;
    if (error) {
      // Fallback silently to local storage if schema tables aren't created yet in Supabase
      return fetchLocalMembers(filters);
    }

    let result = (data as Member[]) || [];
    return applyFiltersAndSort(result, filters);
  }

  return fetchLocalMembers(filters);
}

function fetchLocalMembers(filters: MemberFilterParams): Member[] {
  const members = getStoredMembers();
  return applyFiltersAndSort(members, filters);
}

function applyFiltersAndSort(members: Member[], filters: MemberFilterParams): Member[] {
  let result = [...members];

  // Search by Name, Aadhaar, Approval Letter Number
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.aadhaar.includes(q) ||
        m.approval_letter_number.toLowerCase().includes(q)
    );
  }

  // Filter Area
  if (filters.area && filters.area !== 'All') {
    result = result.filter((m) => m.area === filters.area);
  }

  // Filter Designation
  if (filters.designation && filters.designation !== 'All') {
    result = result.filter((m) => m.designation === filters.designation);
  }

  // Filter Status
  if (filters.status && filters.status !== 'All') {
    result = result.filter((m) => m.status === filters.status);
  }

  // Filter Satsang Place
  if (filters.satsang_place && filters.satsang_place !== 'All') {
    result = result.filter((m) => m.satsang_place === filters.satsang_place);
  }

  // Filter Approval Period
  if (filters.approval_period && filters.approval_period !== 'All') {
    result = result.filter((m) => m.approval_period === filters.approval_period);
  }

  // Filter Gender
  if (filters.gender && filters.gender !== 'All') {
    result = result.filter((m) => m.gender === filters.gender);
  }

  // Filter Expiring within Months/Days (Tab 2: <= 60 Days)
  if (filters.expiringWithinMonths === 2) {
    result = result.filter((m) => {
      const days = getRemainingDays(m.expiry_date);
      return days <= 60; // Includes expired & expiring within 60 days
    });
  }

  // Sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'approval_date':
        result.sort((a, b) => new Date(b.approval_date).getTime() - new Date(a.approval_date).getTime());
        break;
      case 'expiry_date':
        result.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
        break;
      case 'age':
        result.sort((a, b) => b.age - a.age);
        break;
      case 'created_at_desc':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'created_at_asc':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
    }
  } else {
    // Default sort: newest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return result;
}

export async function createMember(memberData: Omit<Member, 'id' | 'created_at'>): Promise<Member> {
  const newMember: Member = {
    ...memberData,
    id: 'mem-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single();

    if (!error && data) {
      return data as Member;
    }
    console.warn('Supabase createMember fallback to local store:', error);
  }

  const current = getStoredMembers();
  const updated = [newMember, ...current];
  saveStoredMembers(updated);
  return newMember;
}

// Dashboard Summaries & Metrics
export async function getDashboardMetrics() {
  const members = await fetchMembers();
  
  const totalMembers = members.length;
  const totalSatsangKarta = members.filter((m) => m.designation === 'Satsang Karta').length;
  const totalReaders = members.filter((m) => m.designation === 'Reader').length;
  const totalPathi = members.filter((m) => m.designation === 'Pathi').length;

  const expiringMembers = members.filter((m) => {
    const days = getRemainingDays(m.expiry_date);
    return days >= 0 && days <= 60;
  });

  const expiredMembers = members.filter((m) => {
    const days = getRemainingDays(m.expiry_date);
    return days < 0;
  });

  const recentEntries = [...members].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  return {
    totalMembers,
    totalSatsangKarta,
    totalReaders,
    totalPathi,
    expiringCount: expiringMembers.length,
    expiredCount: expiredMembers.length,
    recentEntries,
  };
}

// ==========================================
// SATSANG PLACES API SERVICE
// ==========================================

export async function fetchSatsangPlaces(): Promise<SatsangPlace[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('satsang_places').select('*');
    if (!error && data && data.length > 0) {
      return data as SatsangPlace[];
    }
  }
  return getStoredPlaces();
}

export async function createSatsangPlace(place: Omit<SatsangPlace, 'id' | 'created_at'>): Promise<SatsangPlace> {
  const newPlace: SatsangPlace = {
    ...place,
    id: 'sp-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('satsang_places').insert([place]).select().single();
    if (!error && data) return data as SatsangPlace;
  }

  const current = getStoredPlaces();
  const updated = [newPlace, ...current];
  saveStoredPlaces(updated);
  return newPlace;
}

export async function updateSatsangPlace(id: string, place: Partial<SatsangPlace>): Promise<SatsangPlace> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('satsang_places').update(place).eq('id', id).select().single();
    if (!error && data) return data as SatsangPlace;
  }

  const current = getStoredPlaces();
  const updated = current.map((p) => (p.id === id ? { ...p, ...place } : p));
  saveStoredPlaces(updated);
  return updated.find((p) => p.id === id)!;
}

export async function deleteSatsangPlace(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('satsang_places').delete().eq('id', id);
  }
  const current = getStoredPlaces();
  const updated = current.filter((p) => p.id !== id);
  saveStoredPlaces(updated);
}

// ==========================================
// USERS MANAGEMENT API SERVICE
// ==========================================

export async function fetchUsers(): Promise<User[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) return data as User[];
  }
  return getStoredUsers();
}

export async function createUser(user: Omit<User, 'id' | 'created_at'> & { password?: string }): Promise<User> {
  const newUser: User = {
    ...user,
    id: 'usr-' + Date.now(),
    is_disabled: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const userPayload = {
      name: user.name,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      gr_number: user.gr_number,
      password_hash: user.password || 'user123',
      area: user.area,
      role: user.role,
      is_disabled: false,
    };
    const { data, error } = await supabase.from('users').insert([userPayload]).select().single();
    if (!error && data) return data as User;
    if (error) console.warn('Supabase createUser error:', error);
  }

  const current = getStoredUsers();
  const updated = [newUser, ...current];
  saveStoredUsers(updated);
  return newUser;
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('users').update(user).eq('id', id).select().single();
    if (!error && data) return data as User;
  }

  const current = getStoredUsers();
  const updated = current.map((u) => (u.id === id ? { ...u, ...user } : u));
  saveStoredUsers(updated);
  return updated.find((u) => u.id === id)!;
}

export async function deleteUser(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('users').delete().eq('id', id);
  }
  const current = getStoredUsers();
  const updated = current.filter((u) => u.id !== id);
  saveStoredUsers(updated);
}

// ==========================================
// MASTER SETTINGS API SERVICE
// ==========================================

export async function fetchMasterSettings(): Promise<MasterSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('master_settings').select('*');
    if (!error && data && data.length > 0) {
      const areas = data.filter((d) => d.category === 'area').map((d) => d.item_value);
      const designations = data.filter((d) => d.category === 'designation').map((d) => d.item_value as DesignationType);
      const periods = data.filter((d) => d.category === 'approval_period').map((d) => d.item_value as any);

      return {
        areas: areas.length ? areas : getStoredSettings().areas,
        designations: designations.length ? designations : getStoredSettings().designations,
        approvalPeriods: periods.length ? periods : getStoredSettings().approvalPeriods,
      };
    }
  }

  return getStoredSettings();
}

export async function updateMasterSettings(settings: MasterSettings): Promise<MasterSettings> {
  saveStoredSettings(settings);
  return settings;
}

// ==========================================
// BULK SUPABASE DATABASE SYNC SERVICE
// ==========================================

export async function syncAllLocalDataToSupabase(): Promise<{
  success: boolean;
  placesSynced: number;
  membersSynced: number;
  message: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      placesSynced: 0,
      membersSynced: 0,
      message: 'Supabase credentials missing or invalid in .env file',
    };
  }

  try {
    let placesSynced = 0;
    let membersSynced = 0;

    // 1. Sync Satsang Places
    const places = getStoredPlaces();
    if (places.length > 0) {
      const placesPayload = places.map((p) => ({
        name: p.name,
        status: p.status,
        area: p.area,
      }));
      const { data: syncedPlaces, error: placeError } = await supabase
        .from('satsang_places')
        .upsert(placesPayload, { onConflict: 'name' })
        .select();

      if (placeError) {
        if (placeError.code === 'PGRST205') {
          return {
            success: false,
            placesSynced: 0,
            membersSynced: 0,
            message: 'Database tables do not exist in Supabase yet! Please copy schema.sql into Supabase SQL Editor and click Run.',
          };
        }
        console.error('Error syncing places to Supabase:', placeError);
      } else {
        placesSynced = syncedPlaces ? syncedPlaces.length : places.length;
      }
    }

    // 2. Sync Members
    const members = getStoredMembers();
    if (members.length > 0) {
      const membersPayload = members.map((m) => ({
        area: m.area,
        satsang_place: m.satsang_place,
        status: m.status,
        designation: m.designation,
        name: m.name,
        father_name: m.father_name,
        gender: m.gender,
        dob: m.dob,
        age: m.age,
        qualification: m.qualification,
        approval_letter_number: m.approval_letter_number,
        approval_date: m.approval_date,
        approval_period: m.approval_period,
        expiry_date: m.expiry_date,
        aadhaar: m.aadhaar,
      }));

      const { data: syncedMembers, error: memberError } = await supabase
        .from('members')
        .upsert(membersPayload, { onConflict: 'approval_letter_number' })
        .select();

      if (memberError) {
        if (memberError.code === 'PGRST205') {
          return {
            success: false,
            placesSynced,
            membersSynced: 0,
            message: 'Database tables do not exist in Supabase yet! Please copy schema.sql into Supabase SQL Editor and click Run.',
          };
        }
        console.error('Error syncing members to Supabase:', memberError);
      } else {
        membersSynced = syncedMembers ? syncedMembers.length : members.length;
      }
    }

    return {
      success: true,
      placesSynced,
      membersSynced,
      message: `Successfully pushed ${placesSynced} Satsang Places and ${membersSynced} Member records directly into Supabase PostgreSQL Database!`,
    };
  } catch (err: any) {
    console.error('Supabase Sync Error:', err);
    return {
      success: false,
      placesSynced: 0,
      membersSynced: 0,
      message: err.message || 'Failed to sync data to Supabase Database',
    };
  }
}
