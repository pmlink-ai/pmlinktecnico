import React from 'react'
import { Settings, Calendar, BarChart3, CheckSquare } from 'lucide-react'

const Operaciones: React.FC = () => {
  const sections = [
    {
      title: 'Programación de Servicios',
      description: 'Planifica y programa servicios de mantenimiento preventivo y correctivo',
      icon: Calendar,
      features: ['Calendario de servicios', 'Asignación de técnicos', 'Gestión de recursos', 'Notificaciones automáticas'],
      color: 'bg-blue-500'
    },
    {
      title: 'Monitoreo de Servicios',
      description: 'Supervisa el estado y progreso de los servicios en tiempo real',
      icon: BarChart3,
      features: ['Estado en tiempo real', 'Seguimiento de SLAs', 'Alertas y escalamientos', 'Métricas de rendimiento'],
      color: 'bg-green-500'
    },
    {
      title: 'Gestión de Tareas',
      description: 'Administra las tareas específicas de cada servicio',
      icon: CheckSquare,
      features: ['Lista de tareas detalladas', 'Procedimientos estándar', 'Check-lists digitales', 'Validaciones de calidad'],
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-500 p-3 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Operaciones</h1>
            <p className="text-gray-600">
              Gestión integral de servicios de mantenimiento
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-yellow-900 mb-1">
              Sección en Desarrollo
            </h3>
            <p className="text-yellow-800 text-sm">
              Esta sección está actualmente vacía y será implementada en futuras versiones.
            </p>
          </div>
        </div>
      </div>

      {/* Sections Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start space-x-4 mb-4">
                <div className={`${section.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {section.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Funcionalidades:</h4>
                <ul className="space-y-1">
                  {section.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Operaciones
