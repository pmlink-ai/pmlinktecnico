import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function FormularioDinamico({ tablaCampos, nombreTabla, ordenId }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);

  // Inicializar form data basado en los campos de la tabla
  useEffect(() => {
    const initialData = {};
    tablaCampos.forEach(campo => {
      // Inicializar con valores por defecto según el tipo de dato
      if (campo.data_type === 'boolean') {
        initialData[campo.column_name] = false;
      } else if (campo.data_type.includes('int') || campo.data_type.includes('numeric')) {
        initialData[campo.column_name] = '';
      } else {
        initialData[campo.column_name] = '';
      }
    });
    
    // Agregar orden_trabajo_id si no existe
    if (!tablaCampos.find(c => c.column_name === 'orden_trabajo_id')) {
      initialData.orden_trabajo_id = ordenId;
    }
    
    setFormData(initialData);
    
    // Intentar cargar datos existentes
    cargarDatosExistentes();
  }, [tablaCampos, ordenId]);

  // Función para cargar datos existentes si los hay
  const cargarDatosExistentes = async () => {
    try {
      const { data, error } = await supabase
        .from(nombreTabla.toLowerCase())
        .select('*')
        .eq('orden_trabajo_id', ordenId)
        .single();

      if (data && !error) {
        console.log('✅ Datos existentes encontrados:', data);
        setExistingRecord(data);
        setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.log('ℹ️ No hay datos existentes para esta orden');
    }
  };

  // Función para actualizar un campo del formulario
  const updateField = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Función para guardar los datos
  const guardarDatos = async () => {
    setSaving(true);
    try {
      console.log('💾 Guardando datos en tabla:', nombreTabla);
      console.log('📝 Datos a guardar:', formData);

      let result;
      
      if (existingRecord) {
        // Actualizar registro existente
        result = await supabase
          .from(nombreTabla.toLowerCase())
          .update(formData)
          .eq('id', existingRecord.id);
      } else {
        // Insertar nuevo registro
        result = await supabase
          .from(nombreTabla.toLowerCase())
          .insert([formData]);
      }

      const { error } = result;

      if (error) {
        console.error('❌ Error guardando datos:', error);
        Alert.alert('Error', 'No se pudieron guardar los datos: ' + error.message);
        return;
      }

      console.log('✅ Datos guardados exitosamente');
      Alert.alert(
        'Éxito', 
        existingRecord ? 'Datos actualizados correctamente' : 'Datos guardados correctamente',
        [{ text: 'OK' }]
      );

      // Recargar datos existentes
      await cargarDatosExistentes();

    } catch (error) {
      console.error('❌ Error inesperado:', error);
      Alert.alert('Error', 'Error inesperado al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Función para renderizar un campo según su tipo
  const renderField = (campo) => {
    const fieldName = campo.column_name;
    const fieldValue = formData[fieldName] || '';
    
    // Campos que no se deben mostrar en el formulario
    const hiddenFields = ['id', 'created_at', 'updated_at'];
    if (hiddenFields.includes(fieldName)) {
      return null;
    }

    // Campo orden_trabajo_id debe ser de solo lectura
    if (fieldName === 'orden_trabajo_id') {
      return (
        <View key={fieldName} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {formatFieldName(fieldName)}
            <Text style={styles.readOnlyLabel}> (Solo lectura)</Text>
          </Text>
          <TextInput
            style={[styles.textInput, styles.readOnlyInput]}
            value={fieldValue.toString()}
            editable={false}
            placeholder="ID de la orden de trabajo"
          />
        </View>
      );
    }

    // Determinar el tipo de input según el tipo de dato
    const dataType = campo.data_type.toLowerCase();
    
    if (dataType === 'boolean') {
      return (
        <View key={fieldName} style={styles.fieldContainer}>
          <View style={styles.switchContainer}>
            <Text style={styles.fieldLabel}>
              {formatFieldName(fieldName)}
              {!campo.is_nullable && <Text style={styles.required}> *</Text>}
            </Text>
            <Switch
              value={fieldValue}
              onValueChange={(value) => updateField(fieldName, value)}
              trackColor={{ false: '#bdc3c7', true: '#3498db' }}
              thumbColor={fieldValue ? '#fff' : '#fff'}
            />
          </View>
        </View>
      );
    }

    if (dataType.includes('int') || dataType.includes('numeric') || dataType.includes('decimal')) {
      return (
        <View key={fieldName} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {formatFieldName(fieldName)}
            {!campo.is_nullable && <Text style={styles.required}> *</Text>}
          </Text>
          <TextInput
            style={styles.numericInput}
            value={fieldValue.toString()}
            onChangeText={(value) => updateField(fieldName, value === '' ? '' : Number(value))}
            keyboardType="numeric"
            placeholder={`Ingrese ${formatFieldName(fieldName).toLowerCase()}`}
          />
        </View>
      );
    }

    if (dataType.includes('date') || dataType.includes('timestamp')) {
      return (
        <View key={fieldName} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {formatFieldName(fieldName)}
            {!campo.is_nullable && <Text style={styles.required}> *</Text>}
          </Text>
          <TextInput
            style={styles.textInput}
            value={fieldValue}
            onChangeText={(value) => updateField(fieldName, value)}
            placeholder="YYYY-MM-DD HH:MM:SS"
          />
          <Text style={styles.fieldHint}>Formato: YYYY-MM-DD HH:MM:SS</Text>
        </View>
      );
    }

    // Campo de texto por defecto
    return (
      <View key={fieldName} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {formatFieldName(fieldName)}
          {!campo.is_nullable && <Text style={styles.required}> *</Text>}
        </Text>
        <TextInput
          style={styles.textInput}
          value={fieldValue}
          onChangeText={(value) => updateField(fieldName, value)}
          placeholder={`Ingrese ${formatFieldName(fieldName).toLowerCase()}`}
          multiline={dataType === 'text' && fieldName.includes('descripcion')}
          numberOfLines={dataType === 'text' && fieldName.includes('descripcion') ? 3 : 1}
        />
      </View>
    );
  };

  // Función para formatear nombres de campos
  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>📝 Formulario: {nombreTabla}</Text>
        
        {existingRecord && (
          <View style={styles.existingDataBanner}>
            <Text style={styles.existingDataText}>
              ℹ️ Editando datos existentes (ID: {existingRecord.id})
            </Text>
          </View>
        )}

        <Text style={styles.formSubtitle}>
          Campos disponibles: {tablaCampos.length}
        </Text>

        {/* Renderizar todos los campos */}
        {tablaCampos.map(renderField)}

        {/* Botón de guardar */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={guardarDatos}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? '💾 Guardando...' : existingRecord ? '📝 Actualizar Datos' : '💾 Guardar Datos'}
          </Text>
        </TouchableOpacity>

        {/* Información de debug */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugTitle}>🔧 Info Debug:</Text>
          <Text style={styles.debugText}>Tabla: {nombreTabla.toLowerCase()}</Text>
          <Text style={styles.debugText}>Orden ID: {ordenId}</Text>
          <Text style={styles.debugText}>Campos: {tablaCampos.length}</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  existingDataBanner: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  existingDataText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  numericInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldHint: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  readOnlyLabel: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
    fontWeight: 'normal',
  },
  readOnlyInput: {
    backgroundColor: '#ecf0f1',
    color: '#7f8c8d',
    borderColor: '#bdc3c7',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
});