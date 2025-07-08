import React from 'react'
import { FileText, BarChart, TrendingUp, Download } from 'lucide-react'

const Reportes: React.FC = () => {
  const reportTypes = [
    {
      title: 'Estadísticas',
      description: 'Métricas y KPIs del sistema',
      icon: BarChart,
      color: 'bg-blue-500'
    },
    {
      title: 'Gráficos',
      description: 'Visualizaciones de datos',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Análisis',
      description: 'Reportes analíticos detallados',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: 'Exportar',
      description: 'Exportación de datos',
      icon: Download,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-500 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
            <p className="text-gray-600">
              Estadísticas, gráficos, análisis y exportación de datos
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-yellow-900 mb-1">
              Sección en Desarrollo
            </h3>
            <p className="text-yellow-800 text-sm">
              Los reportes estarán disponibles una vez que se complete la implementación de los datos maestros.
            </p>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-center space-y-4">
                <div className={`${report.color} p-4 rounded-lg mx-auto w-fit`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {report.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Reportes
