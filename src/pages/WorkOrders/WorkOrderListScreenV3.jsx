import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../../styles';
import { supabase } from '../../services/supabase';

const WorkOrderListScreenV3 = ({ navigation }) => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Datos de ejemplo como fallback
  const sampleWorkOrders = [
    {
      id: 1,
      numero_ot: 'OT-2025-001',
      titulo: 'Mantenimiento preventivo - Bomba principal',
      estado: 'pendiente',
      prioridad: 'alta',
      fecha_programada: '2025-01-20',
      cliente: 'Cliente Demo'
    },
    {
      id: 2,
      numero_ot: 'OT-2025-002',
      titulo: 'Reparación sistema eléctrico',
      estado: 'en_progreso',
      prioridad: 'media',
      fecha_programada: '2025-01-21',
      cliente: 'Cliente Demo'
    },
    {
      id: 3,
      numero_ot: 'OT-2025-003',
      titulo: 'Inspección mensual equipos',
      estado: 'completada',
      prioridad: 'baja',
      fecha_programada: '2025-01-19',
      cliente: 'Cliente Demo'
    }
  ];

  // Cargar órdenes cada vez que la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      loadWorkOrders();
    }, [])
  );

  const loadWorkOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Intentando cargar órdenes de trabajo desde Supabase...');
      
      // Cargar órdenes con JOINs para obtener datos relacionados según el esquema actualizado
      const { data, error } = await supabase
        .from('orden_trabajo')
        .select(`
          id,
          titulo,
          descripcion_corta,
          estado_id,
          prioridad_id,
          equipo_id,
          tipo_mantenimiento_id,
          fecha_inicio,
          fecha_estimada_fin,
          usuario_id,
          created_at,
          updated_at,
          activa
        `)
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando desde Supabase:', error);
        throw error;
      }

      console.log('Órdenes cargadas desde Supabase:', data?.length || 0);
      console.log('Datos básicos cargados:', data);
      
      if (data && data.length > 0) {
        // Cargar datos relacionados por separado para evitar problemas de JOIN
        const formattedOrders = await Promise.all(data.map(async (order) => {
          // Cargar estado
          const { data: estadoData } = await supabase
            .from('estados_orden_trabajo')
            .select('nombre')
            .eq('id', order.estado_id)
            .single();

          // Cargar prioridad
          const { data: prioridadData } = await supabase
            .from('prioridades')
            .select('nombre, nivel')
            .eq('id', order.prioridad_id)
            .single();

          // Cargar equipo si existe
          let equipoData = null;
          if (order.equipo_id) {
            const { data } = await supabase
              .from('equipo')
              .select('nombre_equipo, codigo_equipo')
              .eq('equipo_id', order.equipo_id)
              .single();
            equipoData = data;
          }

          // Cargar tipo de mantenimiento si existe
          let tipoData = null;
          if (order.tipo_mantenimiento_id) {
            const { data } = await supabase
              .from('tiposmantenimiento')
              .select('nombre_tipo')
              .eq('tipo_id', order.tipo_mantenimiento_id)
              .single();
            tipoData = data;
          }

          return {
            id: order.id,
            numero_ot: `OT-${order.id.substring(0, 8).toUpperCase()}`,
            titulo: order.titulo || 'Sin título',
            descripcion_corta: order.descripcion_corta,
            estado: estadoData?.nombre || 'Sin estado',
            estado_id: order.estado_id,
            prioridad: prioridadData?.nombre || 'Sin prioridad',
            prioridad_nivel: prioridadData?.nivel || 1,
            fecha_programada: order.fecha_inicio ? new Date(order.fecha_inicio).toISOString().split('T')[0] : null,
            fecha_estimada_fin: order.fecha_estimada_fin ? new Date(order.fecha_estimada_fin).toISOString().split('T')[0] : null,
            equipo: equipoData?.nombre_equipo || 'Sin equipo',
            equipo_codigo: equipoData?.codigo_equipo || null,
            tipo_mantenimiento: tipoData?.nombre_tipo || 'Sin tipo',
            created_at: order.created_at,
            updated_at: order.updated_at
          };
        }));
        
        console.log('Órdenes formateadas:', formattedOrders);
        setWorkOrders(formattedOrders);
      } else {
        // Si no hay datos reales, usar ejemplos
        console.log('No hay órdenes en Supabase, usando datos de ejemplo');
        setWorkOrders(sampleWorkOrders);
      }

    } catch (error) {
      console.error('Error completo:', error);
      setError(error.message);
      
      // En caso de error, mostrar datos de ejemplo
      console.log('Usando datos de ejemplo por error en Supabase');
      setWorkOrders(sampleWorkOrders);
      
      // Solo mostrar alert si es un error diferente a "no hay datos"
      if (error.message && !error.message.includes('no rows')) {
        Alert.alert(
          'Aviso', 
          'No se pudo conectar con el servidor. Mostrando datos de ejemplo.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkOrders();
    setRefreshing(false);
  };

  const getStatusColor = (estado) => {
    if (!estado) return colors.textMuted;
    
    // Normalizar el estado a minúsculas para comparación
    const estadoNormalizado = estado.toLowerCase().trim();
    
    switch (estadoNormalizado) {
      case 'pendiente':
      case 'creada':
      case 'nueva':
        return colors.warning;
      case 'en progreso':
      case 'en_progreso':
      case 'asignada':
      case 'iniciada':
        return colors.info;
      case 'completada':
      case 'terminada':
      case 'finalizada':
      case 'cerrada':
        return colors.success;
      case 'cancelada':
      case 'anulada':
      case 'rechazada':
        return colors.error;
      case 'pausada':
      case 'suspendida':
        return colors.textMuted;
      default: 
        console.log('Estado no reconocido:', estado);
        return colors.textMuted;
    }
  };

  const getPriorityColor = (prioridad) => {
    if (!prioridad) return colors.textMuted;
    
    // Normalizar la prioridad para comparación
    const prioridadNormalizada = prioridad.toLowerCase().trim();
    
    switch (prioridadNormalizada) {
      case 'alta':
      case 'crítica':
      case 'urgente':
        return colors.error;
      case 'media':
      case 'normal':
        return colors.warning;
      case 'baja':
        return colors.success;
      default: 
        return colors.textMuted;
    }
  };

  const handleCreateWorkOrder = () => {
    // Navegar a la pantalla de crear nueva orden de trabajo
    navigation.navigate('CreateWorkOrder');
  };

  const handleWorkOrderPress = (workOrder) => {
    // Navegar a la pantalla de detalles de la orden de trabajo
    navigation.navigate('WorkOrderDetail', { 
      orderId: workOrder.id,
      workOrder: workOrder // Pasamos también el objeto para mostrar mientras carga
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusDisplayName = (estado) => {
    if (!estado) return 'SIN ESTADO';
    
    const statusNames = {
      'pendiente': 'PENDIENTE',
      'en_progreso': 'EN PROGRESO',
      'completada': 'COMPLETADA',
      'cancelada': 'CANCELADA'
    };
    return statusNames[estado] || estado.toUpperCase();
  };

  const renderWorkOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.workOrderItem}
      onPress={() => handleWorkOrderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.workOrderHeader}>
        <Text style={styles.workOrderNumber}>{item.numero_ot}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{getStatusDisplayName(item.estado)}</Text>
        </View>
      </View>
      
      <Text style={styles.workOrderTitle} numberOfLines={2}>
        {item.titulo}
      </Text>
      
      {item.equipo && (
        <Text style={styles.equipmentText}>
          <Ionicons name="build-outline" size={12} color={colors.textMuted} />
          {' '}{item.equipo}
        </Text>
      )}
      
      <View style={styles.workOrderFooter}>
        <View style={styles.priorityContainer}>
          <Ionicons 
            name="flag" 
            size={14} 
            color={getPriorityColor(item.prioridad)} 
          />
          <Text style={[styles.priorityText, { color: getPriorityColor(item.prioridad) }]}>
            {item.prioridad ? item.prioridad.toUpperCase() : 'SIN PRIORIDAD'}
          </Text>
        </View>
        
        <Text style={styles.dateText}>{formatDate(item.fecha_programada)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="clipboard-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyText}>
        {error ? 'Error de conexión' : 'No hay órdenes de trabajo'}
      </Text>
      <Text style={styles.emptySubtext}>
        {error 
          ? 'Revisa tu conexión a internet' 
          : 'Presiona el botón + para crear una nueva'
        }
      </Text>
      {error && (
        <TouchableOpacity style={styles.retryButton} onPress={loadWorkOrders}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Cargando órdenes de trabajo...</Text>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes de Trabajo</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateWorkOrder}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading && workOrders.length === 0 ? (
        renderLoadingComponent()
      ) : (
        <FlatList
          data={workOrders}
          renderItem={renderWorkOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={workOrders.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  workOrderItem: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  workOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workOrderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  workOrderTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  equipmentText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  workOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default WorkOrderListScreenV3;
