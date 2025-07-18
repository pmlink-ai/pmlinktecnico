import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { globalStyles, colors } from '../styles';

export default function WorkOrdersScreen() {
  const navigation = useNavigation();
  
  // Estados del componente
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Función para obtener el usuario actual
  const getCurrentUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error obteniendo sesión:', error);
        return null;
      }
      return session?.user || null;
    } catch (error) {
      console.error('Error inesperado obteniendo usuario:', error);
      return null;
    }
  };

  // Función para cargar las órdenes de trabajo
  const fetchWorkOrders = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      // Obtener usuario actual
      const user = await getCurrentUser();
      if (!user) {
        setError('No se pudo obtener la información del usuario');
        return;
      }

      // Consulta simplificada a Supabase sin JOINs complejos
      const { data, error: queryError } = await supabase
        .from('orden_trabajo')
        .select(`
          id,
          titulo,
          descripcion_corta,
          descripcion_larga,
          created_at,
          fecha_inicio,
          fecha_estimada_fin,
          fecha_cierre,
          activa,
          estado_id,
          prioridad_id,
          tipo_mantenimiento_id,
          equipo_id
        `)
        .eq('usuario_id', user.id)
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('Error consultando órdenes de trabajo:', queryError);
        setError('Error al cargar las órdenes de trabajo');
        return;
      }

      // Obtener información adicional de las tablas relacionadas
      const orders = data || [];
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          // Obtener estado
          const { data: estado } = await supabase
            .from('estados_orden_trabajo')
            .select('id, nombre')
            .eq('id', order.estado_id)
            .single();

          // Obtener prioridad
          const { data: prioridad } = await supabase
            .from('prioridades')
            .select('id, nombre, nivel')
            .eq('id', order.prioridad_id)
            .single();

          // Obtener tipo de mantenimiento
          const { data: tipoMantenimiento } = await supabase
            .from('tiposmantenimiento')
            .select('tipo_id, nombre_tipo')
            .eq('tipo_id', order.tipo_mantenimiento_id)
            .single();

          return {
            ...order,
            estados_orden_trabajo: estado,
            prioridades: prioridad,
            tiposmantenimiento: tipoMantenimiento,
          };
        })
      );

      setOrders(enrichedOrders);
      
    } catch (error) {
      console.error('Error inesperado cargando órdenes:', error);
      setError('Error inesperado al cargar las órdenes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Función para obtener el color de prioridad
  const getPriorityColor = (priority) => {
    if (!priority) return colors.textMuted;
    
    switch (priority.nivel) {
      case 1:
        return colors.danger || '#dc3545'; // Alta
      case 2:
        return colors.warning || '#ffc107'; // Media
      case 3:
        return colors.success || '#28a745'; // Baja
      default:
        return colors.textMuted;
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status) => {
    if (!status) return colors.textMuted;
    
    const statusName = status.nombre?.toLowerCase();
    if (statusName?.includes('completado') || statusName?.includes('cerrado')) {
      return colors.success || '#28a745';
    } else if (statusName?.includes('progreso') || statusName?.includes('proceso')) {
      return colors.primary || '#007bff';
    } else if (statusName?.includes('pendiente')) {
      return colors.warning || '#ffc107';
    } else if (statusName?.includes('cancelado')) {
      return colors.danger || '#dc3545';
    }
    return colors.textMuted;
  };

  // Función para manejar la navegación al detalle
  const handleOrderPress = (order) => {
    console.log('Navegar a detalle de orden:', order.id);
    // Aquí se implementará la navegación al detalle
    // navigation.navigate('WorkOrderDetail', { orderId: order.id });
  };

  // Función para el pull-to-refresh
  const onRefresh = useCallback(() => {
    fetchWorkOrders(true);
  }, []);

  // Renderizar cada ítem de la lista
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle} numberOfLines={1}>
          {item.titulo}
        </Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.estados_orden_trabajo) }
          ]}>
            <Text style={styles.statusText}>
              {item.estados_orden_trabajo?.nombre || 'Sin estado'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.orderDescription} numberOfLines={2}>
        {item.descripcion_corta}
      </Text>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Prioridad:</Text>
          <Text style={[
            styles.detailValue,
            { color: getPriorityColor(item.prioridades) }
          ]}>
            {item.prioridades?.nombre || 'Sin prioridad'}
          </Text>
        </View>

        {item.tiposmantenimiento && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipo:</Text>
            <Text style={styles.detailValue}>
              {item.tiposmantenimiento.nombre_tipo}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Creado:</Text>
          <Text style={styles.detailValue}>
            {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Componente para lista vacía
  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No tienes órdenes de trabajo asignadas.
      </Text>
      <Text style={styles.emptySubtext}>
        Las nuevas órdenes aparecerán aquí cuando sean asignadas.
      </Text>
    </View>
  );

  // Componente para mostrar error
  const ErrorComponent = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchWorkOrders()}
      >
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  // Hook useEffect para cargar datos al montar el componente
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Órdenes de Trabajo</Text>
      </View>

      {error && !loading ? (
        <ErrorComponent />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={!loading ? ListEmptyComponent : null}
        />
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando órdenes...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },

  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  orderItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
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

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },

  statusContainer: {
    alignItems: 'flex-end',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
  },

  orderDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },

  orderDetails: {
    gap: 4,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    width: 60,
  },

  detailValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
});
