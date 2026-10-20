import React, { useState } from 'react'
import {
  X,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import { createTeamUser } from '../../services/adminService'

export default function AddUserModal({ isOpen, onClose, onUserCreated }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: 'staff',
    department: 'Sales & Design',
    mobile: '',
    password: '',
    sendInvite: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdUserResult, setCreatedUserResult] = useState(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const roleOptions = [
    {
      value: 'staff',
      title: 'Staff Member',
      description: 'Requirements, designs, cost estimations, quotations & customer management',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      value: 'production',
      title: 'Production Specialist',
      description: 'Workshop execution, assigned manufacturing orders & production stages',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ]

  const departmentPresets = [
    'Sales & Design',
    'Customer Relations',
    'Cost Estimation',
    'Production Workshop',
    'Carpentry & Assembly',
    'Finishing & Polish',
    'Quality Inspection',
  ]

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let pwd = 'Sk@'
    for (let i = 0; i < 9; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setForm((prev) => ({ ...prev, password: pwd }))
    setShowPassword(true)
  }

  const handleCopyCredentials = () => {
    if (!createdUserResult) return
    const text = `Shivkrupa Credentials:\nEmail: ${createdUserResult.email}\nPassword: ${createdUserResult.temporaryPassword}\nLogin URL: ${window.location.origin}/login`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      setError('Please provide a full name with at least 2 characters.')
      return
    }

    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please provide a valid email address.')
      return
    }

    if (!['staff', 'production'].includes(form.role)) {
      setError('Invalid role. Only "staff" and "production" users can be provisioned.')
      return
    }

    if (!form.sendInvite && form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await createTeamUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        department: form.department.trim(),
        mobile: form.mobile.trim(),
        password: form.sendInvite ? '' : (form.password.trim() || 'Shivkrupa@2026'),
        sendInvite: form.sendInvite,
      })

      setCreatedUserResult(response.user)
      if (onUserCreated) {
        onUserCreated(response.user)
      }
    } catch (err) {
      setError(err.message || 'Failed to create user. Please check server logs.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setForm({
      fullName: '',
      email: '',
      role: 'staff',
      department: 'Sales & Design',
      mobile: '',
      password: '',
      sendInvite: false,
    })
    setError('')
    setCreatedUserResult(null)
    setCopied(false)
    onClose()
  }

  const handleAddAnother = () => {
    setForm({
      fullName: '',
      email: '',
      role: 'staff',
      department: 'Sales & Design',
      mobile: '',
      password: '',
      sendInvite: false,
    })
    setError('')
    setCreatedUserResult(null)
    setCopied(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={isSubmitting ? undefined : handleResetAndClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden z-10 my-8 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display">User Management — Add User</h2>
              <p className="text-xs text-stone-300">Provision authorized staff or production personnel</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {createdUserResult ? (
            /* Success confirmation screen */
            <div className="py-2 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 font-display">User Account Provisioned</h3>
                <p className="text-sm text-stone-600 mt-1">
                  {createdUserResult.fullName} has been successfully registered with role{' '}
                  <span className="font-semibold uppercase text-stone-900 tracking-wider">
                    {createdUserResult.role}
                  </span>
                  .
                </p>
              </div>

              {/* User details card */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Full Name</span>
                  <span className="font-semibold text-stone-800">{createdUserResult.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Email Address</span>
                  <span className="font-mono text-stone-800 font-medium">{createdUserResult.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Assigned Role</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase border ${
                      createdUserResult.role === 'staff'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {createdUserResult.role}
                  </span>
                </div>
                {createdUserResult.department && (
                  <div className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-stone-500">Department</span>
                    <span className="text-stone-800 font-medium">{createdUserResult.department}</span>
                  </div>
                )}
                {createdUserResult.temporaryPassword && (
                  <div className="flex justify-between py-1 items-center bg-amber-50/70 -mx-4 -mb-4 mt-2 px-4 py-2.5 rounded-b-2xl border-t border-amber-200">
                    <div>
                      <span className="text-xs font-semibold text-amber-900 block">Initial Password</span>
                      <code className="text-sm font-mono text-amber-950 font-bold">
                        {createdUserResult.temporaryPassword}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-100 transition-colors shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Details
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-left text-xs text-blue-800 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Role-Based Redirection Active</p>
                  <p className="text-blue-700 mt-0.5">
                    Upon signing in at <code>/login</code>, this user will automatically redirect to their authorized{' '}
                    <strong>
                      {createdUserResult.role === 'staff' ? '/staff/dashboard' : '/production/dashboard'}
                    </strong>
                    .
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddAnother}
                  className="btn-secondary flex-1 py-2.5 text-sm"
                >
                  Add Another User
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  Close & View Directory
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              {/* Full Name */}
              <Input
                label="Full Name"
                placeholder="e.g. Ramesh Kulkarni"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                disabled={isSubmitting}
              />

              {/* Email Address */}
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. ramesh@shivkrupa.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={isSubmitting}
                helperText="Must be unique. A duplicate email address will be rejected."
              />

              {/* Role Selection (Radio cards) */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">
                  Assign System Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {roleOptions.map((opt) => {
                    const isSelected = form.role === opt.value
                    return (
                      <div
                        key={opt.value}
                        onClick={() => !isSubmitting && setForm({ ...form, role: opt.value })}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-700 bg-amber-50/50 shadow-sm'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-stone-900">{opt.title}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                            {opt.value}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed">{opt.description}</p>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[11px] text-stone-400">
                  <Shield className="w-3 h-3 inline mr-1 text-amber-700" />
                  Security rule: Admins can only provision Staff or Production users. Admin privilege escalation is prohibited.
                </p>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">Department / Specialization</label>
                <div className="relative">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Sales & Design, Workshop, Estimation"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    disabled={isSubmitting}
                    list="department-suggestions"
                  />
                  <datalist id="department-suggestions">
                    {departmentPresets.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Mobile (Optional) */}
              <Input
                label="Mobile Number (Optional)"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                disabled={isSubmitting}
              />

              {/* Provisioning Mode Toggle */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Account Activation Mode</span>
                  <div className="flex items-center bg-white border border-stone-200 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, sendInvite: false })}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        !form.sendInvite ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Set Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, sendInvite: true })}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        form.sendInvite ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Email Invite
                    </button>
                  </div>
                </div>

                {!form.sendInvite ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Initial Password</span>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Auto-Generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-field pr-10 text-sm font-mono"
                        placeholder="Default: Shivkrupa@2026 (or choose custom)"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Leave blank to use default temporary password: <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200">Shivkrupa@2026</code>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-600 leading-relaxed bg-white p-3 rounded-xl border border-stone-200">
                    <Mail className="w-4 h-4 inline mr-1.5 text-amber-700" />
                    An invitation email with a secure setup link will be sent to <strong>{form.email || 'the user'}</strong>. They can set their own password and sign in directly.
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetAndClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="px-6"
                >
                  <UserPlus className="w-4 h-4" />
                  {form.sendInvite ? 'Send Invitation' : 'Create User Account'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
