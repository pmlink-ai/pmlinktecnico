import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './AuthTypes'
import type { AuthUser } from './AuthTypes'

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión guardada en localStorage
    const savedUser = localStorage.getItem('pmlink_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setUserRole(parsedUser.rol)
        setIsAdmin(parsedUser.rol === 'Administrador PM-Link' || parsedUser.rol === 'Administrador Empresa')
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('pmlink_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Buscar usuario en la tabla usuario con JOIN al rol
      const { data, error } = await supabase
        .from('usuario')
        .select(`
          usuario_id,
          nombres,
          apellidos,
          email,
          activo,
          rol:rol!inner(nombre_rol)
        `)
        .eq('email', email)
        .eq('activo', true)
        .single()

      if (error || !data) {
        return {
          user: null,
          error: new Error('Usuario no encontrado o inactivo')
        }
      }

      // Por simplicidad, validamos que el password sea "admin123456"
      // En producción, aquí harías hash del password y lo compararías
      if (password !== 'admin123456') {
        return {
          user: null,
          error: new Error('Contraseña incorrecta')
        }
      }

      // Crear objeto de usuario
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roleName = (data.rol as any)?.nombre_rol || ''
      const authUser: AuthUser = {
        usuario_id: data.usuario_id,
        email: data.email,
        nombres: data.nombres,
        apellidos: data.apellidos,
        rol: roleName
      }

      // Guardar usuario en estado y localStorage
      setUser(authUser)
      setUserRole(roleName)
      setIsAdmin(roleName === 'Administrador PM-Link' || roleName === 'Administrador Empresa')
      localStorage.setItem('pmlink_user', JSON.stringify(authUser))

      // Actualizar fecha de último acceso
      await supabase
        .from('usuario')
        .update({ fecha_ultimo_acceso: new Date().toISOString() })
        .eq('usuario_id', data.usuario_id)

      return { user: authUser, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Error desconocido')
      }
    }
  }

  const logout = async () => {
    setUser(null)
    setUserRole(null)
    setIsAdmin(false)
    localStorage.removeItem('pmlink_user')
  }

  const value = {
    user,
    userRole,
    isAdmin,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
