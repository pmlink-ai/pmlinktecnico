// Test de conexión simplificado para Node.js
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - las mismas credenciales actualizadas
const supabaseUrl = 'https://mwtdoidrjuahsejfctlm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGRvaWRyanVhaHNlamZjdGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNDQsImV4cCI6MjA2NjEzMzM0NH0.QtKVhvZiY-ehpJlRMusUsjS6V7ZbyHtpMnvr60x9xEM';

// Crear cliente simplificado para Node.js
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test básico de conexión
async function testBasicConnection() {
  console.log('🔍 Probando conexión básica a Supabase...');
  
  try {
    // Probar con una consulta simple a la tabla de órdenes de trabajo
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error en consulta:', error.message);
      console.error('Código:', error.code);
      console.error('Detalles:', error.details);
      console.error('Hint:', error.hint);
      return false;
    }
    
    console.log('✅ Conexión exitosa! Cantidad de registros:', data);
    return true;
  } catch (networkError) {
    console.error('❌ Error de red:', networkError.message);
    console.error('Detalles completos:', networkError);
    return false;
  }
}

// Test de autenticación
async function testAuth() {
  console.log('🔍 Probando autenticación...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@pmlink.com',
      password: 'admin123456'
    });
    
    if (error) {
      console.error('❌ Error de autenticación:', error.message);
      console.error('Código de error:', error.status);
      console.error('Detalles:', error);
      return false;
    }
    
    console.log('✅ Autenticación exitosa!');
    console.log('Usuario:', data.user?.email);
    console.log('Token presente:', !!data.session?.access_token);
    
    // Cerrar sesión para limpiar
    await supabase.auth.signOut();
    return true;
  } catch (authError) {
    console.error('❌ Error en autenticación:', authError.message);
    return false;
  }
}

// Test de URL y conectividad básica
async function testURLReachability() {
  console.log('🔍 Probando alcance de URL...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    console.log('Status HTTP:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      console.log('✅ URL alcanzable');
      return true;
    } else {
      console.error('❌ URL no respondió correctamente');
      return false;
    }
  } catch (fetchError) {
    console.error('❌ Error de fetch:', fetchError.message);
    return false;
  }
}

// Test completo
async function runTests() {
  console.log('🚀 Iniciando pruebas de conexión...\n');
  console.log('URL de Supabase:', supabaseUrl);
  console.log('API Key (primeros 20 chars):', supabaseAnonKey.substring(0, 20) + '...\n');
  
  const urlTest = await testURLReachability();
  console.log('\n---\n');
  
  const basicTest = await testBasicConnection();
  console.log('\n---\n');
  
  const authTest = await testAuth();
  console.log('\n---\n');
  
  if (urlTest && basicTest && authTest) {
    console.log('🎉 Todos los tests pasaron! La configuración de Supabase es correcta.');
  } else {
    console.log('❌ Algunos tests fallaron. Revisar configuración.');
  }
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error ejecutando tests:', error);
});