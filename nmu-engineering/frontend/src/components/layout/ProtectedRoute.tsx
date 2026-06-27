import React, { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  requireSuperAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireSuperAdmin = false }) => {
  const { isAuthenticated, isSuperAdmin, checkAuth } = useAuth()
  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
