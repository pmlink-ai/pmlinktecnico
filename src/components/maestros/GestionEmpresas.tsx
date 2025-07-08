import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Building, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Empresa } from '../../lib/supabase'
import { toast } from 'sonner'

const GestionEmpresas: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    direccion: '',
    ciudad: '',
    pais: '',
    telefono_contacto: '',
    email_contacto: '',
    activo: true
  })

  useEffect(() => {
    fetchEmpresas()
  }, [])

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .order('fecha_registro', { ascending: false })

      if (error) throw error
      setEmpresas(data || [])
    } catch (error) {
      console.error('Error fetching empresas:', error)
      toast.error('Error al cargar las empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingEmpresa) {
        const { error } = await supabase
          .from('empresa')
          .update(formData)
          .eq('empresa_id', editingEmpresa.empresa_id)

        if (error) throw error
        toast.success('Empresa actualizada correctamente')
      } else {
        const { error } = await supabase
          .from('empresa')
          .insert([{
            ...formData,
            fecha_registro: new Date().toISOString()
          }])

        if (error) throw error
        toast.success('Empresa creada correctamente')
      }

      fetchEmpresas()
      resetForm()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving empresa:', error)
      toast.error('Error al guardar la empresa')
    }
  }

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setFormData({
      nombre_empresa: empresa.nombre_empresa || '',
      direccion: empresa.direccion || '',
      ciudad: empresa.ciudad || '',
      pais: empresa.pais || '',
      telefono_contacto: empresa.telefono_contacto || '',
      email_contacto: empresa.email_contacto || '',
      activo: empresa.activo ?? true
    })
    setShowModal(true)
  }

  const handleToggleActive = async (empresa: Empresa) => {
    try {
      const { error } = await supabase
        .from('empresa')
        .update({ activo: !empresa.activo })
        .eq('empresa_id', empresa.empresa_id)

      if (error) throw error
      
      toast.success(`Empresa ${!empresa.activo ? 'activada' : 'desactivada'} correctamente`)
      fetchEmpresas()
    } catch (error) {
      console.error('Error toggling empresa status:', error)
      toast.error('Error al cambiar el estado de la empresa')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre_empresa: '',
      direccion: '',
      ciudad: '',
      pais: '',
      telefono_contacto: '',
      email_contacto: '',
      activo: true
    })
    setEditingEmpresa(null)
  }

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombre_empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.email_contacto?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Empresas</h1>
              <p className="text-gray-600">Administrar empresas cliente del sistema</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nueva Empresa</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            Total: {filteredEmpresas.length} empresa(s)
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmpresas.map((empresa) => (
                <tr key={empresa.empresa_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {empresa.nombre_empresa}
                      </div>
                      <div className="text-sm text-gray-500">
                        {empresa.direccion}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{empresa.ciudad}</div>
                    <div className="text-sm text-gray-500">{empresa.pais}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{empresa.email_contacto}</div>
                    <div className="text-sm text-gray-500">{empresa.telefono_contacto}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      empresa.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {empresa.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(empresa)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(empresa)}
                      className={`${
                        empresa.activo 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {empresa.activo ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmpresas.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No hay empresas registradas
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando tu primera empresa al sistema
            </p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="btn-primary"
            >
              Agregar Primera Empresa
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_empresa}
                  onChange={(e) => setFormData({ ...formData, nombre_empresa: e.target.value })}
                  className="input-field"
                  placeholder="Ingrese el nombre de la empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="input-field"
                  placeholder="Ingrese la dirección"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="input-field"
                    placeholder="Ciudad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    className="input-field"
                    placeholder="País"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={formData.telefono_contacto}
                  onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                  className="input-field"
                  placeholder="Teléfono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.email_contacto}
                  onChange={(e) => setFormData({ ...formData, email_contacto: e.target.value })}
                  className="input-field"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                  Empresa activa
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingEmpresa ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionEmpresas
