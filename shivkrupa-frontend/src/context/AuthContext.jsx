import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

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
  },
  'staff@shivkrupa.com': {
    id: 'STAFF-001',
    name: 'Priya Sharma',
    full_name: 'Priya Sharma',
    email: 'staff@shivkrupa.com',
    role: 'staff',
    mobile: '+91 98765 43211',
    department: 'Sales & Design',
  },
  'admin@shivkrupa.com': {
    id: 'ADMIN-001',
    name: 'Amit Desai',
    full_name: 'Amit Desai',
    email: 'admin@shivkrupa.com',
    role: 'admin',
    mobile: '+91 98765 43212',
  },
  'production@shivkrupa.com': {
    id: 'PROD-001',
    name: 'Suresh Kumar',
    full_name: 'Suresh Kumar',
    email: 'production@shivkrupa.com',
    role: 'production',
    mobile: '+91 98765 43213',
    department: 'Production',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Helper to format a Supabase auth user + profile into standard app user object
   */
  const formatUserObject = useCallback((authUser, profileData = null) => {
    if (!authUser) return null

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
      role: profileData?.role || metadata.role || 'customer',
      department: profileData?.department || metadata.department || null,
      created_at: profileData?.created_at || authUser.created_at,
      rawAuthUser: authUser,
      profile: profileData,
    }
  }, [])

  /**
   * Fetches user profile from public.profiles table
   */
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser || !isSupabaseConfigured) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        // If profile is not found yet (e.g. trigger delay), fallback gracefully
        console.warn('[Supabase] Profile lookup note:', error.message)
        return null
      }

      return data
    } catch (err) {
      console.error('[Supabase] Unexpected error fetching profile:', err)
      return null
    }
  }, [])

  /**
   * Initialize session and profile on application mount
   */
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          // Fallback to local storage demo session if Supabase is not configured
          const savedDemoUser = localStorage.getItem('shivkrupa_user')
          if (savedDemoUser && isMounted) {
            try {
              const parsed = JSON.parse(savedDemoUser)
              setUser(parsed)
            } catch (e) {
              localStorage.removeItem('shivkrupa_user')
            }
          }
          if (isMounted) setLoading(false)
          return
        }

        // Get initial session from Supabase
        const { data: { session: initialSession }, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError) {
          console.error('[Supabase] Error getting session:', sessionError.message)
        }

        if (initialSession?.user && isMounted) {
          setSession(initialSession)
          if (initialSession.access_token) {
            localStorage.setItem('shivkrupa_token', initialSession.access_token)
          }

          const profile = await fetchUserProfile(initialSession.user)
          const formatted = formatUserObject(initialSession.user, profile)
          if (isMounted) {
            setUser(formatted)
            localStorage.setItem('shivkrupa_user', JSON.stringify(formatted))
          }
        } else if (isMounted) {
          setUser(null)
          setSession(null)
          localStorage.removeItem('shivkrupa_token')
          localStorage.removeItem('shivkrupa_user')
        }
      } catch (err) {
        console.error('[Supabase] Auth initialization error:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Setup real-time auth state listener
    let authListener = null
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (!isMounted) return

          if (currentSession?.user) {
            setSession(currentSession)
            if (currentSession.access_token) {
              localStorage.setItem('shivkrupa_token', currentSession.access_token)
            }

            // Refetch profile on SIGNED_IN or USER_UPDATED
            const profile = await fetchUserProfile(currentSession.user)
            const formatted = formatUserObject(currentSession.user, profile)
            setUser(formatted)
            localStorage.setItem('shivkrupa_user', JSON.stringify(formatted))
          } else {
            setSession(null)
            setUser(null)
            localStorage.removeItem('shivkrupa_token')
            localStorage.removeItem('shivkrupa_user')
          }
          setLoading(false)
        }
      )
      authListener = subscription
    }

    return () => {
      isMounted = false
      if (authListener) {
        authListener.unsubscribe()
      }
    }
  }, [fetchUserProfile, formatUserObject])

  /**
   * Login with email and password
   */
  const login = async ({ email, password }) => {
    setLoading(true)

    try {
      const cleanEmail = email.trim().toLowerCase()

      // 1. If Supabase is configured, use Supabase Auth
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        })

        if (error) {
          // Provide descriptive error messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials.')
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Email not verified. Please check your inbox and confirm your email.')
          }
          throw new Error(error.message || 'Failed to sign in')
        }

        if (!data.user) {
          throw new Error('Authentication succeeded but no user was returned.')
        }

        // Fetch user profile
        const profile = await fetchUserProfile(data.user)
        const formattedUser = formatUserObject(data.user, profile)

        setUser(formattedUser)
        setSession(data.session)
        if (data.session?.access_token) {
          localStorage.setItem('shivkrupa_token', data.session.access_token)
        }
        localStorage.setItem('shivkrupa_user', JSON.stringify(formattedUser))

        return formattedUser
      }

      // 2. Offline / Demo Fallback when Supabase keys are not yet configured
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
   * Register a new customer
   */
  const register = async (data) => {
    setLoading(true)

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
              // Note: role is enforced on the database level as 'customer'
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

        // Check if email confirmation is required (session is null)
        const needsEmailConfirmation = !newSession && newUser && newUser.identities && newUser.identities.length > 0

        if (newSession && newUser) {
          // If auto-confirm is enabled in Supabase
          const profile = await fetchUserProfile(newUser)
          const formattedUser = formatUserObject(newUser, profile)
          setUser(formattedUser)
          setSession(newSession)
          if (newSession.access_token) {
            localStorage.setItem('shivkrupa_token', newSession.access_token)
          }
          localStorage.setItem('shivkrupa_user', JSON.stringify(formattedUser))
          return { user: formattedUser, session: newSession, needsEmailConfirmation: false }
        }

        return {
          user: newUser,
          session: null,
          needsEmailConfirmation: true,
        }
      }

      // Offline / Demo Fallback
      const newDemoUser = {
        id: `CUST-${Date.now()}`,
        name: cleanFullName,
        full_name: cleanFullName,
        email: cleanEmail,
        role: 'customer',
        mobile: cleanMobile,
        address: cleanAddress,
      }
      setUser(newDemoUser)
      localStorage.setItem('shivkrupa_user', JSON.stringify(newDemoUser))
      return { user: newDemoUser, session: null, needsEmailConfirmation: false }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign out current user
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
   * Update profile information
   */
  const updateProfile = async (updates) => {
    if (!user) throw new Error('User is not authenticated')

    if (isSupabaseConfigured && session?.user?.id) {
      const allowedUpdates = {
        full_name: updates.fullName || updates.full_name || updates.name || user.name,
        mobile: updates.mobile !== undefined ? updates.mobile : user.mobile,
        address: updates.address !== undefined ? updates.address : user.address,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(allowedUpdates)
        .eq('id', session.user.id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to update profile.')
      }

      const formatted = formatUserObject(session.user, data)
      setUser(formatted)
      localStorage.setItem('shivkrupa_user', JSON.stringify(formatted))
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
    isAuthenticated: !!user,
    isSupabaseConfigured,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    fetchUserProfile,
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
