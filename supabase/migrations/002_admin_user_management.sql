-- ==============================================================================
-- Shivkrupa — Smart Furniture Design, Budget Estimation and Order Management System
-- Migration: 002_admin_user_management.sql
-- Description: Server-side RPC and security enhancements for Admin User Management
-- ==============================================================================

-- 1. Helper function for trusted Admin/Service-Role User Provisioning
-- This function is called by the Supabase Edge Function (or directly by verified Admins)
-- to assign roles and initialize/update the public.profiles record.
--
-- SECURITY CONSTRAINTS:
-- - Only 'staff' or 'production' roles can be provisioned through this function.
-- - 'admin' accounts CANNOT be created or provisioned via this function.
-- - Ordinary customers and staff are strictly forbidden from calling this function.
CREATE OR REPLACE FUNCTION public.admin_provision_user_profile(
  target_user_id UUID,
  new_role TEXT,
  new_full_name TEXT DEFAULT '',
  new_email TEXT DEFAULT '',
  new_department TEXT DEFAULT NULL,
  new_mobile TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_role TEXT;
  v_result JSONB;
BEGIN
  -- Security Check 1: Verify caller is an administrator (unless called by service_role / internal DB superuser)
  IF auth.uid() IS NOT NULL THEN
    v_caller_role := public.get_current_user_role();
    IF v_caller_role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Access denied: Only administrators can provision user roles.';
    END IF;
  END IF;

  -- Security Check 2: Strict role validation
  -- Admin accounts cannot be created via user management - only staff or production
  IF new_role NOT IN ('staff', 'production') THEN
    RAISE EXCEPTION 'Invalid role "%". Only "staff" and "production" accounts can be provisioned.', new_role;
  END IF;

  -- Security Check 3: Target user must exist in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Target user ID % does not exist in auth.users.', target_user_id;
  END IF;

  -- Upsert profile record
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    department,
    mobile,
    created_at,
    updated_at
  )
  SELECT
    target_user_id,
    COALESCE(NULLIF(TRIM(new_full_name), ''), u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
    COALESCE(NULLIF(LOWER(TRIM(new_email)), ''), LOWER(TRIM(u.email)), ''),
    new_role,
    NULLIF(TRIM(new_department), ''),
    NULLIF(TRIM(new_mobile), ''),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  FROM auth.users u
  WHERE u.id = target_user_id
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = CASE 
      WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> '' 
      THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    email = CASE 
      WHEN EXCLUDED.email IS NOT NULL AND EXCLUDED.email <> '' 
      THEN EXCLUDED.email 
      ELSE public.profiles.email 
    END,
    department = COALESCE(EXCLUDED.department, public.profiles.department),
    mobile = COALESCE(EXCLUDED.mobile, public.profiles.mobile),
    updated_at = timezone('utc'::text, now());

  -- Return updated profile record as JSON
  SELECT jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'email', p.email,
    'role', p.role,
    'department', p.department,
    'mobile', p.mobile,
    'updated_at', p.updated_at
  ) INTO v_result
  FROM public.profiles p
  WHERE p.id = target_user_id;

  RETURN v_result;
END;
$$;

-- 2. Grant execution permissions
GRANT EXECUTE ON FUNCTION public.admin_provision_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_provision_user_profile TO service_role;

-- 3. Comment explaining function usage
COMMENT ON FUNCTION public.admin_provision_user_profile IS 
  'Secure server-side RPC to assign staff or production roles and synchronize profile data. Prohibits admin self-escalation or non-admin calls.';
