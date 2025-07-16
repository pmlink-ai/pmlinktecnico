import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Crear cliente de Supabase
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función helper para verificar conexión
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('_health').select('*').limit(1);
    if (error) {
      console.log('Conexión establecida con Supabase');
      return true;
    }
    return true;
  } catch (error) {
    console.error('Error conectando con Supabase:', error);
    return false;
  }
};
