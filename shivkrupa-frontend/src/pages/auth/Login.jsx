import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, VALID_ROLES } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowLeft, Building2, AlertCircle, Loader2, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import logo from '../../assets/logo.png'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInviteMode, setIsInviteMode] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const { login, isSupabaseConfigured, user, isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname

  // Detect invitation or recovery tokens in URL hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash && (hash.includes('type=invite') || hash.includes('type=recovery'))) {
      setIsInviteMode(true)
    }
  }, [])

  // Helper to map role to authorized dashboard
  const getDashboardPath = (role) => {
    switch (role) {
      case 'customer':
        return '/customer/dashboard'
      case 'staff':
        return '/staff/dashboard'
      case 'admin':
        return '/admin/dashboard'
      case 'production':
        return '/production/dashboard'
      default:
        return null
    }
  }

  // When already authenticated and authorized, automatically redirect to role dashboard (unless in invite setup)
  useEffect(() => {
    if (isInviteMode) return
    if (!loading && isAuthenticated && user?.role && VALID_ROLES.includes(user.role)) {
      const dest = getDashboardPath(user.role)
      if (dest) {
        navigate(dest, { replace: true })
      }
    }
  }, [loading, isAuthenticated, user, navigate, isInviteMode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!form.password) {
      setError('Please enter your password.')
      return
    }

    setIsSubmitting(true)
    try {
      const loggedUser = await login(form)

      // Verify that authentication AND role retrieval both succeeded
      if (!loggedUser?.role || !VALID_ROLES.includes(loggedUser.role)) {
        setError('Authentication succeeded, but no valid role was assigned to your account. Access is restricted.')
        return
      }

      // Check if user came from an authorized route matching their role
      const canAccessFrom = (role, path) => {
        if (!path || path === '/login' || path === '/register') return false
        if (role === 'customer') return path.startsWith('/customer/')
        if (role === 'staff') return path.startsWith('/staff/')
        if (role === 'production') return path.startsWith('/production/')
        if (role === 'admin') {
          return path.startsWith('/admin/') || path.startsWith('/staff/') || path.startsWith('/production/')
        }
        return false
      }

      if (from && canAccessFrom(loggedUser.role, from)) {
        navigate(from, { replace: true })
      } else {
        const dest = getDashboardPath(loggedUser.role)
        navigate(dest || '/', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetInvitePassword = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isSupabaseConfigured) {
        const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
        if (updateErr) throw updateErr
      }
      setPasswordSaved(true)
      setTimeout(() => {
        setIsInviteMode(false)
        const dest = getDashboardPath(user?.role || 'staff')
        navigate(dest || '/', { replace: true })
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoFill = (email) => {
    setForm({ email, password: 'password123' })
    setError('')
  }

  // Loading state while checking existing session to avoid layout flicker
  if (loading && !isSubmitting && !isInviteMode) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
        <p className="text-stone-500 text-sm font-medium">Checking session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200')] bg-cover bg-center" />
        </div>
        <div className="relative text-center px-12">
          <img src={logo} alt="Shivkrupa" className="h-32 w-auto mx-auto mb-8 drop-shadow-2xl" />
          <h1 className="text-4xl font-bold text-white mb-4 font-display">SHIVKRUPA</h1>
          <p className="text-amber-400 text-lg tracking-widest uppercase mb-6">Doors & Hardware</p>
          <p className="text-stone-300 max-w-md mx-auto leading-relaxed">
            Your trusted partner for premium doors, windows, sofas, home temples, and wardrobes since 1996.
          </p>
          <div className="flex items-center justify-center gap-6 mt-10 text-stone-400 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Kodoli, Satara</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="Shivkrupa" className="h-16 w-auto mx-auto mb-3" />
            <h1 className="text-xl font-bold text-stone-900 font-display">SHIVKRUPA</h1>
            <p className="text-xs text-stone-500 tracking-widest uppercase">Doors & Hardware</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-900">
              {isInviteMode ? 'Welcome to the Team' : 'Welcome Back'}
            </h2>
            <p className="text-stone-500 mt-1">
              {isInviteMode ? 'Complete your staff or production setup' : 'Sign in to manage your projects'}
            </p>
          </div>

          <div className="card p-8 shadow-premium">
            {/* Authenticated user with invalid or missing role notification */}
            {!isInviteMode && isAuthenticated && (!user?.role || !VALID_ROLES.includes(user.role)) && (
              <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Role assignment required</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Logged in as <strong>{user?.email}</strong>, but no role profile was found.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-xs text-amber-900 font-semibold underline hover:text-amber-950 flex-shrink-0"
                >
                  Sign Out
                </button>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isInviteMode ? (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 font-display">Complete Your Account Setup</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Please set a secure password for your account to finish onboarding.
                  </p>
                </div>

                {passwordSaved ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 text-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="font-semibold">Password set successfully!</p>
                    <p className="text-xs mt-1">Redirecting you to your team dashboard...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSetInvitePassword} className="space-y-4">
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <Button type="submit" isLoading={isSubmitting} className="w-full">
                      Save Password & Enter Dashboard
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
                    <input type="checkbox" className="rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="text-amber-700 hover:text-amber-800 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  Sign In
                </Button>
              </form>
            )}

            {!isInviteMode && (
              <div className="mt-6 text-center text-sm text-stone-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-amber-700 hover:text-amber-800 font-semibold">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Quick Test Credentials for Testing */}
          <div className="mt-6 bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-500 font-medium">
                {isSupabaseConfigured ? 'Test Accounts (Supabase Auth)' : 'Demo Credentials (Offline Mode)'}
              </p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {isSupabaseConfigured ? 'Supabase Connected' : 'Offline Mock'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill('customer@shivkrupa.com')}
                className="bg-stone-50 hover:bg-stone-100 p-2 rounded-lg text-stone-600 text-center transition-colors truncate"
                title="Click to fill customer credentials"
              >
                customer@shivkrupa.com
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('staff@shivkrupa.com')}
                className="bg-stone-50 hover:bg-stone-100 p-2 rounded-lg text-stone-600 text-center transition-colors truncate"
                title="Click to fill staff credentials"
              >
                staff@shivkrupa.com
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin7338@gmail.com')}
                className="bg-stone-50 hover:bg-stone-100 p-2 rounded-lg text-stone-600 text-center transition-colors truncate"
                title="Click to fill admin credentials"
              >
                admin7338@gmail.com
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('production@shivkrupa.com')}
                className="bg-stone-50 hover:bg-stone-100 p-2 rounded-lg text-stone-600 text-center transition-colors truncate"
                title="Click to fill production credentials"
              >
                production@shivkrupa.com
              </button>
              <div className="col-span-2 text-center text-stone-400 text-[11px]">
                Default password: <code className="bg-stone-100 px-1.5 py-0.5 rounded">password123</code>
              </div>
            </div>
          </div>

          <Link to="/" className="flex items-center justify-center gap-2 mt-6 text-sm text-stone-500 hover:text-stone-700">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
