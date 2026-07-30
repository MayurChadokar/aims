-- ========================================================
-- Migration: Add GR Number & AIMS System Updates
-- Run this script in Supabase SQL Editor
-- ========================================================

-- 1. Add gr_number column to public.users table if it does not exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS gr_number VARCHAR(50) UNIQUE;

-- 2. Add gr_number column to public.members table if it does not exist
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS gr_number VARCHAR(50) UNIQUE;

-- 3. Create Indexes for fast lookup on gr_number
CREATE INDEX IF NOT EXISTS idx_users_gr_number ON public.users (gr_number);
CREATE INDEX IF NOT EXISTS idx_members_gr_number ON public.members (gr_number);

-- 4. Update seed users with default GR Numbers
UPDATE public.users 
SET gr_number = 'M00001', email = 'admin@aims.pithampur.org' 
WHERE email = 'admin@stms.gov.in' OR email = 'admin@aims.pithampur.org';

UPDATE public.users 
SET gr_number = 'M00002', email = 'user@aims.pithampur.org' 
WHERE email = 'user@stms.gov.in' OR email = 'user@aims.pithampur.org';

-- 5. Backfill any remaining users with sequential GR Numbers if null
DO $$
DECLARE
  u RECORD;
  seq INT := 3;
BEGIN
  FOR u IN SELECT id FROM public.users WHERE gr_number IS NULL OR gr_number = '' LOOP
    UPDATE public.users SET gr_number = 'M' || LPAD(seq::text, 5, '0') WHERE id = u.id;
    seq := seq + 1;
  END LOOP;
END $$;

-- 6. Backfill existing members with sequential GR Numbers if null
DO $$
DECLARE
  m RECORD;
  mseq INT := 101;
BEGIN
  FOR m IN SELECT id FROM public.members WHERE gr_number IS NULL OR gr_number = '' LOOP
    UPDATE public.members SET gr_number = 'GR-' || LPAD(mseq::text, 5, '0') WHERE id = m.id;
    mseq := mseq + 1;
  END LOOP;
END $$;
