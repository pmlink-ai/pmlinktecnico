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
    supabaseUrl: 'https://mwtdoidrjuahsejfctlm.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGRvaWRyanVhaHNlamZjdGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNDQsImV4cCI6MjA2NjEzMzM0NH0.QtKVhvZiY-ehpJlRMusUsjS6V7ZbyHtpMnvr60x9xEM',
    label: 'PRODUCCIÓN',
  },
};

export const currentEnv = ENV[ACTIVE_ENV];
export const isProduction = ACTIVE_ENV === 'production';

console.log(`🌍 Ambiente activo: ${currentEnv.label}`);
