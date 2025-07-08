import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface UserInfo {
  usuario_id: string
  email: string
  nombres: string
  apellidos: string
  rol: string
}

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const savedUser = localStorage.getItem('pmlink_user')
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser)
        setUser(userInfo)
      } catch (error) {
        console.error('Error parsing user info:', error)
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Determinar si es admin basado en el rol
  const isAdmin = user.rol === 'Administrador PM-Link' || user.rol === 'Administrador Empresa'

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos suficientes para acceder a esta sección.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
