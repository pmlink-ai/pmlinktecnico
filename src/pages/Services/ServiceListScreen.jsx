import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../../styles';
import { supabase } from '../../services/supabase';

const ServiceListScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-refresh cuando la pantalla gana foco
  useFocusEffect(
    React.useCallback(() => {
      loadServices();
    }, [])
  );

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando servicios desde Supabase...');
      
      // Cargar todos los servicios activos con todos los campos
      const { data, error } = await supabase
        .from('servicios')
        .select(`
          servicio_id,
          local_id,
          nombre_servicio,
          descripcion,
          fecha_instalacion,
          fecha_ultimo_mantenimiento,
          periodicidad_mantenimiento_dias,
          qr_code_url,
          activo,
          created_at,
          updated_at
        `)
        .eq('activo', true)
        .order('nombre_servicio', { ascending: true });

      if (error) {
        console.error('Error cargando servicios desde Supabase:', error);
        throw error;
      }

      console.log('Servicios cargados desde Supabase:', data?.length || 0);
      console.log('Datos completos de servicios:', JSON.stringify(data, null, 2));
      
      if (data && data.length > 0) {
        console.log('Datos de servicios:', data);
        setServices(data); // Usar los datos directamente
      } else {
        console.log('No se encontraron servicios activos');
        setServices([]);
      }

    } catch (error) {
      console.error('Error cargando servicios:', error);
      setError(error.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServicePress = (serviceId) => {
    navigation.navigate('ServiceDetail', { serviceId });
  };

  const getMaintenanceStatus = (lastMaintenance, periodDays) => {
    if (!lastMaintenance || !periodDays) {
      return { status: 'Sin programar', color: colors.textMuted, icon: 'help-circle' };
    }

    const lastMaintenanceDate = new Date(lastMaintenance);
    const today = new Date();
    const daysSinceLastMaintenance = Math.floor((today - lastMaintenanceDate) / (1000 * 60 * 60 * 24));
    const daysUntilNext = periodDays - daysSinceLastMaintenance;

    if (daysUntilNext < 0) {
      return { 
        status: `Vencido (${Math.abs(daysUntilNext)} días)`, 
        color: colors.error, 
        icon: 'alert-circle' 
      };
    } else if (daysUntilNext <= 7) {
      return { 
        status: `Próximo (${daysUntilNext} días)`, 
        color: colors.warning, 
        icon: 'warning' 
      };
    } else {
      return { 
        status: `Al día (${daysUntilNext} días)`, 
        color: colors.success, 
        icon: 'checkmark-circle' 
      };
    }
  };

  const renderServiceItem = ({ item }) => {
    const maintenanceStatus = getMaintenanceStatus(
      item.fecha_ultimo_mantenimiento, 
      item.periodicidad_mantenimiento_dias
    );

    return (
      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => handleServicePress(item.servicio_id)}
      >
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.nombre_servicio}</Text>
            <Text style={styles.serviceLocation}>Local ID: {item.local_id}</Text>
          </View>
          <View style={styles.serviceActions}>
            {item.qr_code_url && (
              <Ionicons name="qr-code" size={20} color={colors.primary} />
            )}
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </View>

        <View style={styles.serviceDetails}>
          <View style={styles.statusContainer}>
            <Ionicons 
              name={maintenanceStatus.icon} 
              size={16} 
              color={maintenanceStatus.color} 
            />
            <Text style={[styles.statusText, { color: maintenanceStatus.color }]}>
              {maintenanceStatus.status}
            </Text>
          </View>
          
          {item.descripcion && (
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {item.descripcion}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct" size={80} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No hay servicios</Text>
      <Text style={styles.emptySubtitle}>
        No se encontraron servicios activos en el sistema
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle" size={80} color={colors.error} />
      <Text style={styles.emptyTitle}>Error al cargar servicios</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadServices}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Servicios</Text>
        <Text style={styles.headerSubtitle}>
          {services.length} servicio{services.length !== 1 ? 's' : ''} encontrado{services.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.servicio_id}
        contentContainerStyle={services.length === 0 ? styles.emptyListContainer : styles.listContainer}
        ListEmptyComponent={error ? renderErrorState : renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadServices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  serviceItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  serviceLocation: {
    fontSize: 14,
    color: colors.textMuted,
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceDetails: {
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServiceListScreen;
