import React, { useState, useEffect } from 'react'
import { Building, MapPin, Settings, Users, Wrench, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UserInfo {
  usuario_id: string
  email: string
  nombres: string
  apellidos: string
  rol: string
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const savedUser = localStorage.getItem('pmlink_user')
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser)
        setUser(userInfo)
      } catch (error) {
        console.error('Error parsing user info:', error)
        // Si hay error, redirigir al login
        navigate('/')
      }
    } else {
      // Si no hay usuario guardado, redirigir al login
      navigate('/')
    }
  }, [navigate])

  const quickActions = [
    {
      title: 'Gestión de Empresas',
      description: 'Administrar empresas cliente',
      icon: Building,
      color: 'bg-blue-500',
      path: '/datos-maestros/empresas'
    },
    {
      title: 'Gestión de Locales',
      description: 'Administrar sedes y locales',
      icon: MapPin,
      color: 'bg-green-500',
      path: '/datos-maestros/locales'
    },
    {
      title: 'Gestión de Equipos',
      description: 'Administrar equipos y activos',
      icon: Settings,
      color: 'bg-purple-500',
      path: '/datos-maestros/equipos'
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: Users,
      color: 'bg-indigo-500',
      path: '/datos-maestros/usuarios'
    },
    {
      title: 'Operaciones',
      description: 'Programación y monitoreo',
      icon: Wrench,
      color: 'bg-primary-500',
      path: '/operaciones'
    },
    {
      title: 'Notificaciones',
      description: 'Alertas y recordatorios',
      icon: Bell,
      color: 'bg-red-500',
      path: '/notificaciones'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Loading state */}
      {!user ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Bienvenido a PM Link Admin!
            </h1>
            <p className="text-gray-600">
              Usuario: <span className="font-medium">{user?.email}</span> | 
              Rol: <span className="font-medium">{user?.rol}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona todos los aspectos de PMLink desde este panel centralizado
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 bg-primary-500 rounded-full items-center justify-center">
            <img 
              src="/pmlinkadmin/logo.png" 
              alt="PM Link Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-white text-lg font-bold">PM</span>';
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <div
                key={index}
                onClick={() => {
                  console.log('Navegando a:', action.path)
                  navigate(action.path)
                }}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No hay actividad reciente para mostrar</p>
          <p className="text-sm text-gray-400 mt-2">
            Las actividades aparecerán aquí una vez que comiences a usar el sistema
          </p>
        </div>
      </div>
      </>
      )}
    </div>
  )
}

export default Dashboard
