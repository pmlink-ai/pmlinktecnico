import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL and/or anon key missing. Please add them to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para las tablas de la base de datos
export interface Empresa {
  empresa_id: string
  nombre_empresa: string | null
  direccion: string | null
  ciudad: string | null
  pais: string | null
  telefono_contacto: string | null
  email_contacto: string | null
  activo: boolean | null
  fecha_registro: string | null
}

export interface Local {
  local_id: string
  empresa_id: string
  nombre_local: string
  direccion?: string | null
  ciudad?: string | null
  telefono?: string | null
  email?: string | null
  activo: boolean
  fecha_creacion: string
}

export interface Equipo {
  equipo_id: string
  local_id: string
  nombre_equipo: string
  codigo_equipo: string | null
  descripcion: string | null
  marca: string | null
  modelo: string | null
  numero_serie: string | null
  fecha_adquisicion: string | null
  vida_util_estimada: number | null
  estado_operacional: string
  ubicacion_especifica: string | null
  ultimo_mantenimiento: string | null
  proximo_mantenimiento_programado: string | null
  activo: boolean
}

export interface Rol {
  rol_id: number
  nombre_rol: string
  descripcion: string | null
}

export interface Usuario {
  usuario_id: string
  empresa_id: string | null
  rol_id: number
  nombre: string
  apellido: string
  email: string
  password_hash: string
  telefono: string | null
  fecha_registro: string
  ultima_conexion: string | null
  activo: boolean
}

export interface TipoMantenimiento {
  tipo_mantenimiento_id: number
  nombre_tipo: string
  descripcion: string | null
}
