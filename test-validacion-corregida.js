// Script para probar la validación sin el campo cliente
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mwtdoidrjuahsejfctlm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGRvaWRyanVhaHNlamZjdGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNDQsImV4cCI6MjA2NjEzMzM0NH0.QtKVhvZiY-ehpJlRMusUsjS6V7ZbyHtpMnvr60x9xEM';

const supabase = createClient(supabaseUrl, supabaseKey);

const ORDEN_ID = 'c1b13736-f778-401d-8bd2-bf1868f843dc';

// Función de validación SIN cliente (simulando la corrección)
const validateAllRequiredFields = (formData) => {
  const requiredFields = [
    'nombre_local', 'encargado', 'asist_personal', 'horas_trabajo',
    'campanas_estado', 'filtros_estado', 'ductos_estado', 'damper_estado', 'drenajes_estado',
    'registros_local_estado', 'registros_techumbre_estado', 'rejillas_en_el_motor',
    'cantidad_de_motores', 'fuelle', 'correas', 'rodamientos', 'observaciones'
  ];

  console.log('🔍 Validando campos obligatorios (SIN cliente)...');
  console.log('📋 FormData actual:', JSON.stringify(formData, null, 2));
  
  for (const field of requiredFields) {
    const value = formData[field];
    const isEmpty = !value || value.toString().trim() === '';
    
    if (isEmpty) {
      console.log(`❌ Campo faltante: ${field}`);
      return false;
    } else {
      console.log(`✅ Campo OK: ${field} = "${value}"`);
    }
  }
  
  console.log('✅ Todos los campos obligatorios están completos');
  return true;
};

async function probarValidacion() {
  console.log('🧪 PROBANDO VALIDACIÓN CORREGIDA');
  console.log('='.repeat(50));
  console.log('📋 Orden ID:', ORDEN_ID);

  try {
    // Simular datos del formulario con cliente vacío
    const formData = {
      "asist_personal": "DD", 
      "campanas_estado": "D", 
      "cantidad_de_motores": "4", 
      "cliente": "",  // ← CAMPO VACÍO QUE ANTES CAUSABA PROBLEMA
      "correas": "D", 
      "damper_estado": "D", 
      "drenajes_estado": "D", 
      "ductos_estado": "D", 
      "encargado": "NF D", 
      "fecha_inicio": "", 
      "filtros_estado": "D", 
      "fuelle": "D", 
      "horas_trabajo": "4", 
      "nombre_local": "", 
      "observaciones": "D", 
      "orden_trabajo_id": ORDEN_ID, 
      "registros_local_estado": "D", 
      "registros_techumbre_estado": "D", 
      "rejillas_en_el_motor": "D", 
      "rodamientos": "D", 
      "zona": ""
    };

    console.log('');
    console.log('📊 DATOS DE PRUEBA:');
    console.log('  - cliente:', `"${formData.cliente}" (VACÍO)`);
    console.log('  - nombre_local:', `"${formData.nombre_local}"`);
    console.log('  - encargado:', `"${formData.encargado}"`);
    console.log('');

    // Probar validación corregida
    const isValid = validateAllRequiredFields(formData);
    
    console.log('');
    console.log('🎯 RESULTADO DE VALIDACIÓN:');
    if (isValid) {
      console.log('✅ VALIDACIÓN EXITOSA - El campo cliente ya NO es obligatorio');
      console.log('🎉 PROBLEMA SOLUCIONADO: Ahora se puede generar PDF');
    } else {
      console.log('❌ VALIDACIÓN FALLÓ - Hay otros campos faltantes');
    }

  } catch (error) {
    console.log('💥 ERROR:', error.message);
  }
}

probarValidacion();