-- ==============================================================================
-- Shivkrupa — Smart Furniture Design, Budget Estimation and Order Management System
-- Migration: 001_create_profiles.sql
-- Description: Creates the public.profiles table, triggers for auth.users, and RLS policies
-- Roles Supported: 'customer', 'staff', 'admin', 'production'
-- ==============================================================================

-- 1. Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  mobile TEXT DEFAULT '',
  address TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin', 'production')),
  department TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Comments on table and columns
COMMENT ON TABLE public.profiles IS 'User profiles and roles for Shivkrupa management system';
COMMENT ON COLUMN public.profiles.id IS 'Primary key referencing auth.users(id)';
COMMENT ON COLUMN public.profiles.role IS 'User role: customer, staff, admin, or production';

-- 2. Create index on email and role for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 3. Trigger to update updated_at timestamp on record changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Trigger function to handle new auth.users signup
-- This automatically creates a corresponding profile row whenever a user signs up.
-- NOTE: Default role is strictly 'customer' to prevent unauthorized role escalation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_full_name TEXT;
  v_mobile TEXT;
  v_address TEXT;
BEGIN
  -- Extract user metadata supplied during registration
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'fullName',
    NEW.raw_user_meta_data->>'name',
    ''
  );
  v_mobile := COALESCE(
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'phone',
    ''
  );
  v_address := COALESCE(
    NEW.raw_user_meta_data->>'address',
    ''
  );

  -- Insert profile record with role enforced to 'customer'
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    mobile,
    address,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_full_name,
    COALESCE(NEW.email, ''),
    v_mobile,
    v_address,
    'customer', -- Security: Always default to customer for public registration
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
      THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    mobile = CASE 
      WHEN public.profiles.mobile IS NULL OR public.profiles.mobile = '' 
      THEN EXCLUDED.mobile 
      ELSE public.profiles.mobile 
    END,
    address = CASE 
      WHEN public.profiles.address IS NULL OR public.profiles.address = '' 
      THEN EXCLUDED.address 
      ELSE public.profiles.address 
    END,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

-- Bind the trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper function to fetch the current user's role safely (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 6. Trigger to prevent unauthorized role escalation
-- Ensures that non-admin users cannot alter the role column on any profile update
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() IS NOT NULL AND public.get_current_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Access denied: You are not authorized to modify user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_unauthorized_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_unauthorized_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_unauthorized_role_change();

-- 7. Helper functions to assign roles to users (Admin or DB service role only)
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Validate permitted role
  IF new_role NOT IN ('customer', 'staff', 'admin', 'production') THEN
    RAISE EXCEPTION 'Invalid role "%". Allowed roles: customer, staff, admin, production', new_role;
  END IF;

  -- Verify caller is an administrator (unless called by DB superuser / service role)
  IF auth.uid() IS NOT NULL AND public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Only administrators can assign roles';
  END IF;

  UPDATE public.profiles
  SET role = new_role, updated_at = timezone('utc'::text, now())
  WHERE id = target_user_id;

  -- If profile row does not exist yet for target_user_id, create it from auth.users
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    SELECT
      u.id,
      COALESCE(u.email, ''),
      COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
      new_role,
      timezone('utc'::text, now()),
      timezone('utc'::text, now())
    FROM auth.users u
    WHERE u.id = target_user_id;
  END IF;
END;
$$;

-- Helper to assign role by email (convenient for SQL editor setup)
CREATE OR REPLACE FUNCTION public.assign_user_role_by_email(target_email TEXT, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(TRIM(target_email)) LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email "%" not found in auth.users', target_email;
  END IF;

  PERFORM public.assign_user_role(v_user_id, new_role);
END;
$$;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff and Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Policy A: Authenticated users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy B: Staff and Admin users can view all customer/employee profiles
CREATE POLICY "Staff and Admin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'staff'));

-- Policy C: Users can update their own profile details (role escalation blocked by trigger & check)
CREATE POLICY "Users can update their own profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = public.get_current_user_role()
);

-- Policy D: Admins can update any profile (including role changes)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Policy E: Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

-- Policy F: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- 10. Permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role_by_email TO authenticated;
