import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Building, MapPin, Settings, Users, Wrench, UserCheck, Search } from 'lucide-react'

const DatosMaestros: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')

  const maestros = [
    {
      id: 'empresas',
      title: 'Gestión de Empresas',
      description: 'Administrar empresas cliente del sistema',
      icon: Building,
      color: 'bg-blue-500',
      path: '/pmlinkadmin/datos-maestros/empresas',
      count: 0
    },
    {
      id: 'locales',
      title: 'Gestión de Locales',
      description: 'Administrar sedes y ubicaciones',
      icon: MapPin,
      color: 'bg-green-500',
      path: '/pmlinkadmin/datos-maestros/locales',
      count: 0
    },
    {
      id: 'equipos',
      title: 'Gestión de Equipos',
      description: 'Administrar equipos y activos',
      icon: Settings,
      color: 'bg-purple-500',
      path: '/pmlinkadmin/datos-maestros/equipos',
      count: 0
    },
    {
      id: 'roles',
      title: 'Gestión de Roles',
      description: 'Administrar roles y permisos',
      icon: UserCheck,
      color: 'bg-orange-500',
      path: '/pmlinkadmin/datos-maestros/roles',
      count: 0
    },
    {
      id: 'usuarios',
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: Users,
      color: 'bg-indigo-500',
      path: '/pmlinkadmin/datos-maestros/usuarios',
      count: 0
    },
    {
      id: 'tipos-mantenimiento',
      title: 'Tipos de Mantenimiento',
      description: 'Administrar tipos de mantenimiento',
      icon: Wrench,
      color: 'bg-red-500',
      path: '/pmlinkadmin/datos-maestros/tipos-mantenimiento',
      count: 0
    }
  ]

  const filteredMaestros = maestros.filter(maestro =>
    maestro.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maestro.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Datos Maestros</h1>
            <p className="text-gray-600">
              Administra toda la información base del sistema
            </p>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar mantenedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Mantenedores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaestros.map((maestro) => {
          const Icon = maestro.icon
          const isActive = location.pathname === maestro.path
          
          return (
            <div
              key={maestro.id}
              onClick={() => navigate(maestro.path)}
              className={`bg-white rounded-lg shadow-md p-6 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                isActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${maestro.color} p-3 rounded-lg transition-transform hover:scale-110`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {maestro.count} registros
                </div>
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                isActive ? 'text-primary-700' : 'text-gray-800 hover:text-primary-600'
              }`}>
                {maestro.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {maestro.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* No results */}
      {filteredMaestros.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No se encontraron mantenedores
          </h3>
          <p className="text-gray-600">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Información sobre Datos Maestros
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Los datos maestros son la información fundamental que soporta todas las operaciones 
              del sistema. Es importante mantener estos datos actualizados y consistentes para 
              garantizar el correcto funcionamiento del CMMS.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatosMaestros
