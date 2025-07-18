import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../services/supabase';
import WorkOrderService from '../../services/WorkOrderService';
import { globalStyles, colors } from '../../styles';

export default function CreateWorkOrderScreen() {
  const navigation = useNavigation();

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcionCorta, setDescripcionCorta] = useState('');
  const [descripcionLarga, setDescripcionLarga] = useState('');
  const [selectedEstadoId, setSelectedEstadoId] = useState('');
  const [selectedPrioridadId, setSelectedPrioridadId] = useState('');
  const [selectedEquipoId, setSelectedEquipoId] = useState('');
  const [selectedTipoMantenimientoId, setSelectedTipoMantenimientoId] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaEstimadaFin, setFechaEstimadaFin] = useState(new Date());
  const [attachments, setAttachments] = useState([]);

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Estados para los selectores
  const [estadosList, setEstadosList] = useState([]);
  const [prioridadesList, setPrioridadesList] = useState([]);
  const [tiposMantenimientoList, setTiposMantenimientoList] = useState([]);
  const [equiposList, setEquiposList] = useState([]);

  // Estados para DatePickers
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFin, setShowDatePickerFin] = useState(false);

  // Cargar datos para los selectores
  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { data, error: serviceError } = await WorkOrderService.getFormData(user.id);

      if (serviceError) {
        setError(serviceError.message);
        return;
      }

      if (data) {
        setEstadosList(data.estados || []);
        setPrioridadesList(data.prioridades || []);
        setTiposMantenimientoList(data.tiposMantenimiento || []);
        setEquiposList(data.equipos || []);

        // Establecer estado por defecto como 'Pendiente'
        const estadoPendiente = data.estados.find(estado => 
          estado.nombre.toLowerCase().includes('pendiente')
        );
        if (estadoPendiente) {
          setSelectedEstadoId(estadoPendiente.estado_id);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del formulario:', error);
      setError('Error inesperado al cargar los datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      // Mostrar opciones al usuario
      Alert.alert(
        'Seleccionar imagen',
        'Elige una opción',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Galería', onPress: () => pickFromGallery() },
          { text: 'Cámara', onPress: () => pickFromCamera() }
        ]
      );
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      Alert.alert('Error', 'Error al acceder a la galería');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newAttachment = {
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName || `image_${Date.now()}.jpg`,
          mimeType: result.assets[0].mimeType || 'image/jpeg'
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'Error al seleccionar la imagen');
    }
  };

  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesitan permisos para usar la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newAttachment = {
          uri: result.assets[0].uri,
          fileName: `camera_${Date.now()}.jpg`,
          mimeType: 'image/jpeg'
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'Error al tomar la foto');
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
  };

  const handleDateChangeInicio = (event, selectedDate) => {
    setShowDatePickerInicio(false);
    if (selectedDate) {
      setFechaInicio(selectedDate);
    }
  };

  const handleDateChangeFin = (event, selectedDate) => {
    setShowDatePickerFin(false);
    if (selectedDate) {
      setFechaEstimadaFin(selectedDate);
    }
  };

  const validateForm = () => {
    if (!titulo.trim()) {
      setError('El título es requerido');
      return false;
    }

    if (!descripcionCorta.trim()) {
      setError('La descripción corta es requerida');
      return false;
    }

    if (!selectedPrioridadId) {
      setError('Debe seleccionar una prioridad');
      return false;
    }

    if (!selectedEquipoId) {
      setError('Debe seleccionar un equipo');
      return false;
    }

    if (!selectedTipoMantenimientoId) {
      setError('Debe seleccionar un tipo de mantenimiento');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      // Preparar datos de la orden
      const orderData = {
        titulo,
        descripcion_corta: descripcionCorta,
        descripcion_larga: descripcionLarga,
        estado_id: selectedEstadoId,
        prioridad_id: selectedPrioridadId,
        equipo_id: selectedEquipoId,
        tipo_mantenimiento_id: selectedTipoMantenimientoId,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_estimada_fin: fechaEstimadaFin.toISOString()
      };

      // Crear orden de trabajo
      const { data: createdOrder, error: createError } = await WorkOrderService.createWorkOrder(
        orderData,
        user.id
      );

      if (createError) {
        setError(createError.message);
        return;
      }

      // Subir adjuntos si existen
      if (attachments.length > 0 && createdOrder) {
        for (const attachment of attachments) {
          const { error: uploadError } = await WorkOrderService.uploadAttachment(
            createdOrder.orden_trabajo_id,
            attachment.uri,
            attachment.fileName,
            attachment.mimeType
          );

          if (uploadError) {
            console.warn('Error al subir adjunto:', uploadError.message);
            // Continuar con otros adjuntos aunque uno falle
          }
        }
      }

      // Mostrar mensaje de éxito
      Alert.alert(
        'Éxito',
        'Orden de trabajo creada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar formulario y navegar de regreso
              clearForm();
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error al crear orden:', error);
      setError('Error inesperado al crear la orden de trabajo');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setTitulo('');
    setDescripcionCorta('');
    setDescripcionLarga('');
    setSelectedPrioridadId('');
    setSelectedEquipoId('');
    setSelectedTipoMantenimientoId('');
    setFechaInicio(new Date());
    setFechaEstimadaFin(new Date());
    setAttachments([]);
    setError('');
  };

  const renderAttachment = ({ item, index }) => (
    <View style={styles.attachmentContainer}>
      <Image source={{ uri: item.uri }} style={styles.attachmentImage} />
      <TouchableOpacity
        style={styles.removeAttachmentButton}
        onPress={() => removeAttachment(index)}
      >
        <Text style={styles.removeAttachmentText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  if (loadingData) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando formulario...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={globalStyles.title}>Nueva Orden de Trabajo</Text>
          <Text style={globalStyles.textLight}>
            Complete los campos para crear una nueva orden
          </Text>
        </View>

        {/* Mensaje de Error */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          {/* Título */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Título *</Text>
            <TextInput
              style={globalStyles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Título de la orden de trabajo"
              placeholderTextColor={colors.textMuted}
              editable={!loading}
            />
          </View>

          {/* Descripción Corta */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descripción Corta *</Text>
            <TextInput
              style={globalStyles.input}
              value={descripcionCorta}
              onChangeText={setDescripcionCorta}
              placeholder="Descripción breve del problema"
              placeholderTextColor={colors.textMuted}
              editable={!loading}
            />
          </View>

          {/* Descripción Larga */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descripción Detallada</Text>
            <TextInput
              style={[globalStyles.input, styles.textArea]}
              value={descripcionLarga}
              onChangeText={setDescripcionLarga}
              placeholder="Descripción detallada del problema o mantenimiento"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          {/* Prioridad */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Prioridad *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedPrioridadId}
                onValueChange={(itemValue) => setSelectedPrioridadId(itemValue)}
                enabled={!loading}
                style={styles.picker}
              >
                <Picker.Item label="Seleccionar prioridad" value="" />
                {prioridadesList.map((prioridad) => (
                  <Picker.Item
                    key={prioridad.prioridad_id}
                    label={prioridad.nombre}
                    value={prioridad.prioridad_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Equipo */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Equipo *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedEquipoId}
                onValueChange={(itemValue) => setSelectedEquipoId(itemValue)}
                enabled={!loading}
                style={styles.picker}
              >
                <Picker.Item label="Seleccionar equipo" value="" />
                {equiposList.map((equipo) => (
                  <Picker.Item
                    key={equipo.equipo_id}
                    label={`${equipo.nombre_equipo} (${equipo.codigo_equipo})`}
                    value={equipo.equipo_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Tipo de Mantenimiento */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tipo de Mantenimiento *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTipoMantenimientoId}
                onValueChange={(itemValue) => setSelectedTipoMantenimientoId(itemValue)}
                enabled={!loading}
                style={styles.picker}
              >
                <Picker.Item label="Seleccionar tipo de mantenimiento" value="" />
                {tiposMantenimientoList.map((tipo) => (
                  <Picker.Item
                    key={tipo.tipo_mantenimiento_id}
                    label={tipo.nombre_tipo}
                    value={tipo.tipo_mantenimiento_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Fecha de Inicio */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Fecha de Inicio</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePickerInicio(true)}
              disabled={loading}
            >
              <Text style={styles.dateButtonText}>
                {fechaInicio.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePickerInicio && (
              <DateTimePicker
                value={fechaInicio}
                mode="date"
                display="default"
                onChange={handleDateChangeInicio}
              />
            )}
          </View>

          {/* Fecha Estimada de Fin */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Fecha Estimada de Fin</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePickerFin(true)}
              disabled={loading}
            >
              <Text style={styles.dateButtonText}>
                {fechaEstimadaFin.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePickerFin && (
              <DateTimePicker
                value={fechaEstimadaFin}
                mode="date"
                display="default"
                onChange={handleDateChangeFin}
              />
            )}
          </View>

          {/* Adjuntos */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Adjuntos</Text>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleImagePicker}
              disabled={loading}
            >
              <Text style={styles.attachButtonText}>+ Adjuntar Imagen</Text>
            </TouchableOpacity>

            {attachments.length > 0 && (
              <FlatList
                data={attachments}
                renderItem={renderAttachment}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.attachmentsList}
              />
            )}
          </View>

          {/* Botones de Acción */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[globalStyles.button, styles.createButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={globalStyles.buttonText}>
                {loading ? 'Creando...' : 'Crear Orden de Trabajo'}
              </Text>
              {loading && (
                <ActivityIndicator 
                  color={colors.white} 
                  size="small" 
                  style={styles.buttonLoader} 
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.buttonSecondary, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={globalStyles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
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

  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  errorContainer: {
    backgroundColor: colors.dangerLight || '#ffebee',
    borderColor: colors.danger || '#dc3545',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  errorText: {
    color: colors.danger || '#dc3545',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },

  picker: {
    height: 50,
  },

  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    backgroundColor: colors.white,
  },

  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },

  attachButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
  },

  attachButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },

  attachmentsList: {
    marginTop: 10,
  },

  attachmentContainer: {
    position: 'relative',
    marginRight: 10,
  },

  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
  },

  removeAttachmentButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeAttachmentText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  buttonContainer: {
    marginTop: 30,
    gap: 15,
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonLoader: {
    marginLeft: 10,
  },

  cancelButton: {
    // Estilos ya definidos en globalStyles.buttonSecondary
  },
});
