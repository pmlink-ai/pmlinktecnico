import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Supabase - Credenciales reales del proyecto PMLink
const supabaseUrl = 'https://mwtdoidrjuahsejfctlm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGRvaWRyanVhaHNlamZjdGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU4OTk4NzcsImV4cCI6MjA0MTQ3NTg3N30.FYQSUsRhbYefypoM2o0rh5J-UD7w1o0n6qfgUBfLqSg';

// Storage adapter personalizado para React Native
const AsyncStorageAdapter = {
  getItem: (key) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    AsyncStorage.removeItem(key);
  },
};

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Función helper para verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== 'https://tu-proyecto.supabase.co' && 
         supabaseAnonKey !== 'tu-clave-anonima-aqui';
};

// Función para probar la conexión a Supabase
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error de conexión:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Conexión exitosa a Supabase');
    return { success: true, data };
  } catch (error) {
    console.error('Error de red:', error);
    return { success: false, error: 'Error de conexión de red' };
  }
};
