import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowLeft, Building2, AlertCircle } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import logo from '../../assets/logo.png'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isSupabaseConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname

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

      // If user came from a protected route and role matches, redirect there
      if (from && from !== '/login') {
        navigate(from, { replace: true })
        return
      }

      // Otherwise redirect based on role
      switch (loggedUser.role) {
        case 'customer':
          navigate('/customer/dashboard', { replace: true })
          break
        case 'staff':
          navigate('/staff/dashboard', { replace: true })
          break
        case 'admin':
          navigate('/admin/dashboard', { replace: true })
          break
        case 'production':
          navigate('/production/dashboard', { replace: true })
          break
        default:
          navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoFill = (email) => {
    setForm({ email, password: 'password123' })
    setError('')
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
            <h2 className="text-2xl font-bold text-stone-900">Welcome Back</h2>
            <p className="text-stone-500 mt-1">Sign in to manage your projects</p>
          </div>

          <div className="card p-8 shadow-premium">
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

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

            <div className="mt-6 text-center text-sm text-stone-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-700 hover:text-amber-800 font-semibold">
                Get Started
              </Link>
            </div>
          </div>

          {/* Quick Demo Credentials for Testing */}
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
                onClick={() => handleDemoFill('admin@shivkrupa.com')}
                className="bg-stone-50 hover:bg-stone-100 p-2 rounded-lg text-stone-600 text-center transition-colors truncate"
                title="Click to fill admin credentials"
              >
                admin@shivkrupa.com
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
