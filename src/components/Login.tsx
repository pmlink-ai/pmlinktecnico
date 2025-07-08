import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Por favor, ingresa email y contraseña')
      return
    }

    setLoading(true)
    try {
      // Consulta directa a la tabla usuario con JOIN al rol
      const { data, error } = await supabase
        .from('usuario')
        .select(`
          usuario_id,
          nombres,
          apellidos,
          email,
          activo,
          password,
          rol:rol!inner(nombre_rol)
        `)
        .eq('email', email)
        .eq('activo', true)
        .single()

      if (error || !data) {
        toast.error('Usuario no encontrado o inactivo')
        return
      }

      // Validar contraseña
      if (password !== data.password) {
        toast.error('Contraseña incorrecta')
        return
      }

      // Login exitoso - guardar información del usuario
      const userInfo = {
        usuario_id: data.usuario_id,
        email: data.email,
        nombres: data.nombres,
        apellidos: data.apellidos,
        rol: (data.rol as any)?.nombre_rol || ''
      }

      // Guardar en localStorage para mantener la sesión
      localStorage.setItem('pmlink_user', JSON.stringify(userInfo))

      // Actualizar fecha de último acceso
      await supabase
        .from('usuario')
        .update({ fecha_ultimo_acceso: new Date().toISOString() })
        .eq('usuario_id', data.usuario_id)

      toast.success('Inicio de sesión exitoso')
      navigate('/dashboard')

    } catch (error) {
      console.error('Error en login:', error)
      toast.error('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mb-4">
            <img 
              src="/pmlinkadmin/logo.png" 
              alt="PM Link Logo" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-white text-2xl font-bold">PM</span>';
                }
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">PM Link Admin</h1>
          <p className="text-gray-600">Sistema de Gestión de Mantenimiento</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ¿Problemas para acceder?{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
              Contacta al administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
