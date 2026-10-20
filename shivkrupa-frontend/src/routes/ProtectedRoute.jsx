import React from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, VALID_ROLES } from '../context/AuthContext'
import { Loader2, ShieldAlert, LogOut, RefreshCw } from 'lucide-react'

function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading, logout, reloadProfile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // 1. Loading state while authentication and role retrieval are in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
        <p className="text-stone-500 text-sm font-medium">Verifying authorization...</p>
      </div>
    )
  }

  // 2. Unauthenticated user -> redirect to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Authenticated user, but missing profile or invalid/unassigned role -> Fail safely
  if (!user.role || !VALID_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-premium border border-stone-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2 font-display">Access Denied</h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            {user.profileStatus === 'not_found'
              ? 'Your profile could not be found in the database. An administrator must provision your account profile before you can access dashboards.'
              : `Your account does not have a valid assigned role (current: "${user.role || 'none'}"). Access to system dashboards is restricted.`}
          </p>
          <div className="space-y-3">
            {reloadProfile && (
              <button
                type="button"
                onClick={() => reloadProfile()}
                className="btn-accent w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retry Profile Lookup
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/login', { replace: true })
              }}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 4. Role authorization check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If an authenticated user tries to access a dashboard of another role,
    // redirect them to their own authorized dashboard
    switch (user.role) {
      case 'customer':
        return <Navigate to="/customer/dashboard" replace />
      case 'staff':
        return <Navigate to="/staff/dashboard" replace />
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />
      case 'production':
        return <Navigate to="/production/dashboard" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  // 5. Authorized: render children or nested routes
  return children ? children : <Outlet />
}

export default ProtectedRoute
