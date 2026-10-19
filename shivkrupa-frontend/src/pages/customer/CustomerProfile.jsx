import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function CustomerProfile() {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    fullName: user?.name || user?.full_name || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || user.full_name || '',
        mobile: user.mobile || '',
        address: user.address || '',
      })
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await updateProfile({
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
      })
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-stone-500 mt-1">Manage your account information and preferences</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary text-sm"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => {
              setIsEditing(false)
              setFormData({
                fullName: user?.name || user?.full_name || '',
                mobile: user?.mobile || '',
                address: user?.address || '',
              })
            }}
            className="text-stone-500 hover:text-stone-700 text-sm font-medium"
          >
            Cancel
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center text-amber-800 font-bold text-2xl shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">{user?.name || 'Customer'}</h2>
            <p className="text-stone-500 text-xs font-mono mt-0.5">ID: {user?.id}</p>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold rounded-full uppercase tracking-wider">
              {user?.role || 'customer'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            readOnly={!isEditing}
            required
          />
          <Input
            label="Email Address"
            value={user?.email || ''}
            readOnly
            disabled
          />
          <Input
            label="Mobile Number"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            readOnly={!isEditing}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            readOnly={!isEditing}
          />

          {isEditing && (
            <div className="pt-3">
              <Button type="submit" isLoading={saving} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  )
}
