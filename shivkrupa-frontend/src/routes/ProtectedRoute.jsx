import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Prevent premature redirect while session is being restored from Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
        <p className="text-stone-500 text-sm font-medium">Verifying authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect based on user's authorized role
    switch (user?.role) {
      case 'customer':
        return <Navigate to="/customer/dashboard" replace />
      case 'staff':
        return <Navigate to="/staff/dashboard" replace />
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />
      case 'production':
        return <Navigate to="/production/dashboard" replace />
      default:
        return <Navigate to="/" replace />
    }
  }

  // Support both usages: Outlet for layout routes or direct children
  return children ? children : <Outlet />
}

export default ProtectedRoute
