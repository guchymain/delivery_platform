import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loader2 } from 'lucide-react'

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to default home for their role
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />
    if (role === 'RIDER') return <Navigate to="/rider/dashboard" replace />
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
