-- ===================================================
-- PPKI PROGRESS WEB - SUPABASE DATABASE SCHEMA
-- Jalankan skrip ini di SQL Editor pada Dashboard Supabase Anda
-- ===================================================

-- 1. ENUM & EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE column_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE card_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 2. TABEL PROFILES (terkoneksi ke auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'member'::user_role NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger otomatis membuat profile saat user dibuat di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member'::user_role),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 2))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABEL BOARDS
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'PPKI Progress Board',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. TABEL COLUMNS
CREATE TABLE IF NOT EXISTS public.columns (
  id TEXT PRIMARY KEY, -- 'todo', 'in_progress', 'review', 'done'
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- 5. TABEL CARDS
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  column_id TEXT REFERENCES public.columns(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assigned_to UUID[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  deadline DATE,
  labels TEXT[] DEFAULT '{}',
  priority card_priority DEFAULT 'medium'::card_priority,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. TABEL ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ===================================================
-- DATA DEFAULT (SEED)
-- ===================================================

-- Papan default
INSERT INTO public.boards (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'PPKI Progress Board')
ON CONFLICT (id) DO NOTHING;

-- Kolom default
INSERT INTO public.columns (id, board_id, title, order_index)
VALUES 
  ('todo', '00000000-0000-0000-0000-000000000001', 'To Do', 0),
  ('in_progress', '00000000-0000-0000-0000-000000000001', 'In Progress', 1),
  ('review', '00000000-0000-0000-0000-000000000001', 'Review', 2),
  ('done', '00000000-0000-0000-0000-000000000001', 'Done', 3)
ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Semua user terautentikasi bisa membaca profile
CREATE POLICY "Profiles readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Profiles: Admin dapat mengelola semua profile, user bisa ubah milik sendiri
CREATE POLICY "Profiles updatable by self or admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cards: Semua user terautentikasi bisa membaca kartu
CREATE POLICY "Cards readable by authenticated users"
  ON public.cards FOR SELECT
  TO authenticated
  USING (true);

-- Cards: User terautentikasi bisa membuat kartu
CREATE POLICY "Cards insertable by authenticated users"
  ON public.cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Cards: Hanya pembuat kartu atau admin yang dapat mengubah atau menghapus kartu
CREATE POLICY "Cards updatable by creator or admin"
  ON public.cards FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Cards deletable by creator or admin"
  ON public.cards FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Activity Logs: Bisa dibaca semua anggota
CREATE POLICY "Activity logs readable by authenticated users"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Activity logs insertable by authenticated users"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Aktifkan Realtime pada tabel cards dan activity_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
