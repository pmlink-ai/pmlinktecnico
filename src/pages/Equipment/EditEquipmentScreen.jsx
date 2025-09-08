import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../../styles';
import { supabase } from '../../services/supabase';
import CustomDatePickerIOS from '../../components/CustomDatePickerIOS';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditEquipmentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { equipmentId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre_equipo: '',
    codigo_equipo: '',
    descripcion: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    fecha_adquisicion: new Date(),
    vida_util_estimada: '',
    estado_operacional: 'Operativo',
    ubicacion_especifica: '',
    ultimo_mantenimiento: null,
    proximo_mantenimiento_programado: null,
    activo: true
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMaintenancePicker, setShowMaintenancePicker] = useState(false);
  const [showNextMaintenancePicker, setShowNextMaintenancePicker] = useState(false);

  const estadosOperacionales = [
    'Operativo',
    'En Mantenimiento',
    'Fuera de Servicio',
    'En Reparación'
  ];

  // Auto-refresh cuando la pantalla gana foco
  useFocusEffect(
    React.useCallback(() => {
      loadEquipmentData();
    }, [equipmentId])
  );

  const loadEquipmentData = async () => {
    setLoading(true);
    
    try {
      console.log('Cargando datos del equipo para editar:', equipmentId);
      
      const { data, error } = await supabase
        .from('equipo')
        .select(`
          equipo_id,
          local_id,
          nombre_equipo,
          codigo_equipo,
          descripcion,
          marca,
          modelo,
          numero_serie,
          fecha_adquisicion,
          vida_util_estimada,
          estado_operacional,
          ubicacion_especifica,
          ultimo_mantenimiento,
          proximo_mantenimiento_programado,
          activo
        `)
        .eq('equipo_id', equipmentId)
        .single();

      if (error) {
        console.error('Error cargando datos del equipo:', error);
        throw error;
      }

      if (data) {
        setFormData({
          nombre_equipo: data.nombre_equipo || '',
          codigo_equipo: data.codigo_equipo || '',
          descripcion: data.descripcion || '',
          marca: data.marca || '',
          modelo: data.modelo || '',
          numero_serie: data.numero_serie || '',
          fecha_adquisicion: data.fecha_adquisicion ? new Date(data.fecha_adquisicion) : new Date(),
          vida_util_estimada: data.vida_util_estimada ? data.vida_util_estimada.toString() : '',
          estado_operacional: data.estado_operacional || 'Operativo',
          ubicacion_especifica: data.ubicacion_especifica || '',
          ultimo_mantenimiento: data.ultimo_mantenimiento ? new Date(data.ultimo_mantenimiento) : null,
          proximo_mantenimiento_programado: data.proximo_mantenimiento_programado ? new Date(data.proximo_mantenimiento_programado) : null,
          activo: data.activo !== false
        });
      }

    } catch (error) {
      console.error('Error completo:', error);
      
      Alert.alert(
        'Error', 
        'No se pudo cargar los datos del equipo.',
        [
          { text: 'Reintentar', onPress: loadEquipmentData },
          { text: 'Volver', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_equipo.trim()) {
      newErrors.nombre_equipo = 'El nombre del equipo es obligatorio';
    }

    if (!formData.codigo_equipo.trim()) {
      newErrors.codigo_equipo = 'El código del equipo es obligatorio';
    }

    if (formData.vida_util_estimada && isNaN(parseInt(formData.vida_util_estimada))) {
      newErrors.vida_util_estimada = 'La vida útil debe ser un número';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor, corrija los errores en el formulario.');
      return;
    }

    setSaving(true);

    try {
      const equipmentData = {
        nombre_equipo: formData.nombre_equipo.trim(),
        codigo_equipo: formData.codigo_equipo.trim(),
        descripcion: formData.descripcion.trim() || null,
        marca: formData.marca.trim() || null,
        modelo: formData.modelo.trim() || null,
        numero_serie: formData.numero_serie.trim() || null,
        fecha_adquisicion: formData.fecha_adquisicion.toISOString().split('T')[0],
        vida_util_estimada: formData.vida_util_estimada ? parseInt(formData.vida_util_estimada) : null,
        estado_operacional: formData.estado_operacional,
        ubicacion_especifica: formData.ubicacion_especifica.trim() || null,
        ultimo_mantenimiento: formData.ultimo_mantenimiento ? formData.ultimo_mantenimiento.toISOString() : null,
        proximo_mantenimiento_programado: formData.proximo_mantenimiento_programado ? formData.proximo_mantenimiento_programado.toISOString() : null,
        activo: formData.activo
      };

      console.log('Actualizando equipo:', equipmentData);

      const { data, error } = await supabase
        .from('equipo')
        .update(equipmentData)
        .eq('equipo_id', equipmentId)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando equipo:', error);
        throw error;
      }

      console.log('Equipo actualizado exitosamente:', data);

      Alert.alert(
        'Éxito',
        'El equipo ha sido actualizado correctamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error completo:', error);
      
      let errorMessage = 'No se pudo actualizar el equipo.';
      
      if (error.message.includes('duplicate key')) {
        if (error.message.includes('numero_serie')) {
          errorMessage = 'El número de serie ya existe. Por favor, use uno diferente.';
        } else if (error.message.includes('codigo_equipo')) {
          errorMessage = 'El código del equipo ya existe. Por favor, use uno diferente.';
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setFormData({ ...formData, fecha_adquisicion: selectedDate });
    }
  };

  const handleMaintenanceChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowMaintenancePicker(false);
    }
    
    if (selectedDate) {
      setFormData({ ...formData, ultimo_mantenimiento: selectedDate });
    }
  };

  const handleNextMaintenanceChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowNextMaintenancePicker(false);
    }
    
    if (selectedDate) {
      setFormData({ ...formData, proximo_mantenimiento_programado: selectedDate });
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Seleccionar fecha';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'Seleccionar fecha y hora';
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Equipo</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Equipo</Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Información Básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Equipo *</Text>
              <TextInput
                style={[styles.input, errors.nombre_equipo && styles.inputError]}
                value={formData.nombre_equipo}
                onChangeText={(text) => setFormData({ ...formData, nombre_equipo: text })}
                placeholder="Ej: Bomba Centrífuga #1"
                placeholderTextColor={colors.textMuted}
              />
              {errors.nombre_equipo && (
                <Text style={styles.errorText}>{errors.nombre_equipo}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código del Equipo *</Text>
              <TextInput
                style={[styles.input, errors.codigo_equipo && styles.inputError]}
                value={formData.codigo_equipo}
                onChangeText={(text) => setFormData({ ...formData, codigo_equipo: text })}
                placeholder="Ej: BC-001"
                placeholderTextColor={colors.textMuted}
              />
              {errors.codigo_equipo && (
                <Text style={styles.errorText}>{errors.codigo_equipo}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descripcion}
                onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                placeholder="Descripción detallada del equipo..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Información Técnica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Técnica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Marca</Text>
              <TextInput
                style={styles.input}
                value={formData.marca}
                onChangeText={(text) => setFormData({ ...formData, marca: text })}
                placeholder="Ej: Grundfos"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modelo</Text>
              <TextInput
                style={styles.input}
                value={formData.modelo}
                onChangeText={(text) => setFormData({ ...formData, modelo: text })}
                placeholder="Ej: CR 64-2"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Serie</Text>
              <TextInput
                style={styles.input}
                value={formData.numero_serie}
                onChangeText={(text) => setFormData({ ...formData, numero_serie: text })}
                placeholder="Ej: 123456789"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ubicación Específica</Text>
              <TextInput
                style={styles.input}
                value={formData.ubicacion_especifica}
                onChangeText={(text) => setFormData({ ...formData, ubicacion_especifica: text })}
                placeholder="Ej: Sala de Máquinas - Nivel 2"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Estado Operacional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estado Operacional</Text>
            
            <View style={styles.pickerContainer}>
              {estadosOperacionales.map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={[
                    styles.optionButton,
                    formData.estado_operacional === estado && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, estado_operacional: estado })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.estado_operacional === estado && styles.optionTextSelected
                  ]}>
                    {estado}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Información de Adquisición */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Adquisición</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Adquisición</Text>
              {Platform.OS === 'ios' ? (
                <CustomDatePickerIOS
                  date={formData.fecha_adquisicion}
                  onDateChange={(date) => setFormData({ ...formData, fecha_adquisicion: date })}
                  mode="date"
                  placeholder="Seleccionar fecha"
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDate(formData.fecha_adquisicion)}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.fecha_adquisicion}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vida Útil Estimada (años)</Text>
              <TextInput
                style={[styles.input, errors.vida_util_estimada && styles.inputError]}
                value={formData.vida_util_estimada}
                onChangeText={(text) => setFormData({ ...formData, vida_util_estimada: text })}
                placeholder="Ej: 10"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
              {errors.vida_util_estimada && (
                <Text style={styles.errorText}>{errors.vida_util_estimada}</Text>
              )}
            </View>
          </View>

          {/* Información de Mantenimiento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Mantenimiento</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Último Mantenimiento</Text>
              {Platform.OS === 'ios' ? (
                <CustomDatePickerIOS
                  date={formData.ultimo_mantenimiento}
                  onDateChange={(date) => setFormData({ ...formData, ultimo_mantenimiento: date })}
                  mode="datetime"
                  placeholder="Seleccionar fecha y hora"
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowMaintenancePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDateTime(formData.ultimo_mantenimiento)}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                  {showMaintenancePicker && (
                    <DateTimePicker
                      value={formData.ultimo_mantenimiento || new Date()}
                      mode="datetime"
                      display="default"
                      onChange={handleMaintenanceChange}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Próximo Mantenimiento Programado</Text>
              {Platform.OS === 'ios' ? (
                <CustomDatePickerIOS
                  date={formData.proximo_mantenimiento_programado}
                  onDateChange={(date) => setFormData({ ...formData, proximo_mantenimiento_programado: date })}
                  mode="datetime"
                  placeholder="Seleccionar fecha y hora"
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowNextMaintenancePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDateTime(formData.proximo_mantenimiento_programado)}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                  {showNextMaintenancePicker && (
                    <DateTimePicker
                      value={formData.proximo_mantenimiento_programado || new Date()}
                      mode="datetime"
                      display="default"
                      onChange={handleNextMaintenanceChange}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          {/* Estado del Equipo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estado del Equipo</Text>
            
            <TouchableOpacity
              style={styles.switchContainer}
              onPress={() => setFormData({ ...formData, activo: !formData.activo })}
            >
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Equipo Activo</Text>
                <Text style={styles.switchDescription}>
                  {formData.activo ? 'El equipo está activo y operacional' : 'El equipo está inactivo'}
                </Text>
              </View>
              <View style={[styles.switch, formData.activo && styles.switchActive]}>
                <View style={[styles.switchThumb, formData.activo && styles.switchThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditEquipmentScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  backButton: {
    padding: 4,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  saveButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  
  headerSpacer: {
    width: 80,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textMuted,
  },
  
  keyboardContainer: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  
  section: {
    backgroundColor: colors.white,
    marginBottom: 12,
    padding: 20,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  
  inputGroup: {
    marginBottom: 16,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  
  inputError: {
    borderColor: colors.error,
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  
  optionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  
  switchDescription: {
    fontSize: 14,
    color: colors.textMuted,
  },
  
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  
  switchActive: {
    backgroundColor: colors.primary,
  },
  
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
});
