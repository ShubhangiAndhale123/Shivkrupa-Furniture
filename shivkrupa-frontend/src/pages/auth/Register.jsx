import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowLeft, CheckCircle, Mail, AlertCircle } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import logo from '../../assets/logo.png'

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    address: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [successState, setSuccessState] = useState(null) // null | 'direct_login' | 'needs_verification'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Invalid email format'
    }

    const digitsOnly = form.mobile.replace(/\D/g, '')
    if (!form.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (digitsOnly.length < 10) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!form.address.trim()) {
      newErrors.address = 'Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
        address: form.address.trim(),
      })

      if (result?.needsEmailConfirmation) {
        setSuccessState('needs_verification')
      } else {
        setSuccessState('direct_login')
        setTimeout(() => navigate('/customer/dashboard', { replace: true }), 1500)
      }
    } catch (err) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // State: Needs Email Confirmation
  if (successState === 'needs_verification') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md card p-8 shadow-premium text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-amber-700" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2 font-display">Verify Your Email</h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            We have sent a verification link to <strong className="text-stone-900">{form.email}</strong>.
            Please check your inbox (and spam folder) and click the confirmation link to activate your account.
          </p>
          <div className="space-y-3">
            <Link to="/login" className="btn-primary w-full inline-block text-center">
              Go to Login
            </Link>
            <Link to="/" className="text-xs text-stone-500 hover:text-stone-700 inline-block">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // State: Direct registration success
  if (successState === 'direct_login') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2 font-display">Welcome to Shivkrupa!</h2>
          <p className="text-stone-500">Your account has been created successfully. Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200')] bg-cover bg-center" />
        </div>
        <div className="relative text-center px-12">
          <img src={logo} alt="Shivkrupa" className="h-32 w-auto mx-auto mb-8 drop-shadow-2xl" />
          <h1 className="text-4xl font-bold text-white mb-4 font-display">SHIVKRUPA</h1>
          <p className="text-amber-400 text-lg tracking-widest uppercase mb-6">Doors & Hardware</p>
          <p className="text-stone-300 max-w-md mx-auto leading-relaxed">
            Join hundreds of happy customers who trust Shivkrupa for their custom doors, windows, and furniture needs.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden text-center mb-6">
            <img src={logo} alt="Shivkrupa" className="h-14 w-auto mx-auto mb-3" />
            <h1 className="text-xl font-bold text-stone-900 font-display">SHIVKRUPA</h1>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-stone-900">Create Account</h2>
            <p className="text-stone-500 mt-1">Start your furniture journey with us</p>
          </div>

          <div className="card p-8 shadow-premium">
            {errors.general && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                error={errors.fullName}
                required
                disabled={isSubmitting}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                required
                disabled={isSubmitting}
              />
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                error={errors.mobile}
                required
                disabled={isSubmitting}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (min 6 chars)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={errors.password}
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
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                required
                disabled={isSubmitting}
              />
              <Input
                label="Address"
                placeholder="Enter your full address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                error={errors.address}
                required
                disabled={isSubmitting}
              />

              <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-700 hover:text-amber-800 font-semibold">
                Sign In
              </Link>
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
