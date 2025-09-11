import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Configuración de Supabase desde app.json
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Storage adapter para Expo
const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key, value) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Crear cliente de Supabase para móvil
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Función para probar la conexión
export async function testConnection() {
  try {
    console.log('🔄 Probando conexión a Supabase...');
    
    // Hacer una consulta simple para probar la conexión
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Conexión exitosa a Supabase');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    return { success: false, error: err.message };
  }
}

// Función para listar tablas existentes
export async function listTables() {
  try {
    console.log('🔄 Obteniendo lista de tablas...');
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      console.error('❌ Error al obtener tablas:', error.message);
      return { success: false, error: error.message };
    }

    console.log('📋 Tablas encontradas:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    return { success: false, error: err.message };
  }
}

// Función para ejecutar SQL personalizado (limitado con anon key)
export async function executeSQL(tableName, operation, data = null) {
  try {
    console.log(`🔄 Ejecutando ${operation} en tabla ${tableName}...`);
    
    let result;
    
    switch (operation) {
      case 'SELECT':
        result = await supabase.from(tableName).select('*');
        break;
      case 'INSERT':
        result = await supabase.from(tableName).insert(data);
        break;
      case 'UPDATE':
        result = await supabase.from(tableName).update(data.values).eq('id', data.id);
        break;
      case 'DELETE':
        result = await supabase.from(tableName).delete().eq('id', data.id);
        break;
      default:
        throw new Error(`Operación ${operation} no soportada`);
    }

    if (result.error) {
      console.error('❌ Error en la operación:', result.error.message);
      return { success: false, error: result.error.message };
    }

    console.log('✅ Operación ejecutada exitosamente');
    return { success: true, data: result.data };
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    return { success: false, error: err.message };
  }
}
