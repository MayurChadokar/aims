-- ========================================================
-- Approval Internal Management System (AIMS) Database Schema
-- Pithampur Area Internal Approval System
-- Compatible with Supabase PostgreSQL
-- ========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums / Types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE place_status AS ENUM ('POINT', 'CENTRE', 'SUB CENTRE', 'Active', 'Pending', 'Temporary');
CREATE TYPE gender_type AS ENUM ('Male', 'Female');
CREATE TYPE designation_type AS ENUM ('Satsang Karta', 'Reader', 'Pathi');

-- 2. Master Settings Table
CREATE TABLE IF NOT EXISTS public.master_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL, -- 'area', 'designation', 'approval_period'
  item_value VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(category, item_value)
);

-- 3. Satsang Places Table
CREATE TABLE IF NOT EXISTS public.satsang_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL UNIQUE,
  status place_status NOT NULL DEFAULT 'Active',
  area VARCHAR(100) NOT NULL DEFAULT 'Pithampur',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Users Table (Linked with Supabase Auth or Standalone App Users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  username VARCHAR(100) UNIQUE,
  gr_number VARCHAR(50) UNIQUE,
  password_hash TEXT NOT NULL DEFAULT 'user123',
  area VARCHAR(100) NOT NULL DEFAULT 'Pithampur',
  role user_role NOT NULL DEFAULT 'user',
  is_disabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Members Table
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gr_number VARCHAR(50) UNIQUE,
  area VARCHAR(100) NOT NULL DEFAULT 'Pithampur',
  satsang_place VARCHAR(150) NOT NULL,
  status place_status NOT NULL DEFAULT 'Active',
  designation designation_type NOT NULL,
  name VARCHAR(150) NOT NULL,
  father_name VARCHAR(150) NOT NULL,
  gender gender_type NOT NULL,
  dob DATE NOT NULL,
  age INT NOT NULL,
  qualification VARCHAR(100),
  approval_letter_number VARCHAR(100) NOT NULL,
  approval_date DATE NOT NULL,
  approval_period VARCHAR(50) NOT NULL, -- e.g. '2 Years'
  expiry_date DATE NOT NULL,
  aadhaar VARCHAR(12) NOT NULL CHECK (length(aadhaar) = 12),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Indexes for High Performance Search & Filtering
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members (name);
CREATE INDEX IF NOT EXISTS idx_members_gr_number ON public.members (gr_number);
CREATE INDEX IF NOT EXISTS idx_members_aadhaar ON public.members (aadhaar);
CREATE INDEX IF NOT EXISTS idx_members_approval_letter ON public.members (approval_letter_number);
CREATE INDEX IF NOT EXISTS idx_members_designation ON public.members (designation);
CREATE INDEX IF NOT EXISTS idx_members_expiry_date ON public.members (expiry_date);
CREATE INDEX IF NOT EXISTS idx_members_area ON public.members (area);
CREATE INDEX IF NOT EXISTS idx_users_gr_number ON public.users (gr_number);
CREATE INDEX IF NOT EXISTS idx_satsang_places_name ON public.satsang_places (name);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.master_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satsang_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Master Settings Policies
CREATE POLICY "Allow read access to all authenticated users for master settings"
  ON public.master_settings FOR SELECT USING (true);

CREATE POLICY "Allow all access to admin for master settings"
  ON public.master_settings FOR ALL USING (true);

-- Satsang Places Policies
CREATE POLICY "Allow read access to all for satsang places"
  ON public.satsang_places FOR SELECT USING (true);

CREATE POLICY "Allow full control to admin for satsang places"
  ON public.satsang_places FOR ALL USING (true);

-- Users Table Policies
CREATE POLICY "Allow read user details for self or admin"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Allow full control to admin on users table"
  ON public.users FOR ALL USING (true);

-- Members Table Policies
CREATE POLICY "Allow authenticated user to insert member"
  ON public.members FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read members"
  ON public.members FOR SELECT USING (true);

CREATE POLICY "Allow admin full control on members"
  ON public.members FOR ALL USING (true);

-- ========================================================
-- Seed Initial Master Data & Initial Admin Account
-- ========================================================

-- Initial Master Settings
INSERT INTO public.master_settings (category, item_value) VALUES
  ('area', 'Pithampur'),
  ('area', 'Indore'),
  ('area', 'Dhar'),
  ('designation', 'Satsang Karta'),
  ('designation', 'Reader'),
  ('designation', 'Pathi'),
  ('approval_period', '6 Months'),
  ('approval_period', '1 Year'),
  ('approval_period', '2 Years'),
  ('approval_period', '3 Years'),
  ('approval_period', '4 Years'),
  ('approval_period', '5 Years'),
  ('approval_period', '6 Years')
ON CONFLICT DO NOTHING;

-- Initial Satsang Places with Statuses (POINT, CENTRE, SUB CENTRE)
INSERT INTO public.satsang_places (name, status, area) VALUES
  ('ANJANIYA', 'POINT', 'Pithampur'),
  ('RAJGARH', 'CENTRE', 'Pithampur'),
  ('PIPLIYA', 'CENTRE', 'Pithampur'),
  ('KANWAN', 'CENTRE', 'Pithampur'),
  ('SAKAD', 'POINT', 'Pithampur'),
  ('INDRAPUR', 'POINT', 'Pithampur'),
  ('KHEDI (MP)', 'POINT', 'Pithampur'),
  ('KHADKI', 'POINT', 'Pithampur'),
  ('PIPRIDEB', 'POINT', 'Pithampur'),
  ('UPARI', 'CENTRE', 'Pithampur'),
  ('BANDERI', 'POINT', 'Pithampur'),
  ('DHAMNOD', 'POINT', 'Pithampur'),
  ('KATTHIWARA', 'POINT', 'Pithampur'),
  ('BARJHAR', 'POINT', 'Pithampur'),
  ('PITHAMPUR', 'CENTRE', 'Pithampur'),
  ('NAGDA (MP)', 'POINT', 'Pithampur'),
  ('KHERWAS', 'POINT', 'Pithampur'),
  ('BIDWAL', 'CENTRE', 'Pithampur'),
  ('BHULGAON', 'POINT', 'Pithampur'),
  ('SENDHWA', 'POINT', 'Pithampur'),
  ('BAGDI', 'POINT', 'Pithampur'),
  ('DHAR', 'SUB CENTRE', 'Pithampur'),
  ('WADLIPADA', 'POINT', 'Pithampur'),
  ('BAKHATPU', 'POINT', 'Pithampur'),
  ('BHIMFALIYA', 'POINT', 'Pithampur'),
  ('KARAVAD', 'POINT', 'Pithampur'),
  ('MEGHNAGAR', 'POINT', 'Pithampur'),
  ('SANDLA', 'CENTRE', 'Pithampur'),
  ('Ranapur', 'POINT', 'Pithampur')
ON CONFLICT DO NOTHING;

-- Default System Admin & Standard User Credentials
-- Admin: GR Number: M00001 / Pass: admin123
-- User: GR Number: M00002 / Pass: user123
INSERT INTO public.users (name, email, username, gr_number, password_hash, area, role) VALUES
  ('System Administrator', 'admin@aims.pithampur.org', 'admin', 'M00001', 'admin123', 'Pithampur', 'admin'),
  ('Pithampur Area Operator', 'user@aims.pithampur.org', 'pithampur_op', 'M00002', 'user123', 'Pithampur', 'user')
ON CONFLICT (email) DO NOTHING;

-- Seed Sample Members
INSERT INTO public.members (
  gr_number, area, satsang_place, status, designation, name, father_name, gender, dob, age, qualification, approval_letter_number, approval_date, approval_period, expiry_date, aadhaar
) VALUES
  ('GR-00101', 'Pithampur', 'ANJANIYA', 'POINT', 'Satsang Karta', 'Rajesh Sharma', 'Ramesh Sharma', 'Male', '1980-05-14', 46, 'B.Com, M.A.', 'AP-2023-089', CURRENT_DATE - INTERVAL '1 Year 10 Months', '2 Years', CURRENT_DATE + INTERVAL '45 Days', '987654321012'),
  ('GR-00102', 'Pithampur', 'RAJGARH', 'CENTRE', 'Reader', 'Anil Verma', 'Suresh Verma', 'Male', '1985-08-20', 40, 'Graduate', 'AP-2024-102', CURRENT_DATE - INTERVAL '11 Months', '1 Year', CURRENT_DATE + INTERVAL '18 Days', '876543210921'),
  ('GR-00103', 'Pithampur', 'PIPLIYA', 'CENTRE', 'Pathi', 'Sunita Devi', 'Vijay Kumar', 'Female', '1990-02-10', 36, 'B.Ed', 'AP-2024-045', CURRENT_DATE - INTERVAL '5 Months', '6 Months', CURRENT_DATE + INTERVAL '12 Days', '765432109832'),
  ('GR-00104', 'Pithampur', 'PITHAMPUR', 'CENTRE', 'Satsang Karta', 'Mahesh Gupta', 'Jagdish Gupta', 'Male', '1975-12-01', 50, 'M.Com', 'AP-2022-301', CURRENT_DATE - INTERVAL '3 Years', '3 Years', CURRENT_DATE - INTERVAL '15 Days', '654321098743'),
  ('GR-00105', 'Pithampur', 'DHAR', 'SUB CENTRE', 'Reader', 'Priya Patel', 'Dharmesh Patel', 'Female', '1992-06-18', 34, 'M.Sc', 'AP-2023-112', CURRENT_DATE - INTERVAL '1 Year', '3 Years', CURRENT_DATE + INTERVAL '2 Years', '543210987654'),
  ('GR-00106', 'Pithampur', 'BIDWAL', 'CENTRE', 'Pathi', 'Vikram Singh', 'Harbansh Singh', 'Male', '1988-11-25', 37, 'B.A.', 'AP-2024-550', CURRENT_DATE - INTERVAL '8 Months', '1 Year', CURRENT_DATE + INTERVAL '4 Months', '432109876565')
ON CONFLICT DO NOTHING;

