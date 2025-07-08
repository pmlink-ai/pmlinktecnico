import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, MapPin, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Local, Empresa } from '../../lib/supabase'
import { toast } from 'sonner'

const GestionLocales: React.FC = () => {
  const [locales, setLocales] = useState<(Local & { empresa?: Empresa })[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingLocal, setEditingLocal] = useState<Local | null>(null)
  const [formData, setFormData] = useState({
    empresa_id: '',
    nombre_local: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    email: '',
    activo: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch locales with empresa information
      const { data: localesData, error: localesError } = await supabase
        .from('local')
        .select(`
          *,
          empresa:empresa!inner(*)
        `)
        .order('fecha_creacion', { ascending: false })

      if (localesError) throw localesError

      // Fetch active empresas for form
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresa')
        .select('*')
        .eq('activo', true)
        .order('nombre_empresa')

      if (empresasError) throw empresasError

      setLocales(localesData || [])
      setEmpresas(empresasData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones del lado del cliente
    if (!formData.empresa_id) {
      toast.error('Debe seleccionar una empresa')
      return
    }
    
    if (!formData.nombre_local.trim()) {
      toast.error('El nombre del local es requerido')
      return
    }
    
    try {
      if (editingLocal) {
        const { error } = await supabase
          .from('local')
          .update(formData)
          .eq('local_id', editingLocal.local_id)

        if (error) throw error
        toast.success('Local actualizado correctamente')
      } else {
        // Preparar datos para inserción
        const insertData = {
          empresa_id: formData.empresa_id,
          nombre_local: formData.nombre_local.trim(),
          direccion: formData.direccion?.trim() || null,
          ciudad: formData.ciudad?.trim() || null,
          telefono: formData.telefono?.trim() || null,
          email: formData.email?.trim() || null,
          activo: formData.activo,
          fecha_creacion: new Date().toISOString()
        }
        
        const { error } = await supabase
          .from('local')
          .insert([insertData])

        if (error) throw error
        toast.success('Local creado correctamente')
      }

      fetchData()
      resetForm()
      setShowModal(false)
    } catch (error: unknown) {
      console.error('Error al guardar local:', error)
      
      const supabaseError = error as { 
        message?: string; 
        code?: string; 
        details?: string; 
        hint?: string; 
      }
      
      // Mensaje de error más específico
      let errorMessage = 'Error desconocido'
      if (supabaseError?.message) {
        errorMessage = supabaseError.message
        
        // Mensajes más amigables para errores comunes
        if (supabaseError.message.includes('duplicate key')) {
          errorMessage = 'Ya existe un local con esos datos'
        } else if (supabaseError.message.includes('foreign key')) {
          errorMessage = 'Error en la relación con la empresa'
        } else if (supabaseError.message.includes('null value')) {
          errorMessage = 'Faltan datos requeridos'
        } else if (supabaseError.message.includes('permission')) {
          errorMessage = 'Sin permisos para realizar esta operación'
        }
      }
      
      toast.error(`Error al guardar el local: ${errorMessage}`)
    }
  }

  const handleEdit = (local: Local) => {
    setEditingLocal(local)
    setFormData({
      empresa_id: local.empresa_id,
      nombre_local: local.nombre_local,
      direccion: local.direccion || '',
      ciudad: local.ciudad || '',
      telefono: local.telefono || '',
      email: local.email || '',
      activo: local.activo
    })
    setShowModal(true)
  }

  const handleToggleActive = async (local: Local) => {
    try {
      const { error } = await supabase
        .from('local')
        .update({ activo: !local.activo })
        .eq('local_id', local.local_id)

      if (error) throw error
      
      toast.success(`Local ${!local.activo ? 'activado' : 'desactivado'} correctamente`)
      fetchData()
    } catch (error) {
      console.error('Error toggling local status:', error)
      toast.error('Error al cambiar el estado del local')
    }
  }

  const resetForm = () => {
    setFormData({
      empresa_id: '',
      nombre_local: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      activo: true
    })
    setEditingLocal(null)
  }

  const filteredLocales = locales.filter(local =>
    local.nombre_local?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    local.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    local.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    local.empresa?.nombre_empresa?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="bg-green-500 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Locales</h1>
              <p className="text-gray-600">Administrar sedes y ubicaciones de las empresas</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
            disabled={empresas.length === 0}
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Local</span>
          </button>
        </div>
      </div>

      {/* Alert if no empresas */}
      {empresas.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            No hay empresas activas. Debe crear al menos una empresa antes de agregar locales.
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar locales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            Total: {filteredLocales.length} local(es)
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
                  Local
                </th>
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
              {filteredLocales.map((local) => (
                <tr key={local.local_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {local.nombre_local}
                      </div>
                      <div className="text-sm text-gray-500">
                        {local.direccion}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {local.empresa?.nombre_empresa}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{local.ciudad}</div>
                    <div className="text-sm text-gray-500">{local.direccion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{local.email}</div>
                    <div className="text-sm text-gray-500">{local.telefono}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      local.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {local.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(local)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(local)}
                      className={`${
                        local.activo 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {local.activo ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLocales.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No hay locales registrados
            </h3>
            <p className="text-gray-600 mb-4">
              {empresas.length === 0 
                ? 'Primero debe crear empresas antes de agregar locales'
                : 'Comienza agregando el primer local al sistema'
              }
            </p>
            {empresas.length > 0 && (
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
                className="btn-primary"
              >
                Agregar Primer Local
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingLocal ? 'Editar Local' : 'Nuevo Local'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa *
                </label>
                <select
                  required
                  value={formData.empresa_id}
                  onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.empresa_id} value={empresa.empresa_id}>
                      {empresa.nombre_empresa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Local *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_local}
                  onChange={(e) => setFormData({ ...formData, nombre_local: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Planta Principal, Sucursal Norte"
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
                  placeholder="Dirección específica del local"
                />
              </div>

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
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="input-field"
                  placeholder="Teléfono del local"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="email@local.com"
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
                  Local activo
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingLocal ? 'Actualizar' : 'Crear'}
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

export default GestionLocales
