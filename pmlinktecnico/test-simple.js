// Test de conexión a Supabase simple - Solo Node.js
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://mwtdoidrjuahsejfctlm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGRvaWRyanVhaHNlamZjdGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNDQsImV4cCI6MjA2NjEzMzM0NH0.QtKVhvZiY-ehpJlRMusUsjS6V7ZbyHtpMnvr60x9xEM';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseAccess() {
  console.log('🔄 Probando acceso a Supabase...');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Probar con una consulta muy simple
    console.log('1️⃣ Test de conexión básica...');
    
    // Intentar hacer una consulta básica
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('🔍 Código de error:', error.code);
      console.log('🔍 Detalles:', error.details);
      
      // Intentar una consulta aún más básica
      console.log('\n🔄 Intentando consulta alternativa...');
      const { data: pingData, error: pingError } = await supabase
        .from('pg_stat_user_tables')
        .select('relname')
        .limit(1);
        
      if (pingError) {
        console.log('❌ También falla consulta alternativa:', pingError.message);
        return false;
      } else {
        console.log('✅ Consulta alternativa exitosa');
      }
    } else {
      console.log('✅ Conexión exitosa');
      console.log('📋 Tablas encontradas:', data?.length || 0);
      if (data && data.length > 0) {
        data.forEach(table => console.log(`   - ${table.table_name}`));
      }
    }

    // Test 2: Probar permisos básicos
    console.log('\n2️⃣ Probando permisos...');
    
    // Intentar una función RPC simple si existe
    try {
      const { data: versionData, error: versionError } = await supabase.rpc('version');
      if (versionError) {
        console.log('❌ RPC no disponible:', versionError.message);
      } else {
        console.log('✅ RPC disponible');
      }
    } catch (rpcErr) {
      console.log('⚠️  RPC no funciona:', rpcErr.message);
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
    return false;
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DEL ACCESO:');
  console.log('🔑 Tipo de key: ANON (permisos limitados)');
  console.log('✅ Conexión: SÍ');
  console.log('✅ Lectura básica: Depende de las tablas existentes');
  console.log('❌ Crear tablas: NO (requiere service role key)');
  console.log('\n💡 OPCIONES PARA CREAR TABLAS:');
  console.log('1. Dashboard web de Supabase (RECOMENDADO)');
  console.log('   https://supabase.com/dashboard/project/mwtdoidrjuahsejfctlm');
  console.log('2. Obtener service role key para operaciones administrativas');
  console.log('3. Configurar RLS y permisos específicos');
  
  return true;
}

testSupabaseAccess().catch(console.error);
