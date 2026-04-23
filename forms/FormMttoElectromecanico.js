// Formulario específico para INFORME MTTO ELECTROMECANICO
// Copiado y adaptado de FormLimpiezaDuctos.js (NO MODIFICAR EL ORIGINAL)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { supabase } from '../lib/supabase';

const FormMttoElectromecanico = ({ order, navigation, onClose, setCurrentView, setCurrentPhotoPage }) => {
  // Función para obtener la fecha actual en formato DD/MM/AAAA
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Estados para campos del formulario electromecánico (coincide con tabla BD)
  const [formData, setFormData] = useState({
    orden_trabajo_id: order.id,
    fecha_inicio: getCurrentDate(),
    cliente: order.servicios?.local?.zona?.empresa?.nombre_empresa || '',
    zona: order.servicios?.local?.zona?.nombre_zona || '',
    nombre_local: order.servicios?.local?.nombre_local || '',
    asistencia_personal: '',
    horas_trabajo: '',
    
    // Componentes del sistema
    rejillas_motor_estado: '',
    cantidad_motores: '',
    fuelle_estado: '',
    correas_modelo: '',
    rodamientos_estado: '',
    
    // Observaciones
    observaciones_adicionales: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando datos existentes para MTTO Electromecánico...');
      
      const { data, error } = await supabase
        .from('informe_electromecanico')
        .select('*')
        .eq('orden_trabajo_id', order.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error cargando datos existentes:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del formulario');
        return;
      }

      if (data) {
        console.log('✅ Datos existentes encontrados');
        setExistingRecord(data);
        setFormData(prevData => ({
          ...prevData,
          ...data
        }));
      } else {
        console.log('ℹ️ No hay datos existentes - formulario nuevo');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error inesperado al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  // Función para validar que todos los campos obligatorios estén completos
  const isFormValid = () => {
    const requiredFields = [
      'fecha_inicio',
      'cliente',
      'asistencia_personal',
      'horas_trabajo',
      'rejillas_motor_estado',
      'rodamientos_estado',
      'observaciones_adicionales'
    ];

    console.log('🔍 Validando campos obligatorios:', {
      fecha_inicio: formData.fecha_inicio,
      cliente: formData.cliente,
      asistencia_personal: formData.asistencia_personal,
      horas_trabajo: formData.horas_trabajo,
      rejillas_motor_estado: formData.rejillas_motor_estado,
      rodamientos_estado: formData.rodamientos_estado,
      observaciones_adicionales: formData.observaciones_adicionales
    });

    const isValid = requiredFields.every(field => {
      const value = formData[field];
      const fieldValid = value !== null && value !== undefined && value.toString().trim() !== '';
      console.log(`Campo ${field}:`, value, 'Válido:', fieldValid);
      return fieldValid;
    });
    
    console.log('Resultado validación:', isValid);
    return isValid;
  };
  const validateForm = () => {
    const requiredFields = [
      'fecha_inicio',
      'cliente',
      'asistencia_personal',
      'horas_trabajo',
      'rejillas_motor_estado',
      'rodamientos_estado',
      'observaciones_adicionales'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Formulario Incompleto', 'Por favor complete todos los campos obligatorios marcados con *');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Guardando formulario MTTO Electromecánico...');
      
      // Preparar datos para guardar
      const dataToSave = {
        ...formData,
        orden_trabajo_id: order.id
      };

      let result;
      if (existingRecord) {
        // Actualizar registro existente
        result = await supabase
          .from('informe_electromecanico')
          .update(dataToSave)
          .eq('id', existingRecord.id);
      } else {
        // Crear nuevo registro
        result = await supabase
          .from('informe_electromecanico')
          .insert([dataToSave]);
      }

      if (result.error) {
        console.error('Error guardando:', result.error);
        Alert.alert('Error', 'No se pudo guardar el formulario');
        return;
      }

      console.log('✅ Formulario guardado exitosamente');
      Alert.alert('Éxito', 'Formulario guardado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            if (onClose) onClose();
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error inesperado al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando formulario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose || (() => navigation.goBack())} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>INFORME MTTO ELECTROMECÁNICO</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.formContent}>
        
        {/* SECCIÓN DE INFORMACIÓN GENERAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 INFORMACIÓN GENERAL</Text>
          
          <Text style={styles.inputLabel}>Fecha de Inicio *</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.fecha_inicio}
            editable={false}
            placeholder="DD/MM/AAAA"
          />

          <Text style={styles.inputLabel}>Cliente *</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.cliente}
            editable={false}
            placeholder="Nombre del cliente"
          />

          <Text style={styles.inputLabel}>Zona</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.zona}
            editable={false}
            placeholder="Zona del local"
          />

          <Text style={styles.inputLabel}>Nombre del Local</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.nombre_local}
            editable={false}
            placeholder="Nombre del local"
          />

          <Text style={styles.inputLabel}>Asistencia de Personal *</Text>
          <TextInput
            style={styles.input}
            value={formData.asistencia_personal}
            onChangeText={(text) => handleInputChange('asistencia_personal', text)}
            placeholder="Personal técnico asignado"
          />

          <Text style={styles.inputLabel}>Horas de Trabajo *</Text>
          <TextInput
            style={styles.input}
            value={formData.horas_trabajo}
            onChangeText={(text) => handleInputChange('horas_trabajo', text)}
            placeholder="Número de horas trabajadas"
            keyboardType="numeric"
          />
        </View>

        {/* SECCIÓN DE COMPONENTES DEL MOTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ COMPONENTES DEL MOTOR</Text>
          
          <Text style={styles.inputLabel}>Estado de las Rejillas del Motor *</Text>
          <TextInput
            style={styles.input}
            value={formData.rejillas_motor_estado}
            onChangeText={(text) => handleInputChange('rejillas_motor_estado', text)}
            placeholder="Describa el estado de las rejillas del motor"
            multiline
          />

          <Text style={styles.inputLabel}>Cantidad de Motores</Text>
          <TextInput
            style={styles.input}
            value={formData.cantidad_motores?.toString()}
            onChangeText={(text) => handleInputChange('cantidad_motores', parseInt(text) || '')}
            placeholder="Número total de motores"
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Estado del Fuelle</Text>
          <TextInput
            style={styles.input}
            value={formData.fuelle_estado}
            onChangeText={(text) => handleInputChange('fuelle_estado', text)}
            placeholder="Describa el estado del fuelle"
            multiline
          />

          <Text style={styles.inputLabel}>Modelo de Correas</Text>
          <TextInput
            style={styles.input}
            value={formData.correas_modelo}
            onChangeText={(text) => handleInputChange('correas_modelo', text)}
            placeholder="Modelo o especificaciones de las correas"
          />

          <Text style={styles.inputLabel}>Estado de los Rodamientos *</Text>
          <TextInput
            style={styles.input}
            value={formData.rodamientos_estado}
            onChangeText={(text) => handleInputChange('rodamientos_estado', text)}
            placeholder="Describa el estado de los rodamientos"
          />
        </View>

        {/* SECCIÓN DE OBSERVACIONES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 OBSERVACIONES</Text>
          
          <Text style={styles.inputLabel}>Observaciones Adicionales *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.observaciones_adicionales}
            onChangeText={(text) => handleInputChange('observaciones_adicionales', text)}
            placeholder="Ingrese observaciones adicionales sobre el mantenimiento realizado"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* BOTÓN FOTOGRAFÍAS */}
        <TouchableOpacity 
          style={[
            styles.photographyButton,
            !isFormValid() && styles.photographyButtonDisabled
          ]}
          onPress={() => {
            console.log('🔵 Botón fotografías MTTO Electromecánico presionado');
            console.log('📝 Estado actual del formulario:', formData);
            
            if (!validateForm()) {
              console.log('❌ Validación falló - campos incompletos');
              Alert.alert(
                'Campos Incompletos',
                'Para acceder a las fotografías, primero debes completar todos los campos obligatorios del formulario.\n\n• Verifica que todos los campos estén llenos\n• Todos los campos son requeridos para continuar',
                [{ text: 'Entendido', style: 'default' }]
              );
              return;
            }
            
            console.log('✅ Validación pasó - navegando a fotografías');
            console.log('🔧 setCurrentView disponible:', typeof setCurrentView);
            console.log('🔧 setCurrentPhotoPage disponible:', typeof setCurrentPhotoPage);
            
            if (setCurrentView && typeof setCurrentView === 'function') {
              console.log('📸 Navegando a página 1 de 1 de observaciones fotográficas...');
              setCurrentView('fotografias');
              if (setCurrentPhotoPage && typeof setCurrentPhotoPage === 'function') {
                setCurrentPhotoPage(0); // MTTO Electromecánico: página única (1 de 1)
                console.log('📋 setCurrentPhotoPage(0) - Página 1 de 1');
              }
            } else {
              console.log('❌ Error: setCurrentView no está disponible');
              Alert.alert('Error', 'No se puede acceder a la sección de fotografías');
            }
          }}
          disabled={!isFormValid()}
        >
          <Text style={[
            styles.photographyButtonText,
            !isFormValid() && styles.photographyButtonTextDisabled
          ]}>
            {isFormValid() ? '📸 Fotografías ➜' : '🔒 Completa Campos Obligatorios'}
          </Text>
        </TouchableOpacity>

        {/* BOTÓN GUARDAR - ESTARÁ EN LA PÁGINA DE FOTOGRAFÍAS */}
        {/*
        <TouchableOpacity 
          style={[
            styles.saveButton,
            !isFormValid() && styles.saveButtonDisabled
          ]}
          onPress={() => {
            console.log('🟢 Botón GUARDAR presionado');
            console.log('📋 Estado del formulario:', formData);
            console.log('✅ Formulario válido:', isFormValid());
            if (isFormValid()) {
              handleSave();
            } else {
              console.log('❌ Formulario inválido - no se puede guardar');
              Alert.alert('Formulario Incompleto', 'Complete todos los campos obligatorios antes de guardar');
            }
          }}
          disabled={saving || !isFormValid()}
        >
          {saving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={[
                styles.saveButtonText,
                !isFormValid() && styles.saveButtonTextDisabled
              ]}>
                {isFormValid() ? '💾 Guardar Formulario' : '🔒 Complete Campos Obligatorios'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        */}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  backButton: {
    padding: 10
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  headerSpacer: {
    width: 40
  },
  scrollContainer: {
    flex: 1
  },
  formContent: {
    padding: 15
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 45
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666'
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  saveButton: {
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  photographyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  photographyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  photographyButtonDisabled: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0
  },
  photographyButtonTextDisabled: {
    color: '#666666'
  },
  bottomSpacer: {
    height: 50
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  }
});

export default FormMttoElectromecanico;