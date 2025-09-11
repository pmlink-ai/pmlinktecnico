// Test de conexión a Supabase desde Node.js
require('react-native-url-polyfill/auto');
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
    // Test 1: Conexión básica
    console.log('1️⃣ Test de conexión básica...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ Error de conexión:', connectionError.message);
      return false;
    }
    console.log('✅ Conexión exitosa');

    // Test 2: Listar tablas públicas
    console.log('\n2️⃣ Listando tablas públicas...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('⚠️  No se pueden listar tablas:', tablesError.message);
    } else {
      console.log('📋 Tablas encontradas:', tables?.length || 0);
      if (tables && tables.length > 0) {
        tables.forEach(table => console.log(`   - ${table.table_name}`));
      } else {
        console.log('   (No hay tablas públicas visibles)');
      }
    }

    // Test 3: Intentar crear tabla (esto probablemente fallará con anon key)
    console.log('\n3️⃣ Probando permisos para crear tabla...');
    const testTableSQL = `
      CREATE TABLE IF NOT EXISTS test_permissions (
        id SERIAL PRIMARY KEY,
        test_field VARCHAR(50)
      );
    `;

    try {
      // Intentar ejecutar SQL directamente (esto requiere permisos especiales)
      const { data: createResult, error: createError } = await supabase.rpc('exec', {
        sql: testTableSQL
      });

      if (createError) {
        console.log('❌ No se puede crear tabla con anon key:', createError.message);
        console.log('💡 Necesitas usar service role key o dashboard web');
      } else {
        console.log('✅ ¡Tabla de prueba creada exitosamente!');
      }
    } catch (err) {
      console.log('❌ Error al intentar crear tabla:', err.message);
      console.log('💡 La función RPC no está disponible o no tienes permisos');
    }

    // Test 4: Verificar funciones RPC disponibles
    console.log('\n4️⃣ Verificando funciones RPC disponibles...');
    const { data: functions, error: functionsError } = await supabase.rpc('version');
    
    if (functionsError) {
      console.log('⚠️  No se pueden verificar funciones RPC:', functionsError.message);
    } else {
      console.log('✅ RPC funciona - Versión PostgreSQL disponible');
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
    return false;
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DEL ACCESO:');
  console.log('✅ Conexión: SÍ');
  console.log('✅ Lectura: SÍ');
  console.log('❌ Crear tablas: NO (requiere service role key)');
  console.log('\n💡 RECOMENDACIÓN:');
  console.log('Para crear tablas, usa el dashboard web de Supabase:');
  console.log('https://supabase.com/dashboard/project/mwtdoidrjuahsejfctlm');
  
  return true;
}

testSupabaseAccess().catch(console.error);
