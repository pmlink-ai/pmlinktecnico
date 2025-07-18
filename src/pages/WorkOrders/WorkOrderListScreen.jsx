import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import WorkOrderService from '../../services/WorkOrderService';
import { globalStyles, colors } from '../../styles';

export default function WorkOrderListScreen() {
  const navigation = useNavigation();

  // Estados principales
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Estados de filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todas');

  // Filtros disponibles
  const filters = ['Todas', 'Pendiente', 'En Progreso', 'Completada', 'Cancelada'];

  // Cargar órdenes de trabajo
  const loadWorkOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { data, error: serviceError } = await WorkOrderService.getWorkOrdersByClient(user.id);

      if (serviceError) {
        setError(serviceError.message);
        return;
      }

      setWorkOrders(data);
      applyFilters(data, searchQuery, activeFilter);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setError('Error inesperado al cargar las órdenes de trabajo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Aplicar filtros y búsqueda
  const applyFilters = (orders, query, filter) => {
    let filtered = [...orders];

    // Aplicar filtro por estado
    if (filter !== 'Todas') {
      filtered = filtered.filter(order => 
        order.estados_orden_trabajo?.nombre === filter
      );
    }

    // Aplicar búsqueda por texto
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(order =>
        order.titulo?.toLowerCase().includes(searchTerm) ||
        order.descripcion_corta?.toLowerCase().includes(searchTerm) ||
        order.equipo?.nombre_equipo?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredWorkOrders(filtered);
  };

  // Effect para cargar datos inicialmente y al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadWorkOrders();
    }, [])
  );

  // Effect para aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters(workOrders, searchQuery, activeFilter);
  }, [searchQuery, activeFilter, workOrders]);

  // Manejar refresh
  const handleRefresh = () => {
    loadWorkOrders(true);
  };

  // Manejar cambio de búsqueda
  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  // Manejar cambio de filtro
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Navegar a detalles de orden
  const navigateToDetail = (orderId) => {
    navigation.navigate('WorkOrderDetail', { orderId });
  };

  // Navegar a crear nueva orden
  const navigateToCreate = () => {
    navigation.navigate('CreateWorkOrder');
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener color por prioridad
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return colors.danger;
      case 'media':
        return colors.warning;
      case 'baja':
        return colors.success;
      default:
        return colors.textMuted;
    }
  };

  // Obtener color por estado
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return colors.warning;
      case 'en progreso':
        return colors.info;
      case 'completada':
        return colors.success;
      case 'cancelada':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  // Renderizar ítem de orden de trabajo
  const renderWorkOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workOrderCard}
      onPress={() => navigateToDetail(item.orden_trabajo_id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.workOrderTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.estados_orden_trabajo?.nombre) }
          ]}>
            <Text style={styles.statusText}>
              {item.estados_orden_trabajo?.nombre || 'Sin estado'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.workOrderDescription} numberOfLines={2}>
        {item.descripcion_corta}
      </Text>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="construct-outline" size={16} color={colors.textMuted} />
          <Text style={styles.detailText}>
            {item.equipo?.nombre_equipo || 'Sin equipo'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="flag-outline" size={16} color={getPriorityColor(item.prioridades?.nombre)} />
          <Text style={[
            styles.detailText,
            { color: getPriorityColor(item.prioridades?.nombre) }
          ]}>
            {item.prioridades?.nombre || 'Sin prioridad'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="build-outline" size={16} color={colors.textMuted} />
          <Text style={styles.detailText}>
            {item.tiposmantenimiento?.nombre_tipo || 'Sin tipo'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Creada: {formatDate(item.created_at)}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  // Renderizar filtro
  const renderFilter = (filter) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => handleFilterChange(filter)}
    >
      <Text style={[
        styles.filterText,
        activeFilter === filter && styles.activeFilterText
      ]}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  // Componente de lista vacía
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No hay órdenes de trabajo</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || activeFilter !== 'Todas' 
          ? 'No se encontraron órdenes que coincidan con los filtros'
          : 'Crea tu primera orden de trabajo'
        }
      </Text>
      {!searchQuery && activeFilter === 'Todas' && (
        <TouchableOpacity
          style={[globalStyles.button, styles.createFirstButton]}
          onPress={navigateToCreate}
        >
          <Text style={globalStyles.buttonText}>Crear Primera Orden</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando órdenes de trabajo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={globalStyles.title}>Órdenes de Trabajo</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={navigateToCreate}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título, descripción o equipo..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={filters}
            renderItem={({ item }) => renderFilter(item)}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>

        {/* Mensaje de error */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadWorkOrders()}
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Lista de órdenes */}
        <FlatList
          data={filteredWorkOrders}
          renderItem={renderWorkOrderItem}
          keyExtractor={(item) => item.orden_trabajo_id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={EmptyListComponent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },

  clearSearchButton: {
    marginLeft: 10,
  },

  filtersContainer: {
    paddingBottom: 15,
  },

  filtersList: {
    paddingHorizontal: 20,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },

  activeFilterText: {
    color: colors.white,
  },

  errorContainer: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },

  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },

  retryButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },

  retryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },

  listContainer: {
    padding: 20,
    flexGrow: 1,
  },

  workOrderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  workOrderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 10,
  },

  statusContainer: {
    alignItems: 'flex-end',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },

  workOrderDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },

  cardDetails: {
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  detailText: {
    marginLeft: 8,
    fontSize: 13,
    color: colors.textMuted,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
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

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  createFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
