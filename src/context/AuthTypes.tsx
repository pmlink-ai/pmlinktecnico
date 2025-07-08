import { createContext } from 'react'

export interface AuthUser {
  usuario_id: string
  email: string
  nombres: string
  apellidos: string
  rol: string
}

export interface AuthContextType {
  user: AuthUser | null
  userRole: string | null
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ user: AuthUser | null; error: Error | null }>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
