# Supabase Authentication & Role-Based Access Control Setup Guide
## Shivkrupa — Smart Furniture Design, Budget Estimation & Order Management System

This guide outlines how to configure, migrate, and run the **Supabase Authentication and Secure Role-Based Access Control (RBAC)** for the Shivkrupa management system.

---

## 1. Supported User Roles & Architecture

The system supports four distinct user roles, retrieved strictly from the `public.profiles` database table using `profiles.id = auth.users.id`:

| Role | Authorized Dashboard | Permitted Routes | Role Provisioning Method |
| :--- | :--- | :--- | :--- |
| **`customer`** | `/customer/dashboard` | `/customer/*` (Dashboard, New Requirements, Budget Design, Reference Design, Cost Estimation, My Designs, Quotations, Orders, Profile) | **Public registration** (`/register`) automatically assigned via trusted database trigger `handle_new_user()`. |
| **`staff`** | `/staff/dashboard` | `/staff/*` (Dashboard, Requirements, Designs, Estimations, Quotations, Orders, Customers) | **Admin / Server Provisioned** via `public.assign_user_role()` or SQL helper. |
| **`admin`** | `/admin/dashboard` | `/admin/*` + authorized `/staff/*` & `/production/*` routes | **Admin Provisioned** via secure database process. |
| **`production`** | `/production/dashboard` | `/production/*` (Dashboard, Assigned Orders, Profile) | **Admin / Server Provisioned** via `public.assign_user_role()` or SQL helper. |

---

## 2. Supabase Project Configuration

### Step A: Obtain Supabase API Credentials
1. In your [Supabase Dashboard](https://supabase.com/dashboard), navigate to **Project Settings** (gear icon) > **API**.
2. Locate:
   - **Project URL:** e.g., `https://gqvizoabnjfmaqlpjidb.supabase.co`
   - **`anon` `public` key:** e.g., `sb_publishable_...` (or JWT anon key)
3. Update `shivkrupa-frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
> ⚠️ **SECURITY RULE:** Never place the `service_role` secret key into frontend code. Only use the public `anon` key.

### Step B: Configure Redirect URLs in Supabase
1. Navigate to **Authentication** > **URL Configuration**.
2. Set **Site URL** to:
   ```
   http://localhost:3000
   ```
3. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/**
   ```

### Step C: Email Confirmation Setting (Development Recommendation)
- If **Confirm email** is enabled in **Authentication** > **Providers** > **Email**:
  New public registrations will show the "Verify Your Email" confirmation screen.
- For immediate local testing without email confirmation:
  Temporarily disable **Confirm email**. New customer registrations will log in immediately and redirect to `/customer/dashboard`.

---

## 3. Run the Database SQL Migration

1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation bar.
2. Click **New query**.
3. Copy and run the entire SQL migration script from [`supabase/migrations/001_create_profiles.sql`](file:///c:/Users/Admin/Downloads/shivkrupa-frontend-updated/supabase/migrations/001_create_profiles.sql):

```sql
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

-- Index on email and role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 2. Handle updated_at trigger
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

-- 3. Trigger for new user registrations (Strict customer role default)
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

  INSERT INTO public.profiles (
    id, full_name, email, mobile, address, role, created_at, updated_at
  )
  VALUES (
    NEW.id, v_full_name, COALESCE(NEW.email, ''), v_mobile, v_address, 'customer',
    timezone('utc'::text, now()), timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    mobile = CASE WHEN public.profiles.mobile IS NULL OR public.profiles.mobile = '' THEN EXCLUDED.mobile ELSE public.profiles.mobile END,
    address = CASE WHEN public.profiles.address IS NULL OR public.profiles.address = '' THEN EXCLUDED.address ELSE public.profiles.address END,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 4. Safe helper to fetch current user's role without RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 5. Trigger to prevent non-admins from modifying the role column
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

-- 6. Role assignment helper by UUID
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF new_role NOT IN ('customer', 'staff', 'admin', 'production') THEN
    RAISE EXCEPTION 'Invalid role "%". Allowed: customer, staff, admin, production', new_role;
  END IF;

  IF auth.uid() IS NOT NULL AND public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Only administrators can assign roles';
  END IF;

  UPDATE public.profiles
  SET role = new_role, updated_at = timezone('utc'::text, now())
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    SELECT u.id, COALESCE(u.email, ''), COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''), new_role, now(), now()
    FROM auth.users u
    WHERE u.id = target_user_id;
  END IF;
END;
$$;

-- 7. Role assignment helper by email (SQL Editor convenience)
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

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff and Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Staff and Admin can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'staff'));

CREATE POLICY "Users can update their own profile fields"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = public.get_current_user_role());

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role_by_email TO authenticated;
```

---

## 4. Creating Test Accounts & Assigning Roles

### Step 1: Create the 4 Accounts in Supabase
In **Authentication** > **Users**, click **Add user** > **Create user** for each test account with password `password123`:

1. `customer@shivkrupa.com`
2. `staff@shivkrupa.com`
3. `admin7338@gmail.com`
4. `production@shivkrupa.com`

*(Or register them via `http://localhost:3000/register`)*

### Step 2: Elevate Roles in Supabase SQL Editor
In the **SQL Editor**, run the helper function:

```sql
-- 1. Elevate Admin account
SELECT public.assign_user_role_by_email('admin7338@gmail.com', 'admin');

-- 2. Elevate Staff account
SELECT public.assign_user_role_by_email('staff@shivkrupa.com', 'staff');

-- 3. Elevate Production account
SELECT public.assign_user_role_by_email('production@shivkrupa.com', 'production');

-- 4. Customer account remains 'customer' (default)
SELECT public.assign_user_role_by_email('customer@shivkrupa.com', 'customer');
```

Verify in the **Table Editor** under `public.profiles` that the four rows have the exact roles:
- `admin7338@gmail.com` → `role: admin`
- `staff@shivkrupa.com` → `role: staff`
- `production@shivkrupa.com` → `role: production`
- `customer@shivkrupa.com` → `role: customer`

---

## 5. Running and Building the Application

### Development Server:
```bash
# From workspace root:
npm run dev

# Or directly in shivkrupa-frontend/:
cd shivkrupa-frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Production Build:
```bash
npm run build
```

---

## 6. Comprehensive Testing & Verification Checklist

- [x] **Customer Registration:** Navigate to `/register`. Fill in name, email, 10-digit mobile, address, and password. Confirm public registration enforces `customer` role.
- [x] **Automatic Login Redirection:**
  - Login as `customer@shivkrupa.com` → Redirects automatically to `/customer/dashboard`.
  - Login as `staff@shivkrupa.com` → Redirects automatically to `/staff/dashboard`.
  - Login as `admin7338@gmail.com` → Redirects automatically to `/admin/dashboard`.
  - Login as `production@shivkrupa.com` → Redirects automatically to `/production/dashboard`.
- [x] **Session Persistence on Refresh:** While on `/admin/dashboard` or `/customer/dashboard`, refresh the page. The session and profile are restored without flickering or premature redirection.
- [x] **Authenticated User Visiting `/login` or `/register`:** Navigate to `/login` while logged in as staff; verify you are immediately redirected to `/staff/dashboard`.
- [x] **Role Boundary Protection:**
  - Log in as customer, manually enter `http://localhost:3000/admin/dashboard` in the address bar → Redirected to `/customer/dashboard`.
  - Log in as staff, manually enter `http://localhost:3000/admin/dashboard` → Redirected to `/staff/dashboard`.
  - Log in as production, manually enter `http://localhost:3000/staff/dashboard` → Redirected to `/production/dashboard`.
- [x] **Unauthenticated Access:** Log out and navigate to `/customer/dashboard` or `/admin/dashboard` → Redirected to `/login` with return state.
- [x] **Missing Profile / Invalid Role Fail-Safe:** If an authenticated account has no profile row or an unrecognized role, access is denied with a clear informational prompt, "Retry" option, and "Sign Out" button (no infinite redirect loop).
- [x] **Role Tamper Protection:** Authenticated non-admin users cannot alter the `role` column via client calls or browser console; database trigger `prevent_unauthorized_role_change` rejects unauthorized modifications.
- [x] **Logout Flow:** Clicking "Sign Out" or "Logout" completely clears user state and session tokens, redirecting to the homepage `/`.

---

## 7. Admin User Management → Add User (Supabase Edge Function & RPC)

The **User Management → Add User** feature allows authorized administrators to provision **Staff** and **Production** team members securely without exposing secret service-role keys on the frontend or allowing privilege escalation.

### Architecture Overview

```
[Admin Frontend UI]
       │
       ▼ (Caller Bearer JWT)
[Supabase Edge Function: admin-add-user]
  ├── 1. Validates caller JWT (auth.getUser())
  ├── 2. Verifies caller has role = 'admin' in public.profiles
  ├── 3. Enforces target role constraint: strictly 'staff' | 'production'
  ├── 4. Rejects duplicate emails (409 Conflict)
  ├── 5. Uses auth.admin.createUser or auth.admin.inviteUserByEmail
  └── 6. Executes public.admin_provision_user_profile() RPC
       │
       ▼
[public.profiles Table] (Updated with verified role and department)
```

---

### Step A: Apply Database SQL Migration (`002_admin_user_management.sql`)

1. Open the **SQL Editor** in your [Supabase Dashboard](https://supabase.com/dashboard/project/gqvizoabnjfmaqlpjidb/sql).
2. Click **New query**.
3. Run the following SQL from [`supabase/migrations/002_admin_user_management.sql`](file:///c:/Users/Admin/Downloads/shivkrupa-frontend-updated/supabase/migrations/002_admin_user_management.sql):

```sql
-- Create server-side provisioning RPC
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
  -- 1. Verify caller is an administrator (unless called by service_role)
  IF auth.uid() IS NOT NULL THEN
    v_caller_role := public.get_current_user_role();
    IF v_caller_role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Access denied: Only administrators can provision user roles.';
    END IF;
  END IF;

  -- 2. Strictly prohibit creating admin accounts via this endpoint
  IF new_role NOT IN ('staff', 'production') THEN
    RAISE EXCEPTION 'Invalid role "%". Only "staff" and "production" accounts can be provisioned.', new_role;
  END IF;

  -- 3. Upsert profile record
  INSERT INTO public.profiles (
    id, full_name, email, role, department, mobile, created_at, updated_at
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
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    email = CASE WHEN EXCLUDED.email <> '' THEN EXCLUDED.email ELSE public.profiles.email END,
    department = COALESCE(EXCLUDED.department, public.profiles.department),
    mobile = COALESCE(EXCLUDED.mobile, public.profiles.mobile),
    updated_at = timezone('utc'::text, now());

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

GRANT EXECUTE ON FUNCTION public.admin_provision_user_profile TO authenticated, service_role;
```

---

### Step B: Deploy the Supabase Edge Function (`admin-add-user`)

The source code is located at:
[`supabase/functions/admin-add-user/index.ts`](file:///c:/Users/Admin/Downloads/shivkrupa-frontend-updated/supabase/functions/admin-add-user/index.ts)

#### Option 1: Deploy Using Supabase CLI (Recommended)

1. Open PowerShell / terminal in the workspace directory.
2. Authenticate the CLI with your Supabase account token (create one at https://supabase.com/dashboard/account/tokens):
   ```bash
   npx supabase login
   ```
3. Link the repository to your remote Supabase project:
   ```bash
   npx supabase link --project-ref gqvizoabnjfmaqlpjidb
   ```
4. Deploy the function:
   ```bash
   npx supabase functions deploy admin-add-user
   ```

#### Option 2: Deploy Via Supabase Dashboard (Web Interface)

1. In the Supabase Dashboard, open **Edge Functions** from the left navigation bar.
2. Click **New function** and enter the name: `admin-add-user`.
3. Paste the contents of [`supabase/functions/admin-add-user/index.ts`](file:///c:/Users/Admin/Downloads/shivkrupa-frontend-updated/supabase/functions/admin-add-user/index.ts).
4. Click **Deploy**.

---

### Step C: Environment Secrets in Supabase

When running on Supabase, the following secrets are automatically injected by the runtime:
- `SUPABASE_URL`: e.g., `https://gqvizoabnjfmaqlpjidb.supabase.co`
- `SUPABASE_ANON_KEY`: public key
- `SUPABASE_SERVICE_ROLE_KEY`: secret server-side key (used only inside the Edge Function)

*(Optional)* Set the application URL for email invitation links:
```bash
npx supabase secrets set SITE_URL=http://localhost:3000
```

---

### Step D: End-to-End Manual Testing Instructions

#### 1. Admin Provisioning a Staff Member (Password Mode)
1. Sign in as Admin (`admin7338@gmail.com`) at `http://localhost:3000/login`.
2. Click **User Management** in the sidebar.
3. Click the **+ Add User** button.
4. In the modal:
   - **Full Name**: `Pooja Sharma`
   - **Email Address**: `pooja.staff@shivkrupa.com`
   - **Assign Role**: Select **Staff Member** (`staff`)
   - **Department**: `Sales & Design`
   - **Password**: Set initial password or leave default (`Shivkrupa@2026`)
5. Click **Create User Account**.
6. Verify the confirmation screen displays the provisioned user details with the blue `STAFF` badge.
7. Click **Close & View Directory**. Confirm Pooja Sharma appears in the directory table.

#### 2. Staff Login & Dashboard Verification
1. Log out from the Admin Portal.
2. Go to `http://localhost:3000/login`.
3. Sign in as `pooja.staff@shivkrupa.com` with the initial password.
4. **Expected Result**: The user is authenticated and redirected directly to `/staff/dashboard`.
5. Attempt to access `http://localhost:3000/admin/dashboard` in the URL bar.
6. **Expected Result**: Access is denied and user is redirected back to `/staff/dashboard`.

#### 3. Admin Provisioning a Production Specialist (Invite Mode)
1. Sign in as Admin and open **User Management → Add User**.
2. Select **Email Invite** mode.
3. Enter `ganesh.prod@shivkrupa.com`, select **Production Specialist** (`production`), Department: `Production Workshop`.
4. Submit. Supabase sends an email invitation link with `#type=invite`.
5. Following the invite link opens `/login`, prompts the user to set their password, and upon completion automatically redirects them to `/production/dashboard`.

#### 4. Security & Negative Validation Testing
- **Duplicate Email Prevention**: Attempt to add a user with an already registered email. The UI displays an alert: `"An account with email ... already exists"`.
- **Privilege Escalation Prevention**: The Add User form only permits `staff` and `production` roles. The server-side RPC and Edge Function explicitly reject any request specifying `role: 'admin'`.
- **Non-Admin Access Prevention**: If a staff or customer token invokes `admin-add-user`, the Edge Function returns `403 Forbidden` (`"Access denied: Only system administrators are authorized"`).
- **Service-Role Key Security**: The Supabase service-role key is never included in frontend code, git commits, or client bundles. All administrative operations are executed strictly through the serverless Edge Function.
