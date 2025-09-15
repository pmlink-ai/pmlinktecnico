import { supabase, testConnection } from './lib/supabase.js';

// Test básico de conexión
async function testBasicConnection() {
  console.log('🔍 Probando conexión básica a Supabase...');
  
  try {
    // Probar con una consulta simple
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error en consulta:', error.message);
      console.error('Detalles del error:', error);
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
      email: 'superadmin@pmlink.co',
      password: 'superadmin123'
    });
    
    if (error) {
      console.error('❌ Error de autenticación:', error.message);
      console.error('Código de error:', error.status);
      return false;
    }
    
    console.log('✅ Autenticación exitosa!');
    console.log('Usuario:', data.user?.email);
    
    // Cerrar sesión para limpiar
    await supabase.auth.signOut();
    return true;
  } catch (authError) {
    console.error('❌ Error en autenticación:', authError.message);
    return false;
  }
}

// Test completo
async function runTests() {
  console.log('🚀 Iniciando pruebas de conexión...\n');
  
  const basicTest = await testBasicConnection();
  console.log('\n---\n');
  
  const authTest = await testAuth();
  console.log('\n---\n');
  
  if (basicTest && authTest) {
    console.log('🎉 Todos los tests pasaron! La conexión funciona correctamente.');
  } else {
    console.log('❌ Algunos tests fallaron. Revisar configuración.');
  }
}

// Ejecutar tests
runTests().catch(error => {
  console.error('❌ Error ejecutando tests:', error);
});