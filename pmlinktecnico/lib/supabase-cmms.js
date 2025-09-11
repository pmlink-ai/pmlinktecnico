// Configuración y funciones de Supabase para CMMS móvil
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

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ================================
// FUNCIONES PARA ÓRDENES DE TRABAJO
// ================================

export async function getOrdenesTrabajo() {
  try {
    const { data, error } = await supabase
      .from('orden_trabajo')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return { success: false, error: error.message };
  }
}

export async function getOrdenTrabajo(id) {
  try {
    const { data, error } = await supabase
      .from('orden_trabajo')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener orden:', error);
    return { success: false, error: error.message };
  }
}

// ================================
// FUNCIONES PARA INFORME ANSUL R102
// ================================

export async function createInformeAnsulR102(datos) {
  try {
    const { data, error } = await supabase
      .from('informe_ansul_r102')
      .insert([datos])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al crear informe Ansul:', error);
    return { success: false, error: error.message };
  }
}

export async function updateInformeAnsulR102(id, datos) {
  try {
    const { data, error } = await supabase
      .from('informe_ansul_r102')
      .update(datos)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar informe Ansul:', error);
    return { success: false, error: error.message };
  }
}

export async function getInformeAnsulR102(ordenTrabajoId) {
  try {
    const { data, error } = await supabase
      .from('informe_ansul_r102')
      .select('*')
      .eq('orden_trabajo_id', ordenTrabajoId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener informe Ansul:', error);
    return { success: false, error: error.message };
  }
}

// ================================
// FUNCIONES PARA INFORME ELECTROMECÁNICO
// ================================

export async function createInformeElectromecanico(datos) {
  try {
    const { data, error } = await supabase
      .from('informe_electromecanico')
      .insert([datos])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al crear informe electromecánico:', error);
    return { success: false, error: error.message };
  }
}

export async function updateInformeElectromecanico(id, datos) {
  try {
    const { data, error } = await supabase
      .from('informe_electromecanico')
      .update(datos)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar informe electromecánico:', error);
    return { success: false, error: error.message };
  }
}

export async function getInformeElectromecanico(ordenTrabajoId) {
  try {
    const { data, error } = await supabase
      .from('informe_electromecanico')
      .select('*')
      .eq('orden_trabajo_id', ordenTrabajoId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener informe electromecánico:', error);
    return { success: false, error: error.message };
  }
}

// ================================
// FUNCIONES PARA INFORME LIMPIEZA DUCTOS
// ================================

export async function createInformeLimpiezaDuctos(datos) {
  try {
    const { data, error } = await supabase
      .from('informe_limpieza_ductos')
      .insert([datos])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al crear informe limpieza ductos:', error);
    return { success: false, error: error.message };
  }
}

export async function updateInformeLimpiezaDuctos(id, datos) {
  try {
    const { data, error } = await supabase
      .from('informe_limpieza_ductos')
      .update(datos)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar informe limpieza ductos:', error);
    return { success: false, error: error.message };
  }
}

export async function getInformeLimpiezaDuctos(ordenTrabajoId) {
  try {
    const { data, error } = await supabase
      .from('informe_limpieza_ductos')
      .select('*')
      .eq('orden_trabajo_id', ordenTrabajoId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener informe limpieza ductos:', error);
    return { success: false, error: error.message };
  }
}

// ================================
// FUNCIONES PARA REPARACIONES ADICIONALES
// ================================

export async function createInformeReparaciones(datos) {
  try {
    const { data, error } = await supabase
      .from('informe_reparaciones_adicionales')
      .insert([datos])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al crear informe reparaciones:', error);
    return { success: false, error: error.message };
  }
}

export async function updateInformeReparaciones(id, datos) {
  try {
    const { data, error } = await supabase
      .from('informe_reparaciones_adicionales')
      .update(datos)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar informe reparaciones:', error);
    return { success: false, error: error.message };
  }
}

export async function getInformeReparaciones(ordenTrabajoId) {
  try {
    const { data, error } = await supabase
      .from('informe_reparaciones_adicionales')
      .select('*')
      .eq('orden_trabajo_id', ordenTrabajoId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener informe reparaciones:', error);
    return { success: false, error: error.message };
  }
}

// ================================
// FUNCIONES PARA FOTOGRAFÍAS
// ================================

export async function uploadFotografia(ordenTrabajoId, informeTabla, fileUri, etiqueta) {
  try {
    // Aquí se implementaría la lógica de upload a Supabase Storage
    // Por ahora retornamos la estructura esperada
    const fileName = `${ordenTrabajoId}/${informeTabla}/${Date.now()}.jpg`;
    
    const { data, error } = await supabase
      .from('informe_fotografias')
      .insert([{
        orden_trabajo_id: ordenTrabajoId,
        informe_tabla: informeTabla,
        storage_path: fileName,
        etiqueta: etiqueta
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al subir fotografía:', error);
    return { success: false, error: error.message };
  }
}

export async function getFotografias(ordenTrabajoId, informeTabla = null) {
  try {
    let query = supabase
      .from('informe_fotografias')
      .select('*')
      .eq('orden_trabajo_id', ordenTrabajoId);

    if (informeTabla) {
      query = query.eq('informe_tabla', informeTabla);
    }

    const { data, error } = await query.order('uploaded_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener fotografías:', error);
    return { success: false, error: error.message };
  }
}

// ================================
// FUNCIÓN DE CONEXIÓN Y PRUEBA
// ================================

export async function testConnection() {
  try {
    console.log('🔄 Probando conexión a Supabase CMMS...');
    
    const { data, error } = await supabase
      .from('orden_trabajo')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Conexión exitosa al sistema CMMS');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    return { success: false, error: err.message };
  }
}
