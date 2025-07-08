import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const LocalTableDiagnostic: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    setDiagnosticResults('')
    
    let results = '=== DIAGNÓSTICO DE TABLA LOCAL ===\n\n'
    
    try {
      // 1. Verificar conexión con Supabase
      results += '1. Verificando conexión con Supabase...\n'
      const { error: testError } = await supabase
        .from('empresa')
        .select('count')
        .limit(1)
      
      if (testError) {
        results += `   ❌ Error de conexión: ${testError.message}\n\n`
      } else {
        results += '   ✅ Conexión exitosa\n\n'
      }

      // 2. Verificar tabla empresa
      results += '2. Verificando tabla empresa...\n'
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresa')
        .select('empresa_id, nombre_empresa, activo')
        .eq('activo', true)
      
      if (empresasError) {
        results += `   ❌ Error al acceder a empresas: ${empresasError.message}\n\n`
      } else {
        results += `   ✅ Encontradas ${empresasData?.length || 0} empresas activas\n`
        if (empresasData && empresasData.length > 0) {
          results += `   📋 Primera empresa: ${empresasData[0].nombre_empresa} (ID: ${empresasData[0].empresa_id})\n\n`
        }
      }

      // 3. Verificar tabla local
      results += '3. Verificando tabla local...\n'
      const { data: localesData, error: localesError } = await supabase
        .from('local')
        .select('*')
        .limit(5)
      
      if (localesError) {
        results += `   ❌ Error al acceder a locales: ${localesError.message}\n`
        results += `   📝 Código: ${localesError.code}\n`
        results += `   📝 Detalles: ${localesError.details}\n\n`
      } else {
        results += `   ✅ Tabla local accesible, ${localesData?.length || 0} registros encontrados\n\n`
      }

      // 4. Intentar inserción de prueba (sin commitear)
      results += '4. Probando inserción en tabla local...\n'
      if (empresasData && empresasData.length > 0) {
        const testLocalData = {
          empresa_id: empresasData[0].empresa_id,
          nombre_local: `Test Local ${Date.now()}`,
          direccion: 'Dirección de prueba',
          ciudad: 'Ciudad de prueba',
          pais: 'País de prueba',
          activo: true,
          fecha_creacion: new Date().toISOString()
        }
        
        results += `   📝 Datos de prueba: ${JSON.stringify(testLocalData, null, 2)}\n`
        
        const { data: insertData, error: insertError } = await supabase
          .from('local')
          .insert([testLocalData])
          .select()
        
        if (insertError) {
          results += `   ❌ Error en inserción: ${insertError.message}\n`
          results += `   📝 Código: ${insertError.code}\n`
          results += `   📝 Detalles: ${insertError.details}\n`
          results += `   📝 Hint: ${insertError.hint}\n\n`
        } else {
          results += '   ✅ Inserción exitosa\n'
          results += `   📋 Local creado con ID: ${insertData?.[0]?.local_id}\n\n`
          
          // Eliminar el registro de prueba
          if (insertData?.[0]?.local_id) {
            await supabase
              .from('local')
              .delete()
              .eq('local_id', insertData[0].local_id)
            results += '   🗑️ Registro de prueba eliminado\n\n'
          }
        }
      } else {
        results += '   ⚠️ No se puede probar inserción sin empresas activas\n\n'
      }

      results += '=== DIAGNÓSTICO COMPLETADO ===\n'
      
    } catch (error) {
      results += `\n❌ Error general: ${error}\n`
    }
    
    setDiagnosticResults(results)
    setIsRunning(false)
    toast.success('Diagnóstico completado')
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Diagnóstico de Tabla Local</h3>
      
      <button
        onClick={runDiagnostic}
        disabled={isRunning}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isRunning ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
      </button>
      
      {diagnosticResults && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Resultados:</h4>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
            {diagnosticResults}
          </pre>
        </div>
      )}
    </div>
  )
}

export default LocalTableDiagnostic
