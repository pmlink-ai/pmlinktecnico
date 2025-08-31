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
  Modal,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { globalStyles, colors } from '../../styles';
import CustomDatePickerIOS from '../../components/CustomDatePickerIOS';

export default function EditWorkOrderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workOrder, orderId } = route.params;

  // Estados del formulario - inicializar con datos existentes
  const [titulo, setTitulo] = useState(workOrder?.titulo || '');
  const [descripcionCorta, setDescripcionCorta] = useState(workOrder?.descripcion_corta || '');
  const [descripcionLarga, setDescripcionLarga] = useState(workOrder?.descripcion_larga || '');
  const [selectedEstadoId, setSelectedEstadoId] = useState(workOrder?.estado_id?.toString() || '');
  const [selectedPrioridadId, setSelectedPrioridadId] = useState(workOrder?.prioridad_id?.toString() || '');
  const [selectedEquipoId, setSelectedEquipoId] = useState(workOrder?.equipo_id || '');
  const [selectedTipoMantenimientoId, setSelectedTipoMantenimientoId] = useState(workOrder?.tipo_mantenimiento_id || '');
  const [fechaInicio, setFechaInicio] = useState(workOrder?.fecha_inicio ? new Date(workOrder.fecha_inicio) : new Date());
  const [fechaEstimadaFin, setFechaEstimadaFin] = useState(workOrder?.fecha_estimada_fin ? new Date(workOrder.fecha_estimada_fin) : new Date());

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
  const [showEstadoModal, setShowEstadoModal] = useState(false);
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

      console.log('Cargando datos del formulario de edición...');

      // Cargar estados desde Supabase
      const { data: estadosData, error: estadosError } = await supabase
        .from('estados_orden_trabajo')
        .select('id, nombre, descripcion')
        .order('orden', { ascending: true });

      if (estadosError) {
        console.error('Error al cargar estados:', estadosError);
        setEstadosList([
          { id: 1, nombre: 'Pendiente' },
          { id: 2, nombre: 'En Progreso' },
          { id: 3, nombre: 'Completada' },
          { id: 4, nombre: 'Cancelada' }
        ]);
      } else {
        console.log('Estados cargados:', estadosData);
        setEstadosList(estadosData || []);
      }

      // Cargar prioridades directamente desde Supabase
      const { data: prioridadesData, error: prioridadesError } = await supabase
        .from('prioridades')
        .select('id, nombre, nivel, descripcion')
        .order('nivel', { ascending: true });

      if (prioridadesError) {
        console.error('Error al cargar prioridades:', prioridadesError);
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

      // Cargar tipos de mantenimiento desde Supabase
      const { data: tiposData, error: tiposError } = await supabase
        .from('tiposmantenimiento')
        .select('tipo_id, nombre_tipo, descripcion')
        .eq('activo', true)
        .order('nombre_tipo', { ascending: true });

      if (tiposError) {
        console.error('Error al cargar tipos de mantenimiento:', tiposError);
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

    } catch (error) {
      console.error('Error al cargar datos del formulario:', error);
      setError('Error inesperado al cargar los datos');
      
      // Usar todos los datos de fallback en caso de error
      setEstadosList([
        { id: 1, nombre: 'Pendiente' },
        { id: 2, nombre: 'En Progreso' }
      ]);
      setPrioridadesList([
        { id: 1, nombre: 'Baja', nivel: 1 },
        { id: 2, nombre: 'Media', nivel: 2 },
        { id: 3, nombre: 'Alta', nivel: 3 },
        { id: 4, nombre: 'Crítica', nivel: 4 }
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

  const handleDateChangeInicio = (event, selectedDate) => {
    // Para Android, cerrar el picker automáticamente
    if (Platform.OS === 'android') {
      setShowDatePickerInicio(false);
    }
    if (selectedDate) {
      setFechaInicio(selectedDate);
    }
  };

  const handleDateChangeFin = (event, selectedDate) => {
    // Para Android, cerrar el picker automáticamente
    if (Platform.OS === 'android') {
      setShowDatePickerFin(false);
    }
    if (selectedDate) {
      setFechaEstimadaFin(selectedDate);
    }
  };

  // Funciones específicas para iOS con CustomDatePicker
  const handleIOSDateSelectInicio = (selectedDate) => {
    setFechaInicio(selectedDate);
    setShowDatePickerInicio(false);
  };

  const handleIOSDateSelectFin = (selectedDate) => {
    setFechaEstimadaFin(selectedDate);
    setShowDatePickerFin(false);
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
    if (!selectedEstadoId) {
      setError('Debe seleccionar un estado');
      return false;
    }
    setError('');
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

      // Preparar datos para la actualización
      const updateData = {
        titulo: titulo.trim(),
        descripcion_corta: descripcionCorta.trim(),
        descripcion_larga: descripcionLarga.trim() || null,
        estado_id: parseInt(selectedEstadoId),
        prioridad_id: selectedPrioridadId ? parseInt(selectedPrioridadId) : null,
        equipo_id: selectedEquipoId || null,
        tipo_mantenimiento_id: selectedTipoMantenimientoId || null,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_estimada_fin: fechaEstimadaFin.toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Actualizando orden con datos:', updateData);

      // Actualizar orden de trabajo en Supabase
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orden_trabajo')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) {
        console.error('Error al actualizar orden:', updateError);
        setError(`Error al actualizar la orden: ${updateError.message}`);
        return;
      }

      console.log('Orden actualizada exitosamente:', updatedOrder);

      // Mostrar mensaje de éxito
      Alert.alert(
        'Éxito',
        'Orden de trabajo actualizada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navegar de regreso al detalle
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error al actualizar orden:', error);
      setError('Error inesperado al actualizar la orden de trabajo');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de selección para modales
  const handleEstadoSelect = (estado) => {
    setSelectedEstadoId(estado.id.toString());
    setShowEstadoModal(false);
  };

  const handlePrioridadSelect = (prioridad) => {
    setSelectedPrioridadId(prioridad.id.toString());
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

  // Funciones para obtener nombres de elementos seleccionados
  const getEstadoName = () => {
    const estado = estadosList.find(e => e.id.toString() === selectedEstadoId);
    return estado ? estado.nombre : 'Seleccionar estado';
  };

  const getPrioridadName = () => {
    const prioridad = prioridadesList.find(p => p.id.toString() === selectedPrioridadId);
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

  if (loadingData) {
    return (
      <SafeAreaView style={globalStyles.container}>
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
        <Text style={styles.headerTitle}>Editar Orden de Trabajo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Modifique los campos necesarios para actualizar la orden
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Título */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ingrese el título de la orden"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Descripción Corta */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción Corta *</Text>
            <TextInput
              style={styles.input}
              value={descripcionCorta}
              onChangeText={setDescripcionCorta}
              placeholder="Descripción breve del trabajo"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Descripción Larga */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción Detallada</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcionLarga}
              onChangeText={setDescripcionLarga}
              placeholder="Descripción detallada del trabajo a realizar"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Estado */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowEstadoModal(true)}
            >
              <Text style={[styles.selectorText, selectedEstadoId ? {} : styles.placeholderText]}>
                {getEstadoName()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Prioridad */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prioridad *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowPrioridadModal(true)}
            >
              <Text style={[styles.selectorText, selectedPrioridadId ? {} : styles.placeholderText]}>
                {getPrioridadName()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Equipo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Equipo</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowEquipoModal(true)}
            >
              <Text style={[styles.selectorText, selectedEquipoId ? {} : styles.placeholderText]}>
                {getEquipoName()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Tipo de Mantenimiento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Mantenimiento</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowTipoModal(true)}
            >
              <Text style={[styles.selectorText, selectedTipoMantenimientoId ? {} : styles.placeholderText]}>
                {getTipoName()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Fecha de Inicio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Inicio</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePickerInicio(true)}
            >
              <Text style={styles.dateText}>
                {fechaInicio.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Fecha Estimada de Fin */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha Estimada de Fin</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePickerFin(true)}
            >
              <Text style={styles.dateText}>
                {fechaEstimadaFin.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[globalStyles.button, styles.updateButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color={colors.white} style={styles.buttonIcon} />
                  <Text style={globalStyles.buttonText}>Actualizar Orden</Text>
                </>
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

      {/* DatePickers */}
      {/* iOS usa CustomDatePickerIOS, Android usa DateTimePicker nativo */}
      
      {/* DatePicker para Fecha de Inicio */}
      {Platform.OS === 'ios' ? (
        <CustomDatePickerIOS
          visible={showDatePickerInicio}
          onClose={() => setShowDatePickerInicio(false)}
          onSelectDate={handleIOSDateSelectInicio}
          currentDate={fechaInicio}
          title="Seleccionar Fecha de Inicio"
          mode="date"
        />
      ) : (
        showDatePickerInicio && (
          <DateTimePicker
            value={fechaInicio}
            mode="date"
            display="default"
            onChange={handleDateChangeInicio}
          />
        )
      )}

      {/* DatePicker para Fecha Estimada de Fin */}
      {Platform.OS === 'ios' ? (
        <CustomDatePickerIOS
          visible={showDatePickerFin}
          onClose={() => setShowDatePickerFin(false)}
          onSelectDate={handleIOSDateSelectFin}
          currentDate={fechaEstimadaFin}
          title="Seleccionar Fecha Estimada de Fin"
          mode="date"
        />
      ) : (
        showDatePickerFin && (
          <DateTimePicker
            value={fechaEstimadaFin}
            mode="date"
            display="default"
            onChange={handleDateChangeFin}
          />
        )
      )}

      {/* Modales de Selección */}
      {/* Modal de Estados */}
      <Modal
        visible={showEstadoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEstadoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Estado</Text>
            <ScrollView style={styles.modalScrollView}>
              {estadosList.map((estado) => (
                <TouchableOpacity
                  key={estado.id}
                  style={styles.modalOption}
                  onPress={() => handleEstadoSelect(estado)}
                >
                  <Text style={styles.modalOptionText}>{estado.nombre}</Text>
                  {estado.descripcion && (
                    <Text style={styles.modalOptionDescription}>{estado.descripcion}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEstadoModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Prioridades */}
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
                  {prioridad.descripcion && (
                    <Text style={styles.modalOptionDescription}>{prioridad.descripcion}</Text>
                  )}
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

      {/* Modal de Equipos */}
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
                    <Text style={styles.modalOptionDescription}>{equipo.descripcion}</Text>
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

      {/* Modal de Tipos de Mantenimiento */}
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
                    <Text style={styles.modalOptionDescription}>{tipo.descripcion}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },

  backButton: {
    padding: 5,
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 10,
  },

  headerSpacer: {
    width: 34, // Same as back button to center title
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  formContainer: {
    padding: 20,
  },

  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 30,
  },

  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    backgroundColor: colors.white,
  },

  selectorText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },

  placeholderText: {
    color: colors.textMuted,
  },

  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    backgroundColor: colors.white,
  },

  dateText: {
    fontSize: 16,
    color: colors.text,
  },

  buttonContainer: {
    marginTop: 30,
    gap: 15,
  },

  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
  },

  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonIcon: {
    marginRight: 8,
  },

  // Modal styles
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
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalScrollView: {
    maxHeight: 300,
  },

  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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

  equipoCode: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  modalCloseButton: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  modalCloseText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
