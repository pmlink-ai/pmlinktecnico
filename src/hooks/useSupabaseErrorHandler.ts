// Hook personalizado para manejo de errores de Supabase
import { toast } from 'sonner'

export interface SupabaseError {
  message?: string
  code?: string
  details?: string
  hint?: string
}

export const useSupabaseErrorHandler = () => {
  const handleError = (error: unknown, operation: string = 'operación') => {
    console.error(`=== ERROR EN ${operation.toUpperCase()} ===`)
    console.error('Error object:', error)
    
    const supabaseError = error as SupabaseError
    
    console.error('Error message:', supabaseError?.message)
    console.error('Error code:', supabaseError?.code)
    console.error('Error details:', supabaseError?.details)
    console.error('Error hint:', supabaseError?.hint)
    
    // Mensaje de error más específico
    let errorMessage = 'Error desconocido'
    if (supabaseError?.message) {
      errorMessage = supabaseError.message
      
      // Mensajes más amigables para errores comunes
      if (supabaseError.message.includes('duplicate key')) {
        errorMessage = 'Ya existe un registro con esos datos'
      } else if (supabaseError.message.includes('foreign key')) {
        errorMessage = 'Error en la relación entre tablas'
      } else if (supabaseError.message.includes('null value')) {
        errorMessage = 'Faltan datos requeridos'
      } else if (supabaseError.message.includes('permission') || supabaseError.message.includes('denied')) {
        errorMessage = 'Sin permisos para realizar esta operación'
      } else if (supabaseError.message.includes('violates check constraint')) {
        errorMessage = 'Los datos no cumplen con las validaciones'
      } else if (supabaseError.message.includes('timeout')) {
        errorMessage = 'La operación tardó demasiado tiempo'
      } else if (supabaseError.message.includes('connection')) {
        errorMessage = 'Error de conexión con la base de datos'
      }
    }
    
    toast.error(`Error en ${operation}: ${errorMessage}`)
    return errorMessage
  }

  const logSuccess = (operation: string, data?: unknown) => {
    console.log(`=== ${operation.toUpperCase()} EXITOSA ===`)
    if (data) {
      console.log('Datos resultado:', data)
    }
  }

  return { handleError, logSuccess }
}
