import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Database, 
  Settings, 
  FileText, 
  Bell, 
  LogOut, 
  User,
  Menu,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface UserInfo {
  usuario_id: string
  email: string
  nombres: string
  apellidos: string
  rol: string
}

const Layout: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const savedUser = localStorage.getItem('pmlink_user')
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser)
        setUser(userInfo)
      } catch (error) {
        console.error('Error parsing user info:', error)
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate])

  const handleLogout = async () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem('pmlink_user')
      setUser(null)
      toast.success('Sesión cerrada correctamente')
      navigate('/')
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  const menuItems = [
    { path: '/pmlinkadmin/dashboard', label: 'Inicio', icon: Home },
    { path: '/pmlinkadmin/datos-maestros', label: 'Datos Maestros', icon: Database },
    { path: '/pmlinkadmin/operaciones', label: 'Operaciones', icon: Settings },
    { path: '/pmlinkadmin/reportes', label: 'Reportes', icon: FileText },
    { path: '/pmlinkadmin/notificaciones', label: 'Notificaciones', icon: Bell },
  ]

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const Sidebar = () => (
    <div className="bg-white shadow-lg border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <img 
              src="/pmlinkadmin/logo.png" 
              alt="PM Link Logo" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-white text-sm font-bold">PM</span>';
                }
              }}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">PM Link</h2>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="px-4 pb-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <button
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Panel de Administración
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <div className="text-sm">
                  <p className="font-medium text-gray-800">{user?.email}</p>
                  <p className="text-gray-600">{user?.rol}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar for desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64 bg-white">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
