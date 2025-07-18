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
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  
  // Estados para modales de selección
  const [showPrioridadModal, setShowPrioridadModal] = useState(false);
  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [showTipoModal, setShowTipoModal] = useState(false);

  // Cargar datos para los selectores
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await loadFormData();
      }
    };
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      setError('');

      console.log('Cargando datos del formulario...');

      // Cargar prioridades directamente desde Supabase
      const { data: prioridadesData, error: prioridadesError } = await supabase
        .from('prioridades')
        .select('id, nombre, nivel, descripcion')
        .order('nivel', { ascending: true });

      if (prioridadesError) {
        console.error('Error al cargar prioridades:', prioridadesError);
        // Usar prioridades de fallback
        setPrioridadesList([
          { id: 1, nombre: 'Baja', nivel: 1 },
          { id: 2, nombre: 'Media', nivel: 2 },
          { id: 3, nombre: 'Alta', nivel: 3 },
          { id: 4, nombre: 'Crítica', nivel: 4 }
        ]);
      } else {
        console.log('Prioridades cargadas:', prioridadesData);
        setPrioridadesList(prioridadesData || []);
      }

      // Cargar estados con datos de fallback
      setEstadosList([
        { id: 1, nombre: 'Pendiente' },
        { id: 2, nombre: 'En Progreso' },
        { id: 3, nombre: 'Completada' },
        { id: 4, nombre: 'Cancelada' }
      ]);

      // Cargar tipos de mantenimiento desde Supabase
      const { data: tiposData, error: tiposError } = await supabase
        .from('tiposmantenimiento')
        .select('tipo_id, nombre_tipo, descripcion')
        .eq('activo', true)
        .order('nombre_tipo', { ascending: true });

      if (tiposError) {
        console.error('Error al cargar tipos de mantenimiento:', tiposError);
        // Usar datos de fallback
        setTiposMantenimientoList([
          { tipo_id: 'fallback-1', nombre_tipo: 'Preventivo' },
          { tipo_id: 'fallback-2', nombre_tipo: 'Correctivo' },
          { tipo_id: 'fallback-3', nombre_tipo: 'Predictivo' },
          { tipo_id: 'fallback-4', nombre_tipo: 'Emergencia' }
        ]);
      } else {
        console.log('Tipos de mantenimiento cargados:', tiposData);
        setTiposMantenimientoList(tiposData || []);
      }

      // Cargar equipos desde Supabase
      const { data: equiposData, error: equiposError } = await supabase
        .from('equipo')
        .select('equipo_id, nombre_equipo, codigo_equipo, descripcion, marca, modelo')
        .eq('activo', true)
        .order('nombre_equipo', { ascending: true });

      if (equiposError) {
        console.error('Error al cargar equipos:', equiposError);
        // Usar datos de fallback
        setEquiposList([
          { equipo_id: 'fallback-1', nombre_equipo: 'Bomba Principal', codigo_equipo: 'BP001' },
          { equipo_id: 'fallback-2', nombre_equipo: 'Motor Eléctrico', codigo_equipo: 'ME001' },
          { equipo_id: 'fallback-3', nombre_equipo: 'Compresor', codigo_equipo: 'CP001' },
          { equipo_id: 'fallback-4', nombre_equipo: 'Generador', codigo_equipo: 'GN001' }
        ]);
      } else {
        console.log('Equipos cargados:', equiposData);
        setEquiposList(equiposData || []);
      }

      // Establecer estado por defecto
      setSelectedEstadoId('1');

    } catch (error) {
      console.error('Error al cargar datos del formulario:', error);
      setError('Error inesperado al cargar los datos');
      
      // Usar todos los datos de fallback en caso de error
      setPrioridadesList([
        { id: 1, nombre: 'Baja', nivel: 1 },
        { id: 2, nombre: 'Media', nivel: 2 },
        { id: 3, nombre: 'Alta', nivel: 3 },
        { id: 4, nombre: 'Crítica', nivel: 4 }
      ]);
      setEstadosList([
        { id: 1, nombre: 'Pendiente' },
        { id: 2, nombre: 'En Progreso' }
      ]);
      setTiposMantenimientoList([
        { tipo_id: 'fallback-1', nombre_tipo: 'Preventivo' },
        { tipo_id: 'fallback-2', nombre_tipo: 'Correctivo' }
      ]);
      setEquiposList([
        { equipo_id: 'fallback-1', nombre_equipo: 'Equipo Demo', codigo_equipo: 'DEMO001' }
      ]);
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

    // Los demás campos son opcionales por ahora
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

      // Preparar datos para la orden con los campos UUID
      const orderData = {
        titulo: titulo.trim(),
        descripcion_corta: descripcionCorta.trim(),
        descripcion_larga: descripcionLarga.trim() || null,
        usuario_id: user.id,
        estado_id: 1, // Por defecto "Pendiente" 
        prioridad_id: selectedPrioridadId ? parseInt(selectedPrioridadId) : null,
        equipo_id: selectedEquipoId || null, // UUID del equipo seleccionado
        tipo_mantenimiento_id: selectedTipoMantenimientoId || null, // UUID del tipo de mantenimiento
        fecha_inicio: fechaInicio.toISOString(),
        fecha_estimada_fin: fechaEstimadaFin.toISOString()
      };

      console.log('Creando orden con datos completos:', orderData);

      // Crear orden de trabajo directamente en Supabase
      const { data: createdOrder, error: createError } = await supabase
        .from('orden_trabajo')
        .insert(orderData)
        .select()
        .single();

      if (createError) {
        console.error('Error al crear orden:', createError);
        setError(`Error al crear la orden: ${createError.message}`);
        return;
      }

      console.log('Orden creada exitosamente:', createdOrder);

      // Adjuntos - por ahora solo mostrar aviso de funcionalidad en desarrollo
      if (attachments.length > 0) {
        console.log('Adjuntos seleccionados (funcionalidad en desarrollo):', attachments.length);
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

  // Funciones para manejar selecciones
  const handlePrioridadSelect = (prioridad) => {
    setSelectedPrioridadId(prioridad.id);
    setShowPrioridadModal(false);
  };

  const handleEquipoSelect = (equipo) => {
    setSelectedEquipoId(equipo.equipo_id);
    setShowEquipoModal(false);
  };

  const handleTipoSelect = (tipo) => {
    setSelectedTipoMantenimientoId(tipo.tipo_id);
    setShowTipoModal(false);
  };

  const getPrioridadName = () => {
    const prioridad = prioridadesList.find(p => p.id === selectedPrioridadId);
    return prioridad ? prioridad.nombre : 'Seleccionar prioridad';
  };

  const getEquipoName = () => {
    const equipo = equiposList.find(e => e.equipo_id === selectedEquipoId);
    return equipo ? `${equipo.nombre_equipo}${equipo.codigo_equipo ? ` (${equipo.codigo_equipo})` : ''}` : 'Seleccionar equipo';
  };

  const getTipoName = () => {
    const tipo = tiposMantenimientoList.find(t => t.tipo_id === selectedTipoMantenimientoId);
    return tipo ? tipo.nombre_tipo : 'Seleccionar tipo';
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
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowPrioridadModal(true)}
              disabled={loading}
            >
              <Text style={[
                styles.selectorText, 
                selectedPrioridadId ? {} : { color: colors.textMuted }
              ]}>
                {getPrioridadName()}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Equipo */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Equipo (Opcional)</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowEquipoModal(true)}
              disabled={loading}
            >
              <Text style={[
                styles.selectorText, 
                selectedEquipoId ? {} : { color: colors.textMuted }
              ]}>
                {getEquipoName()}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Tipo de Mantenimiento */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tipo de Mantenimiento (Opcional)</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowTipoModal(true)}
              disabled={loading}
            >
              <Text style={[
                styles.selectorText, 
                selectedTipoMantenimientoId ? {} : { color: colors.textMuted }
              ]}>
                {getTipoName()}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
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

      {/* Modal de Selección de Prioridad */}
      <Modal
        visible={showPrioridadModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrioridadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Prioridad</Text>
            <ScrollView style={styles.modalScrollView}>
              {prioridadesList.map((prioridad) => (
                <TouchableOpacity
                  key={prioridad.id}
                  style={styles.modalOption}
                  onPress={() => handlePrioridadSelect(prioridad)}
                >
                  <Text style={styles.modalOptionText}>{prioridad.nombre}</Text>
                  <Text style={styles.modalOptionDescription}>{prioridad.descripcion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPrioridadModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Selección de Equipo */}
      <Modal
        visible={showEquipoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEquipoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Equipo</Text>
            <ScrollView style={styles.modalScrollView}>
              {equiposList.map((equipo) => (
                <TouchableOpacity
                  key={equipo.equipo_id}
                  style={styles.modalOption}
                  onPress={() => handleEquipoSelect(equipo)}
                >
                  <Text style={styles.modalOptionText}>
                    {equipo.nombre_equipo}
                    {equipo.codigo_equipo && (
                      <Text style={styles.equipoCode}> ({equipo.codigo_equipo})</Text>
                    )}
                  </Text>
                  {equipo.descripcion && (
                    <Text style={styles.equipoDescription}>{equipo.descripcion}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEquipoModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Selección de Tipo de Mantenimiento */}
      <Modal
        visible={showTipoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTipoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Tipo de Mantenimiento</Text>
            <ScrollView style={styles.modalScrollView}>
              {tiposMantenimientoList.map((tipo) => (
                <TouchableOpacity
                  key={tipo.tipo_id}
                  style={styles.modalOption}
                  onPress={() => handleTipoSelect(tipo)}
                >
                  <Text style={styles.modalOptionText}>{tipo.nombre_tipo}</Text>
                  {tipo.descripcion && (
                    <Text style={styles.tipoDescription}>{tipo.descripcion}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTipoModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  selectorButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    minHeight: 50,
  },

  selectorText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },

  selectorArrow: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  modalScrollView: {
    maxHeight: 300,
  },

  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginHorizontal: 20,
  },

  modalOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },

  modalOptionDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },

  modalCloseButton: {
    backgroundColor: colors.backgroundLight,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  modalCloseText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
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

  equipoCode: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  equipoDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  tipoDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
