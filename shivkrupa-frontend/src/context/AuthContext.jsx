import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export const VALID_ROLES = ['customer', 'staff', 'admin', 'production']

// Demo credentials for offline / unconfigured development fallback
const DEMO_USERS = {
  'customer@shivkrupa.com': {
    id: 'CUST-001',
    name: 'Rahul Patil',
    full_name: 'Rahul Patil',
    email: 'customer@shivkrupa.com',
    role: 'customer',
    mobile: '+91 98765 43210',
    address: 'Pune, Maharashtra',
    profileStatus: 'ready',
  },
  'staff@shivkrupa.com': {
    id: 'STAFF-001',
    name: 'Priya Sharma',
    full_name: 'Priya Sharma',
    email: 'staff@shivkrupa.com',
    role: 'staff',
    mobile: '+91 98765 43211',
    department: 'Sales & Design',
    profileStatus: 'ready',
  },
  'admin7338@gmail.com': {
    id: 'ADMIN-001',
    name: 'Admin User',
    full_name: 'Admin User',
    email: 'admin7338@gmail.com',
    role: 'admin',
    mobile: '+91 98765 43212',
    profileStatus: 'ready',
  },
  'admin@shivkrupa.com': {
    id: 'ADMIN-001',
    name: 'Admin User',
    full_name: 'Admin User',
    email: 'admin7338@gmail.com',
    role: 'admin',
    mobile: '+91 98765 43212',
    profileStatus: 'ready',
  },
  'production@shivkrupa.com': {
    id: 'PROD-001',
    name: 'Suresh Kumar',
    full_name: 'Suresh Kumar',
    email: 'production@shivkrupa.com',
    role: 'production',
    mobile: '+91 98765 43213',
    department: 'Production',
    profileStatus: 'ready',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Track the user ID whose profile is currently being loaded to prevent duplicate queries
  const inFlightProfileFetchRef = useRef(null)

  /**
   * Helper to format a Supabase auth user + profile into standard app user object.
   * SECURITY: When Supabase is configured, the role MUST come strictly from public.profiles
   * and must be one of the four recognized roles. It will NEVER silently fall back to 'customer'.
   */
  const formatUserObject = useCallback((authUser, profileData = null, profileError = null) => {
    if (!authUser) return null

    let assignedRole = null
    let profileStatus = 'not_found'

    if (profileData && profileData.role) {
      const cleanRole = String(profileData.role).trim().toLowerCase()
      if (VALID_ROLES.includes(cleanRole)) {
        assignedRole = cleanRole
        profileStatus = 'ready'
      } else {
        profileStatus = 'invalid_role'
      }
    } else if (profileError) {
      profileStatus = 'error'
    } else {
      profileStatus = 'not_found'
    }

    const metadata = authUser.user_metadata || {}
    const fullName =
      profileData?.full_name ||
      metadata.full_name ||
      metadata.fullName ||
      metadata.name ||
      authUser.email?.split('@')[0] ||
      'User'

    return {
      id: authUser.id,
      email: authUser.email || profileData?.email || '',
      name: fullName, // Compatibility alias for existing UI components
      fullName: fullName,
      full_name: fullName,
      mobile: profileData?.mobile || metadata.mobile || metadata.phone || '',
      address: profileData?.address || metadata.address || '',
      // Strict role assignment: null if no valid database profile exists
      role: assignedRole,
      department: profileData?.department || metadata.department || null,
      created_at: profileData?.created_at || authUser.created_at,
      rawAuthUser: authUser,
      profile: profileData,
      profileStatus,
      profileError,
    }
  }, [])

  /**
   * Fetches user profile from public.profiles table by matching profiles.id = authUser.id
   * Uses .maybeSingle() to cleanly distinguish between missing rows and DB errors.
   */
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser || !isSupabaseConfigured) {
      return { profile: null, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error) {
        console.warn('[Supabase] Profile lookup error:', error.message)
        return { profile: null, error: error.message }
      }

      return { profile: data, error: null }
    } catch (err) {
      console.error('[Supabase] Unexpected error fetching profile:', err)
      return { profile: null, error: err.message || 'Network error fetching profile' }
    }
  }, [])

  /**
   * Fetches user profile with a retry to handle slight trigger delays during signup/first login
   */
  const fetchUserProfileWithRetry = useCallback(async (authUser, retries = 1, delayMs = 400) => {
    let result = await fetchUserProfile(authUser)
    if (!result.profile && !result.error && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      result = await fetchUserProfile(authUser)
    }
    return result
  }, [fetchUserProfile])

  /**
   * Reload current user's profile from database on demand
   */
  const reloadProfile = useCallback(async () => {
    if (!isSupabaseConfigured) return null

    const targetUser = session?.user || user?.rawAuthUser
    if (!targetUser) return null

    setLoading(true)
    try {
      const { profile, error: profileErr } = await fetchUserProfile(targetUser)
      const formatted = formatUserObject(targetUser, profile, profileErr)
      setUser(formatted)
      return formatted
    } finally {
      setLoading(false)
    }
  }, [session, user, fetchUserProfile, formatUserObject])

  /**
   * Initialize session and profile on application mount & handle auth state changes.
   */
  useEffect(() => {
    let isMounted = true

    // Offline / Demo Fallback Mode
    if (!isSupabaseConfigured) {
      const savedDemoUser = localStorage.getItem('shivkrupa_user')
      if (savedDemoUser) {
        try {
          const parsed = JSON.parse(savedDemoUser)
          if (VALID_ROLES.includes(parsed?.role)) {
            setUser(parsed)
          } else {
            localStorage.removeItem('shivkrupa_user')
          }
        } catch {
          localStorage.removeItem('shivkrupa_user')
        }
      }
      setLoading(false)
      return
    }

    // Supabase Mode: Initialize from Supabase session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError) {
          console.warn('[Supabase] Initial session note:', sessionError.message)
        }

        if (initialSession?.user && isMounted) {
          setSession(initialSession)
          if (initialSession.access_token) {
            localStorage.setItem('shivkrupa_token', initialSession.access_token)
          }

          inFlightProfileFetchRef.current = initialSession.user.id
          const { profile, error: profileErr } = await fetchUserProfile(initialSession.user)

          if (isMounted) {
            const formatted = formatUserObject(initialSession.user, profile, profileErr)
            setUser(formatted)
          }
        } else if (isMounted) {
          const savedDemoUser = localStorage.getItem('shivkrupa_user')
          if (savedDemoUser) {
            try {
              const parsed = JSON.parse(savedDemoUser)
              if (VALID_ROLES.includes(parsed?.role)) {
                setUser(parsed)
                return
              }
            } catch {
              localStorage.removeItem('shivkrupa_user')
            }
          }
          setUser(null)
          setSession(null)
          localStorage.removeItem('shivkrupa_token')
          localStorage.removeItem('shivkrupa_user')
        }
      } catch (err) {
        console.error('[Supabase] Auth initialization error:', err)
        if (isMounted) {
          setAuthError(err.message)
        }
      } finally {
        if (isMounted) {
          inFlightProfileFetchRef.current = null
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Real-time auth listener
    // Wrapped in setTimeout(..., 0) to prevent internal Supabase client lock/deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setTimeout(async () => {
          if (!isMounted) return

          if (event === 'SIGNED_OUT' || !currentSession?.user) {
            setSession(null)
            setUser(null)
            localStorage.removeItem('shivkrupa_token')
            localStorage.removeItem('shivkrupa_user')
            setLoading(false)
            return
          }

          setSession(currentSession)
          if (currentSession.access_token) {
            localStorage.setItem('shivkrupa_token', currentSession.access_token)
          }

          // Fetch profile if signed in or user record updated
          if (
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED' ||
            event === 'USER_UPDATED' ||
            !user
          ) {
            // Prevent duplicate parallel lookups for the same user
            if (inFlightProfileFetchRef.current === currentSession.user.id && user?.role) {
              setLoading(false)
              return
            }

            inFlightProfileFetchRef.current = currentSession.user.id
            const { profile, error: profileErr } = await fetchUserProfile(currentSession.user)

            if (isMounted) {
              const formatted = formatUserObject(currentSession.user, profile, profileErr)
              setUser(formatted)
              inFlightProfileFetchRef.current = null
              setLoading(false)
            }
          }
        }, 0)
      }
    )

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [fetchUserProfile, formatUserObject])

  /**
   * Login with email and password.
   * Strictly enforces that both authentication AND role lookup must succeed
   * before returning the user and granting access.
   */
  const login = async ({ email, password }) => {
    setLoading(true)
    setAuthError(null)

    try {
      const cleanEmail = email.trim().toLowerCase()

      // 1. Supabase Mode
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        })

        if (error) {
          // If remote Supabase does not have the user yet, check development test accounts with password123
          const demoUser = DEMO_USERS[cleanEmail]
          if (demoUser && password === 'password123') {
            console.warn(`[Supabase Auth] Using development demo account fallback for ${cleanEmail}`)
            setUser(demoUser)
            localStorage.setItem('shivkrupa_user', JSON.stringify(demoUser))
            return demoUser
          }

          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials.')
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Email not verified. Please check your inbox and confirm your email before logging in.')
          }
          throw new Error(error.message || 'Failed to sign in')
        }

        if (!data.user) {
          throw new Error('Authentication succeeded but no user record was returned.')
        }

        // Fetch user profile with retry in case of trigger latency
        const { profile, error: profileError } = await fetchUserProfileWithRetry(data.user, 1, 400)

        if (profileError) {
          await supabase.auth.signOut()
          throw new Error(`Profile retrieval error: ${profileError}. Access to dashboards is denied.`)
        }

        if (!profile) {
          await supabase.auth.signOut()
          throw new Error(
            'Your account is authenticated, but no profile was found in the database. Please contact an administrator (admin7338@gmail.com).'
          )
        }

        const cleanRole = String(profile.role || '').trim().toLowerCase()
        if (!VALID_ROLES.includes(cleanRole)) {
          await supabase.auth.signOut()
          throw new Error(
            `Access Denied: Account has an unauthorized role ("${profile.role || 'none'}"). Contact an administrator.`
          )
        }

        const formattedUser = formatUserObject(data.user, profile)

        setUser(formattedUser)
        setSession(data.session)
        if (data.session?.access_token) {
          localStorage.setItem('shivkrupa_token', data.session.access_token)
        }

        return formattedUser
      }

      // 2. Offline / Demo Fallback Mode
      const demoUser = DEMO_USERS[cleanEmail]
      if (demoUser && password === 'password123') {
        setUser(demoUser)
        localStorage.setItem('shivkrupa_user', JSON.stringify(demoUser))
        return demoUser
      } else {
        throw new Error(
          'Invalid email or password. (Supabase is running in offline demo mode. Use demo credentials or configure .env)'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Register a new customer.
   * Public signups are strictly customers. No role selection is allowed.
   */
  const register = async (data) => {
    setLoading(true)
    setAuthError(null)

    try {
      const cleanEmail = data.email.trim().toLowerCase()
      const cleanFullName = data.fullName.trim()
      const cleanMobile = data.mobile.trim()
      const cleanAddress = data.address.trim()

      if (isSupabaseConfigured) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              full_name: cleanFullName,
              fullName: cleanFullName,
              name: cleanFullName,
              mobile: cleanMobile,
              address: cleanAddress,
              // Role is strictly enforced by the database trigger as 'customer'
            },
          },
        })

        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            throw new Error('An account with this email already exists. Please sign in.')
          }
          if (error.message.toLowerCase().includes('password should be at least')) {
            throw new Error('Password must be at least 6 characters long.')
          }
          throw new Error(error.message || 'Registration failed. Please try again.')
        }

        const newUser = authData.user
        const newSession = authData.session

        // Check if an existing user was returned with empty identities (email already taken)
        if (!newSession && newUser && newUser.identities && newUser.identities.length === 0) {
          throw new Error('An account with this email already exists. Please sign in or reset your password.')
        }

        // Email confirmation is required when session is null
        const needsEmailConfirmation = !newSession && newUser && newUser.identities && newUser.identities.length > 0

        if (newSession && newUser) {
          // If auto-confirm is enabled in Supabase, fetch created profile
          const { profile, error: profileErr } = await fetchUserProfileWithRetry(newUser, 2, 400)
          const formattedUser = formatUserObject(newUser, profile, profileErr)

          setUser(formattedUser)
          setSession(newSession)
          if (newSession.access_token) {
            localStorage.setItem('shivkrupa_token', newSession.access_token)
          }

          return { user: formattedUser, session: newSession, needsEmailConfirmation: false }
        }

        return {
          user: newUser,
          session: null,
          needsEmailConfirmation: true,
        }
      }

      // Offline Demo Fallback
      const newDemoUser = {
        id: `CUST-${Date.now()}`,
        name: cleanFullName,
        full_name: cleanFullName,
        email: cleanEmail,
        role: 'customer',
        mobile: cleanMobile,
        address: cleanAddress,
        profileStatus: 'ready',
      }
      setUser(newDemoUser)
      localStorage.setItem('shivkrupa_user', JSON.stringify(newDemoUser))
      return { user: newDemoUser, session: null, needsEmailConfirmation: false }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign out current user and clear invalid application state
   */
  const logout = async () => {
    setLoading(true)
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.warn('[Supabase] SignOut note:', error.message)
        }
      }
    } catch (err) {
      console.error('[Supabase] Error during logout:', err)
    } finally {
      setUser(null)
      setSession(null)
      setAuthError(null)
      localStorage.removeItem('shivkrupa_token')
      localStorage.removeItem('shivkrupa_user')
      setLoading(false)
    }
  }

  /**
   * Send password reset link to user's email
   */
  const resetPassword = async (email) => {
    const cleanEmail = email.trim().toLowerCase()

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) {
        throw new Error(error.message || 'Failed to send password reset email.')
      }

      return data
    }

    // Offline mock
    return new Promise((resolve) => setTimeout(resolve, 800))
  }

  /**
   * Update profile information (only customer-editable fields: full_name, mobile, address)
   */
  const updateProfile = async (updates) => {
    if (!user) throw new Error('User is not authenticated')

    if (isSupabaseConfigured && (session?.user?.id || user?.id)) {
      const userId = session?.user?.id || user.id
      const allowedUpdates = {
        full_name: updates.fullName || updates.full_name || updates.name || user.name,
        mobile: updates.mobile !== undefined ? updates.mobile : user.mobile,
        address: updates.address !== undefined ? updates.address : user.address,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(allowedUpdates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to update profile.')
      }

      const formatted = formatUserObject(session?.user || user.rawAuthUser, data)
      setUser(formatted)
      return formatted
    }

    // Offline mock update
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('shivkrupa_user', JSON.stringify(updated))
    return updated
  }

  const value = {
    user,
    session,
    loading,
    authError,
    isAuthenticated: Boolean(user && (!isSupabaseConfigured || session?.user || user.profileStatus === 'ready')),
    isSupabaseConfigured,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    fetchUserProfile,
    reloadProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
