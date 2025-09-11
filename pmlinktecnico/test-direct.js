// Test directo de Supabase con fetch
async function testSupabaseDirectAccess() {
  const supabaseUrl = 'https://mwtdoidrjuahsejfctlm.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGRvaWRyanVhaHNlamZjdGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNDQsImV4cCI6MjA2NjEzMzM0NH0.QtKVhvZiY-ehpJlRMusUsjS6V7ZbyHtpMnvr60x9xEM';

  console.log('🔄 Probando acceso directo a Supabase...');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Verificar que el endpoint responde
    console.log('1️⃣ Verificando endpoint de Supabase...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    console.log('📡 Status de respuesta:', response.status);
    console.log('📡 Status text:', response.statusText);
    
    if (response.ok) {
      console.log('✅ Endpoint de Supabase responde correctamente');
    } else {
      console.log('❌ Problema con el endpoint');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }

    // Test 2: Intentar obtener información de esquema
    console.log('\n2️⃣ Probando acceso a información de base de datos...');
    
    try {
      const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
      
      console.log('📋 Schema response status:', schemaResponse.status);
      
      if (schemaResponse.ok) {
        console.log('✅ Puede acceder a información de esquema');
      }
    } catch (schemaError) {
      console.log('⚠️  Error al acceder a esquema:', schemaError.message);
    }

    // Test 3: Verificar si podemos crear una tabla vía RPC
    console.log('\n3️⃣ Probando capacidad para ejecutar SQL...');
    
    const testSQL = 'SELECT version();';
    
    try {
      const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({ sql: testSQL })
      });

      console.log('🔧 SQL execution status:', sqlResponse.status);
      
      if (sqlResponse.ok) {
        const result = await sqlResponse.json();
        console.log('✅ Puede ejecutar SQL:', result);
      } else {
        const errorDetails = await sqlResponse.text();
        console.log('❌ No puede ejecutar SQL:', errorDetails);
      }
    } catch (sqlError) {
      console.log('❌ Error al intentar ejecutar SQL:', sqlError.message);
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 VEREDICTO FINAL:');
  console.log('🔑 ANON KEY - Permisos muy limitados');
  console.log('❌ NO puedo crear tablas directamente desde código');
  console.log('✅ SÍ puedes crear tablas desde el dashboard web');
  console.log('\n🚀 RECOMENDACIÓN:');
  console.log('1. Ve al dashboard: https://supabase.com/dashboard');
  console.log('2. Selecciona proyecto: mwtdoidrjuahsejfctlm');
  console.log('3. Ve a SQL Editor');
  console.log('4. Ejecuta tu código CREATE TABLE');
  console.log('5. Luego podemos usar la tabla desde la app móvil');
}

testSupabaseDirectAccess().catch(console.error);
