import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Shield,
  Briefcase,
  Wrench,
  UserCheck,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Building,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import AddUserModal from '../../components/admin/AddUserModal'
import { fetchUsers, deleteTeamUser } from '../../services/adminService'
import { formatDate, getInitials } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function AdminEmployees() {
  const { user: currentAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [copiedEmail, setCopiedEmail] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [notification, setNotification] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchErr, isOffline } = await fetchUsers()
      if (fetchErr) {
        setError(fetchErr)
      } else {
        setUsers(data || [])
        setIsOfflineMode(Boolean(isOffline))
      }
    } catch (err) {
      setError(err.message || 'Failed to load user directory.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.id === currentAdmin?.id) {
      alert('You cannot delete your own administrative account.')
      return
    }

    const confirmMsg = `Are you sure you want to remove ${userToDelete.full_name || userToDelete.email} (${userToDelete.role}) from the system?`
    if (!window.confirm(confirmMsg)) return

    setDeletingId(userToDelete.id)
    try {
      await deleteTeamUser(userToDelete.id)
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setNotification({
        type: 'success',
        message: `Removed ${userToDelete.full_name || userToDelete.email} successfully.`,
      })
      setTimeout(() => setNotification(null), 3000)
    } catch (err) {
      alert(`Error deleting user: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleUserCreated = (newUser) => {
    loadUsers()
    setNotification({
      type: 'success',
      message: `User ${newUser.fullName || newUser.email} (${newUser.role}) successfully provisioned.`,
    })
    setTimeout(() => setNotification(null), 4000)
  }

  // Filter and search computation
  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    const deptMatch = (u.department || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSearch = nameMatch || emailMatch || deptMatch

    if (!matchesSearch) return false

    if (roleFilter === 'all') return true
    if (roleFilter === 'team') return ['staff', 'production'].includes(u.role)
    return u.role === roleFilter
  })

  // Counters
  const staffCount = users.filter((u) => u.role === 'staff').length
  const productionCount = users.filter((u) => u.role === 'production').length
  const customerCount = users.filter((u) => u.role === 'customer').length
  const adminCount = users.filter((u) => u.role === 'admin').length

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        )
      case 'staff':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3 h-3" /> Staff
          </span>
        )
      case 'production':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <Wrench className="w-3 h-3" /> Production
          </span>
        )
      case 'customer':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
            <UserCheck className="w-3 h-3" /> Customer
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">User Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
              Admin Portal
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Provision staff and production team members, manage roles, and review account permissions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-1.5"
            title="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="accent"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs text-emerald-700 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Staff Users</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{staffCount}</p>
              <p className="text-[11px] text-blue-600 mt-1 font-medium">Sales, Estimations, Orders</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Production Crew</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{productionCount}</p>
              <p className="text-[11px] text-amber-600 mt-1 font-medium">Manufacturing & Workshop</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Administrators</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{adminCount}</p>
              <p className="text-[11px] text-purple-600 mt-1 font-medium">Full system control</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Customers</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{customerCount}</p>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">Registered clients</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden border border-stone-200">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Role Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                roleFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('team')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                roleFilter === 'team'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Team Only ({staffCount + productionCount})
            </button>
            <button
              onClick={() => setRoleFilter('staff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                roleFilter === 'staff'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Staff ({staffCount})
            </button>
            <button
              onClick={() => setRoleFilter('production')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                roleFilter === 'production'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Production ({productionCount})
            </button>
            <button
              onClick={() => setRoleFilter('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                roleFilter === 'customer'
                  ? 'bg-stone-700 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Customers ({customerCount})
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Contact / Email</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Date Added</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                    <p className="text-sm">Loading user directory...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-stone-700">No users found</p>
                    <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                      {searchQuery
                        ? `No users match "${searchQuery}". Try modifying your search or filter.`
                        : 'No users have been provisioned in this category yet.'}
                    </p>
                    {!searchQuery && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Provision First User
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = getInitials(u.full_name || u.email || 'User')
                  const isCurrent = u.id === currentAdmin?.id

                  return (
                    <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'staff'
                                ? 'bg-blue-100 text-blue-800'
                                : u.role === 'production'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-900">
                                {u.full_name || 'Unnamed User'}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-stone-400 font-mono">ID: {u.id?.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">{getRoleBadge(u.role)}</td>

                      {/* Email & Mobile */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-stone-700">{u.email}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(u.email)}
                              className="text-stone-400 hover:text-stone-700 p-0.5 rounded transition-colors"
                              title="Copy email"
                            >
                              {copiedEmail === u.email ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {u.mobile && (
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {u.mobile}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 text-stone-600">
                        {u.department ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-stone-100 px-2 py-0.5 rounded-md text-stone-700">
                            <Building className="w-3 h-3 text-stone-400" />
                            {u.department}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 italic">—</span>
                        )}
                      </td>

                      {/* Date Joined */}
                      <td className="px-6 py-4 text-stone-500 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {formatDate(u.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={deletingId === u.id}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove user profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-stone-500 gap-2">
          <span>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> registered user profiles
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            Security enforced by Supabase Edge Functions & Row Level Security (RLS)
          </span>
        </div>
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  )
}
