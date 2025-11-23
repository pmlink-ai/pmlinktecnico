// Script de prueba para verificar Storage de Supabase
import { supabase } from '../lib/supabase.js';

export const testStorageConnection = async () => {
  try {
    console.log('🧪 Iniciando pruebas de Storage...');

    // 1. Verificar que podemos conectar a Supabase
    const { data: user, error: authError } = await supabase.auth.getUser();
    console.log('👤 Estado de autenticación:', { user: user?.user?.email || 'No autenticado', error: authError });

    // 2. Listar buckets disponibles
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('🪣 Buckets disponibles:', { buckets, error: bucketsError });

    // 3. Verificar bucket documentos-ordenes
    const { data: bucketExists, error: bucketError } = await supabase.storage
      .from('documentos-ordenes')
      .list('', { limit: 1 });
    console.log('📁 Bucket documentos-ordenes:', { exists: !bucketError, error: bucketError });

    // 4. Probar subida de archivo de prueba
    const testData = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]); // "PDF-1.4" en bytes
    const testFileName = `test-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos-ordenes')
      .upload(testFileName, testData, {
        contentType: 'application/pdf'
      });

    console.log('📤 Prueba de subida:', { 
      success: !uploadError, 
      data: uploadData, 
      error: uploadError 
    });

    // 5. Si la subida fue exitosa, eliminar el archivo de prueba
    if (!uploadError) {
      const { error: deleteError } = await supabase.storage
        .from('documentos-ordenes')
        .remove([testFileName]);
      console.log('🗑️ Limpieza de archivo de prueba:', { success: !deleteError, error: deleteError });
    }

    return {
      success: !uploadError,
      authStatus: !authError,
      bucketExists: !bucketError,
      error: uploadError || authError || bucketError
    };

  } catch (error) {
    console.error('💥 Error en pruebas de Storage:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para verificar políticas RLS
export const checkStoragePolicies = async () => {
  try {
    const { data, error } = await supabase
      .rpc('check_storage_policies', { bucket_name: 'documentos-ordenes' });
    
    console.log('🔒 Políticas de Storage:', { data, error });
    return { data, error };
  } catch (error) {
    console.log('⚠️ No se pueden verificar políticas RLS directamente desde el cliente');
    return { error: 'Cliente no puede verificar políticas RLS' };
  }
};