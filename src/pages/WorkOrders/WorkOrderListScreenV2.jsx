import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../../styles';

const WorkOrderListScreenV2 = ({ navigation }) => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Datos de ejemplo para evitar dependencias de Supabase por ahora
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

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    setLoading(true);
    try {
      // Simulamos una carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkOrders(sampleWorkOrders);
    } catch (error) {
      console.error('Error loading work orders:', error);
      Alert.alert('Error', 'No se pudieron cargar las órdenes de trabajo');
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
    switch (estado) {
      case 'pendiente': return colors.warning;
      case 'en_progreso': return colors.info;
      case 'completada': return colors.success;
      default: return colors.textMuted;
    }
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return colors.error;
      case 'media': return colors.warning;
      case 'baja': return colors.success;
      default: return colors.textMuted;
    }
  };

  const handleCreateWorkOrder = () => {
    Alert.alert('Crear OT', 'Funcionalidad en desarrollo');
  };

  const handleWorkOrderPress = (workOrder) => {
    Alert.alert('Ver Detalles', `OT: ${workOrder.numero_ot}\n${workOrder.titulo}`);
  };

  const renderWorkOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.workOrderItem}
      onPress={() => handleWorkOrderPress(item)}
    >
      <View style={styles.workOrderHeader}>
        <Text style={styles.workOrderNumber}>{item.numero_ot}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{item.estado.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.workOrderTitle} numberOfLines={2}>
        {item.titulo}
      </Text>
      
      <View style={styles.workOrderFooter}>
        <View style={styles.priorityContainer}>
          <Ionicons 
            name="flag" 
            size={14} 
            color={getPriorityColor(item.prioridad)} 
          />
          <Text style={[styles.priorityText, { color: getPriorityColor(item.prioridad) }]}>
            {item.prioridad.toUpperCase()}
          </Text>
        </View>
        
        <Text style={styles.dateText}>{item.fecha_programada}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="clipboard-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyText}>No hay órdenes de trabajo</Text>
      <Text style={styles.emptySubtext}>Presiona el botón + para crear una nueva</Text>
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

      <FlatList
        data={workOrders}
        renderItem={renderWorkOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={workOrders.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyComponent : null}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 12,
    lineHeight: 20,
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
  },
});

export default WorkOrderListScreenV2;
