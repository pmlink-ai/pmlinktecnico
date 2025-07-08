import React from 'react'
import { Bell, AlertCircle, Clock, MessageSquare, Settings } from 'lucide-react'

const Notificaciones: React.FC = () => {
  const notificationTypes = [
    {
      title: 'Alertas',
      description: 'Notificaciones críticas del sistema',
      icon: AlertCircle,
      color: 'bg-red-500',
      count: 0
    },
    {
      title: 'Recordatorios',
      description: 'Recordatorios de mantenimiento',
      icon: Clock,
      color: 'bg-yellow-500',
      count: 0
    },
    {
      title: 'Mensajes',
      description: 'Mensajes del sistema',
      icon: MessageSquare,
      color: 'bg-blue-500',
      count: 0
    },
    {
      title: 'Avisos',
      description: 'Avisos generales',
      icon: Settings,
      color: 'bg-green-500',
      count: 0
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-500 p-3 rounded-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
            <p className="text-gray-600">
              Centro de alertas, recordatorios, mensajes y avisos
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-yellow-900 mb-1">
              Centro de Notificaciones
            </h3>
            <p className="text-yellow-800 text-sm">
              Las notificaciones aparecerán aquí una vez que el sistema esté operativo.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {notificationTypes.map((notification, index) => {
          const Icon = notification.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${notification.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-gray-600">
                    {notification.count}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {notification.title}
              </h3>
              
              <p className="text-gray-600 text-sm">
                {notification.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          No hay notificaciones
        </h3>
        <p className="text-gray-600">
          Las notificaciones aparecerán aquí cuando haya actividad en el sistema
        </p>
      </div>
    </div>
  )
}

export default Notificaciones
