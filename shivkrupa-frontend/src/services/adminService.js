import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockEmployees } from '../data/mockData'

const DEMO_STORAGE_KEY = 'shivkrupa_demo_team_users'

/**
 * Helper to get local demo employees in offline / mock mode
 */
function getStoredDemoUsers() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.warn('[adminService] Error reading demo users from storage:', err)
  }
  // Initialize with mock employees converted to standard profile schema
  const initial = mockEmployees.map((emp) => ({
    id: emp.id,
    full_name: emp.name,
    email: emp.email,
    role: emp.role?.toLowerCase() === 'admin' ? 'admin' : emp.role?.toLowerCase() === 'production head' ? 'production' : 'staff',
    department: emp.department,
    mobile: emp.mobile,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    status: emp.status || 'Active',
  }))
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initial))
  return initial
}

/**
 * Fetch all user profiles from Supabase public.profiles (or demo store if offline)
 */
export async function fetchUsers() {
  const hasAuthToken = Boolean(localStorage.getItem('shivkrupa_token'))

  if (!isSupabaseConfigured || !hasAuthToken) {
    return { data: getStoredDemoUsers(), error: null, isOffline: true }
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, department, mobile, address, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[adminService] Supabase profile query note (falling back to demo store if empty):', error.message)
      return { data: getStoredDemoUsers(), error: null, isOffline: true }
    }

    if (!data || data.length === 0) {
      return { data: getStoredDemoUsers(), error: null, isOffline: true }
    }

    return { data: data || [], error: null, isOffline: false }
  } catch (err) {
    console.error('[adminService] Unexpected fetch error:', err)
    return { data: getStoredDemoUsers(), error: null, isOffline: true }
  }
}

/**
 * Provision or invite a new staff or production user.
 * 
 * Invokes the secure Supabase Edge Function 'admin-add-user' using the caller's JWT.
 * NEVER exposes service-role keys in frontend code.
 */
export async function createTeamUser({
  fullName,
  email,
  role,
  department = '',
  mobile = '',
  password = '',
  sendInvite = false,
}) {
  // Client-side guard rails & input validation
  const cleanFullName = String(fullName || '').trim()
  if (!cleanFullName || cleanFullName.length < 2) {
    throw new Error('Full Name is required (minimum 2 characters).')
  }

  const cleanEmail = String(email || '').trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Please provide a valid email address (e.g., name@shivkrupa.com).')
  }

  const cleanRole = String(role || '').trim().toLowerCase()
  if (!['staff', 'production'].includes(cleanRole)) {
    throw new Error('Invalid role. Only "staff" and "production" accounts can be created by admins.')
  }

  if (!sendInvite && password && password.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }

  const hasAuthToken = Boolean(localStorage.getItem('shivkrupa_token'))

  // 1. Supabase Mode with live remote session: Invoke trusted Edge Function
  if (isSupabaseConfigured && hasAuthToken) {
    try {
      const { data, error } = await supabase.functions.invoke('admin-add-user', {
        body: {
          fullName: cleanFullName,
          email: cleanEmail,
          role: cleanRole,
          department: department.trim() || null,
          mobile: mobile.trim() || null,
          password: password.trim() || undefined,
          sendInvite: Boolean(sendInvite),
          redirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) {
        // Detailed error parsing from edge function
        let serverMessage = error.message
        
        // Edge function may return JSON body inside error context or response
        if (error.context && typeof error.context.json === 'function') {
          try {
            const errJson = await error.context.json()
            if (errJson?.error) {
              serverMessage = errJson.error
            }
          } catch {
            // Context JSON parsing failed, retain default message
          }
        }

        if (serverMessage?.includes('FunctionsFetchError') || serverMessage?.includes('Failed to send a request to Edge Function')) {
          throw new Error(
            'The Supabase Edge Function "admin-add-user" could not be reached. Ensure the Edge Function is deployed using "supabase functions deploy admin-add-user".'
          )
        }

        throw new Error(serverMessage || 'Failed to create user. Please verify admin permissions.')
      }

      // Check if response contains an error field despite 200/non-throw
      if (data && data.error) {
        throw new Error(data.error)
      }

      return {
        success: true,
        message: data?.message || `Successfully created ${cleanFullName} (${cleanRole}).`,
        user: data?.user || {
          fullName: cleanFullName,
          email: cleanEmail,
          role: cleanRole,
          department,
        },
      }
    } catch (err) {
      console.error('[adminService] Error invoking admin-add-user edge function:', err)
      throw err
    }
  }

  // 2. Offline / Demo Fallback Mode
  const demoUsers = getStoredDemoUsers()
  if (demoUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error(`A user with email "${cleanEmail}" already exists in the demo system.`)
  }

  const newDemoUser = {
    id: `USER-${Date.now().toString().slice(-4)}`,
    full_name: cleanFullName,
    email: cleanEmail,
    role: cleanRole,
    department: department.trim() || (cleanRole === 'staff' ? 'Sales & Design' : 'Production'),
    mobile: mobile.trim() || '+91 98765 00000',
    created_at: new Date().toISOString(),
    status: sendInvite ? 'Invited' : 'Active',
  }

  const updatedDemoList = [newDemoUser, ...demoUsers]
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updatedDemoList))

  return {
    success: true,
    message: sendInvite
      ? `Invitation link generated for ${cleanEmail} (Demo Mode).`
      : `User ${cleanFullName} created successfully (Demo Mode). Password: ${password || 'Shivkrupa@2026'}`,
    user: {
      ...newDemoUser,
      temporaryPassword: sendInvite ? null : (password || 'Shivkrupa@2026'),
    },
  }
}

/**
 * Remove a user profile (Admin only)
 */
export async function deleteTeamUser(userId) {
  if (!userId) throw new Error('User ID is required')

  if (isSupabaseConfigured) {
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (error) {
      throw new Error(error.message || 'Failed to remove user profile.')
    }
    return true
  }

  // Offline mock deletion
  const demoUsers = getStoredDemoUsers()
  const filtered = demoUsers.filter((u) => u.id !== userId)
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(filtered))
  return true
}
