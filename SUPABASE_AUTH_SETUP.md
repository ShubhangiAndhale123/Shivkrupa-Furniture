# Supabase Authentication Setup Guide
## Shivkrupa — Smart Furniture Design, Budget Estimation & Order Management System

This guide outlines how to configure, migrate, and run the **Supabase Backend Authentication** for the Shivkrupa management system.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in or create an account.
2. Click **New Project**.
3. Fill in the project details:
   - **Name:** `Shivkrupa-Furniture` (or your preferred name)
   - **Database Password:** Set a strong password (save this securely)
   - **Region:** Choose the region closest to your users (e.g., `South Asia (Mumbai)` for India)
   - **Pricing Plan:** Free plan is suitable for development.
4. Click **Create new project** and wait a few moments for provisioning to finish.

---

## 2. Obtain Supabase API Credentials

1. In your Supabase project dashboard, navigate to **Project Settings** (gear icon on the left menu) > **API**.
2. Under **Project API keys**, locate:
   - **Project URL:** e.g., `https://abcdefghijklm.supabase.co`
   - **`anon` `public` key:** e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

> ⚠️ **IMPORTANT SECURITY RULE:**
> Never use or commit the `service_role` secret key into your frontend code or repository. Only use the `anon` public key in frontend applications.

---

## 3. Configure Environment Variables

1. Navigate to the frontend directory and copy `.env.example` to `.env`:
   ```bash
   cd shivkrupa-frontend
   cp .env.example .env
   ```
2. Open `.env` and paste your project URL and anon public key:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

---

## 4. Run the Database SQL Migration

1. In your Supabase Dashboard, click on **SQL Editor** from the left navigation bar.
2. Click **New query**.
3. Open the migration file:
   [`supabase/migrations/001_create_profiles.sql`](file:///c:/Users/Admin/Downloads/shivkrupa-frontend-updated/supabase/migrations/001_create_profiles.sql)
4. Copy the entire contents of `001_create_profiles.sql` into the SQL Editor.
5. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).

### What this migration creates:
* **`public.profiles` table:** Linked via foreign key with cascading delete to `auth.users(id)`.
* **Automatic Profile Creation Trigger (`handle_new_user`):** Automatically copies metadata (name, mobile, address) into `public.profiles` when a user signs up.
* **Role Safety:** The trigger strictly assigns the role as `'customer'`, ensuring that no user can escalate themselves to admin or staff via public signup.
* **Row Level Security (RLS) Policies:**
  - Users can only read and update their own profiles.
  - Users cannot modify their own role.
  - Staff and Admins can view all customer profiles.
  - Admins can manage roles and user accounts.
* **Role Assignment Function:** `public.assign_user_role(target_user_id, new_role)` for secure administrative role updates.

---

## 5. Configure Supabase Auth Settings

### A. URL Configuration (Redirects)
1. Go to **Authentication** > **URL Configuration**.
2. Set **Site URL** to:
   ```
   http://localhost:3000
   ```
3. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/**
   ```

### B. Email Confirmation (Optional for Local Testing)
* **To require email verification:** Keep **Confirm email** turned ON in **Authentication** > **Providers** > **Email**. The registration page will automatically detect this and display a "Check your email" confirmation screen.
* **For faster local testing:** You can temporarily disable **Confirm email** in **Authentication** > **Providers** > **Email**. New signups will immediately be logged in and redirected to their dashboard.

---

## 6. Install Dependencies & Run the Application

From the root workspace folder:
```bash
# Start the development server
npm run dev
```

Or from within `shivkrupa-frontend/`:
```bash
cd shivkrupa-frontend
npm install
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 7. Creating Test Accounts & Assigning Roles

### Step 1: Register User Accounts
You can register users via the frontend register page at `http://localhost:3000/register` or create them in the Supabase Dashboard under **Authentication** > **Users**.

Example accounts to create:
1. `customer@shivkrupa.com`
2. `staff@shivkrupa.com`
3. `admin@shivkrupa.com`
4. `production@shivkrupa.com`

### Step 2: Assign Privileged Roles Securely
By default, all signups are assigned the `'customer'` role. To elevate staff or admin accounts:

1. In Supabase Dashboard, open **SQL Editor**.
2. Run the helper function:
   ```sql
   -- Elevate to Admin
   SELECT public.assign_user_role(id, 'admin')
   FROM auth.users
   WHERE email = 'admin@shivkrupa.com';

   -- Elevate to Staff
   SELECT public.assign_user_role(id, 'staff')
   FROM auth.users
   WHERE email = 'staff@shivkrupa.com';

   -- Elevate to Production
   SELECT public.assign_user_role(id, 'production')
   FROM auth.users
   WHERE email = 'production@shivkrupa.com';
   ```
3. Alternatively, update `public.profiles` directly:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@shivkrupa.com';
   ```

---

## 8. Role-Based Route Mapping

| Role | Permitted Routes & Dashboard | Redirection on Login |
| :--- | :--- | :--- |
| **Customer** | `/customer/*` (Dashboard, Requirements, Budget Design, Quotations, Orders, Profile) | `/customer/dashboard` |
| **Staff** | `/staff/*` (Dashboard, Requirements, Designs, Estimations, Quotations, Orders, Customers) | `/staff/dashboard` |
| **Admin** | `/admin/*` + All staff pages (Products, Materials, Hardware, Pricing, Employees, Reports) | `/admin/dashboard` |
| **Production** | `/production/*` (Production Dashboard, Assigned Orders, Profile) | `/production/dashboard` |

---

## 9. Testing & Verification Checklist

- [x] **Customer Registration:** Open `/register`, create an account with 10-digit mobile number, address, and password (min 6 characters).
- [x] **Database Profile Creation:** Verify in Supabase table editor that a row appears in `public.profiles` with `role = 'customer'`.
- [x] **Login Flow:** Log in with the registered credentials; verify correct redirection to `/customer/dashboard`.
- [x] **Session Persistence:** Refresh the browser on a protected route (`/customer/dashboard`); verify the session and user data are retained without premature redirect.
- [x] **Customer Profile:** Visit `/customer/profile`, verify user details are displayed and can be edited.
- [x] **Protected Routes:** Attempt to access `/admin/dashboard` as a customer; verify redirection occurs. Attempt to access `/customer/dashboard` after logout; verify redirection to `/login`.
- [x] **Logout Flow:** Click **Logout** from sidebar or profile menu; verify session is cleared and user is redirected to the home page `/`.
- [x] **Forgot Password:** Submit `/forgot-password` to test email recovery link dispatch.

---

## 10. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Invalid login credentials` | Incorrect email or password entered | Verify credentials. Make sure user exists in Supabase Auth > Users. |
| `Email not confirmed` | Email confirmation is enabled in Supabase but user has not clicked link | Check inbox/spam or turn off "Confirm email" in Supabase Auth settings. |
| `Failed to fetch` / Network error | Missing or invalid Supabase URL/key | Check `.env` has valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| Infinite redirect / 401 | Outdated tokens in localStorage | Clear browser localStorage or click Logout and sign in again. |
