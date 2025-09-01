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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { globalStyles, colors } from '../../styles';
import { supabase } from '../../services/supabase';

const WorkOrderListScreenSimple = () => {
  const navigation = useNavigation();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando órdenes de trabajo desde Supabase...');
      
      // Cargar órdenes básicas primero y luego los datos relacionados por separado
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
          activa
        `)
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando desde Supabase:', error);
        throw error;
      }

      console.log('Órdenes cargadas desde Supabase:', data?.length || 0);
      
      if (data && data.length > 0) {
        // Cargar datos relacionados por separado para cada orden
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
            fecha_programada: order.fecha_inicio,
            fecha_estimada_fin: order.fecha_estimada_fin,
            equipo: equipoData?.nombre_equipo || 'Sin equipo',
            equipo_codigo: equipoData?.codigo_equipo || null,
            tipo_mantenimiento: tipoData?.nombre_tipo || 'Sin tipo',
            created_at: order.created_at
          };
        }));
        
        setWorkOrders(formattedOrders);
      } else {
        setWorkOrders([]);
      }

    } catch (error) {
      console.error('Error completo:', error);
      setError(error.message);
      setWorkOrders([]);
      
      Alert.alert(
        'Error', 
        'No se pudo cargar las órdenes de trabajo. Verifique su conexión.',
        [{ text: 'OK' }]
      );
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
        return colors.danger;
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
        return colors.danger;
      case 'media':
      case 'normal':
        return colors.warning;
      case 'baja':
        return colors.success;
      default: 
        return colors.textMuted;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleWorkOrderPress = (orderId) => {
    navigation.navigate('WorkOrderDetail', { orderId });
  };

  const handleCreateWorkOrder = () => {
    navigation.navigate('CreateWorkOrder');
  };

  const renderWorkOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.workOrderCard}
      onPress={() => handleWorkOrderPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.numeroOT}>{item.numero_ot}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
      </View>
      
      <Text style={styles.workOrderTitle} numberOfLines={2}>
        {item.titulo}
      </Text>
      
      {item.descripcion_corta && (
        <Text style={styles.workOrderDescription} numberOfLines={2}>
          {item.descripcion_corta}
        </Text>
      )}
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="build-outline" size={16} color={colors.textMuted} />
          <Text style={styles.detailText}>{item.equipo}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
          <Text style={styles.detailText}>{formatDate(item.fecha_programada)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="flag-outline" size={16} color={getPriorityColor(item.prioridad)} />
          <Text style={[styles.detailText, { color: getPriorityColor(item.prioridad) }]}>
            {item.prioridad}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Órdenes de Trabajo</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando órdenes...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

      {workOrders.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No hay órdenes de trabajo</Text>
          <Text style={styles.emptyText}>
            Comienza creando tu primera orden de trabajo
          </Text>
          <TouchableOpacity 
            style={[globalStyles.button, styles.createFirstButton]}
            onPress={handleCreateWorkOrder}
          >
            <Text style={globalStyles.buttonText}>Crear Primera Orden</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workOrders}
          renderItem={renderWorkOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default WorkOrderListScreenSimple;

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
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  
  createFirstButton: {
    marginTop: 10,
  },
  
  listContainer: {
    padding: 16,
  },
  
  workOrderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  numeroOT: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  
  workOrderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  
  workOrderDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  
  cardDetails: {
    marginTop: 8,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  detailText: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 6,
    flex: 1,
  },
});
