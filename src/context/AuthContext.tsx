import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  userRole: string | null
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select(`
          rol_id,
          activo,
          rol:rol!inner(nombre_rol)
        `)
        .eq('usuario_id', userId)
        .eq('activo', true)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return
      }

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roleName = (data.rol as any)?.nombre_rol || ''
        setUserRole(roleName)
        setIsAdmin(roleName === 'Administrador PM-Link' || roleName === 'Administrador Empresa')
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error)
    }
  }

  useEffect(() => {
    // Verificar si Supabase está configurado correctamente
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://demo.supabase.co' || supabaseKey === 'demo-key-123') {
      console.warn('Supabase not properly configured. Running in demo mode.')
      setLoading(false)
      return
    }
    
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      }
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id)
      }
      setLoading(false)
    }).catch((error) => {
      console.error('Error in getSession:', error)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Primero verificar si el usuario existe y está activo
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('*')
        .eq('email', email)
        .eq('activo', true)
        .single()

      if (userError || !userData) {
        return {
          user: null,
          error: new Error('Usuario no encontrado o inactivo')
        }
      }

      // Intentar login con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, error }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Error desconocido')
      }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    setIsAdmin(false)
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
