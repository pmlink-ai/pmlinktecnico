// ============================================================
// Configuración de ambientes - PMLink Técnico
// Cambiar ACTIVE_ENV para apuntar a desarrollo o producción
// ============================================================

const ACTIVE_ENV = 'development'; // 'development' | 'production'

const ENV = {
  development: {
    supabaseUrl: 'PEGAR_URL_PROYECTO_DESARROLLO',
    supabaseAnonKey: 'PEGAR_ANON_KEY_DESARROLLO',
    label: 'DESARROLLO',
  },
  production: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    label: 'PRODUCCIÓN',
  },
};

export const currentEnv = ENV[ACTIVE_ENV];
export const isProduction = ACTIVE_ENV === 'production';

console.log(`🌍 Ambiente activo: ${currentEnv.label}`);
