// Script de prueba para verificar la conexión a Supabase
import { supabase, testConnection, isSupabaseConfigured } from './lib/supabase.js';

export const runSupabaseTests = async () => {
  console.log('🔍 Iniciando pruebas de Supabase...');
  
  // 1. Verificar configuración
  console.log('1. Verificando configuración...');
  const isConfigured = isSupabaseConfigured();
  console.log(`   ✅ Configurado: ${isConfigured}`);
  
  if (!isConfigured) {
    console.log('❌ Supabase no está configurado correctamente');
    return { success: false, error: 'Configuración incompleta' };
  }
  
  // 2. Probar conexión
  console.log('2. Probando conexión...');
  const connectionResult = await testConnection();
  console.log(`   ${connectionResult.success ? '✅' : '❌'} Conexión: ${connectionResult.success ? 'exitosa' : connectionResult.error}`);
  
  // 3. Probar consulta básica
  console.log('3. Probando consulta básica...');
  try {
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ Error en consulta: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    console.log(`   ✅ Consulta exitosa. Datos encontrados: ${data ? data.length : 0} registros`);
    
  } catch (error) {
    console.log(`   ❌ Error de red: ${error.message}`);
    return { success: false, error: error.message };
  }
  
  // 4. Probar autenticación
  console.log('4. Verificando estado de autenticación...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`   ⚠️ Error de autenticación: ${error.message}`);
    } else {
      console.log(`   ✅ Estado de sesión: ${session ? 'Autenticado' : 'No autenticado'}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error verificando autenticación: ${error.message}`);
  }
  
  console.log('🎉 Pruebas de Supabase completadas exitosamente');
  return { success: true };
};

// Función para mostrar información de debug
export const showSupabaseInfo = () => {
  console.log('📊 Información de Supabase:');
  console.log('   URL:', 'https://mwtdoidrjuahsejfctlm.supabase.co');
  console.log('   Proyecto ID:', 'mwtdoidrjuahsejfctlm');
  console.log('   Configurado:', isSupabaseConfigured());
  console.log('   Tipo de cliente:', 'Expo React Native');
};