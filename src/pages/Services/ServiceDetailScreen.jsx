import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { globalStyles, colors } from '../../styles';
import { supabase } from '../../services/supabase';

const ServiceDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceId } = route.params;
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServiceDetail();
  }, [serviceId]);

  const loadServiceDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando detalle del servicio:', serviceId);
      
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
        .eq('servicio_id', serviceId)
        .single();

      if (error) {
        console.error('Error cargando detalle del servicio:', error);
        throw error;
      }

      console.log('Detalle del servicio cargado:', data);
      setService(data);

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada';
    
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateNextMaintenance = (lastMaintenance, periodDays) => {
    if (!lastMaintenance || !periodDays) return 'No programado';
    
    const lastDate = new Date(lastMaintenance);
    const nextDate = new Date(lastDate.getTime() + (periodDays * 24 * 60 * 60 * 1000));
    
    return formatDate(nextDate.toISOString());
  };

  const renderDetailRow = (label, value, icon) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.detailLabelText}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value || 'No especificado'}</Text>
    </View>
  );

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando detalle del servicio...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle" size={80} color={colors.error} />
        <Text style={styles.errorTitle}>Error al cargar el servicio</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadServiceDetail}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.errorContainer]}>
        <Ionicons name="document" size={80} color={colors.textMuted} />
        <Text style={styles.errorTitle}>Servicio no encontrado</Text>
        <Text style={styles.errorMessage}>El servicio solicitado no existe o ha sido eliminado.</Text>
      </SafeAreaView>
    );
  }

  const maintenanceStatus = getMaintenanceStatus(
    service.fecha_ultimo_mantenimiento,
    service.periodicidad_mantenimiento_dias
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header del servicio */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.serviceName}>{service.nombre_servicio}</Text>
            {service.local_id && (
              <Text style={styles.serviceLocation}>Local: {service.local_id}</Text>
            )}
          </View>
          
          <View style={styles.statusBadge}>
            <Ionicons 
              name={maintenanceStatus.icon} 
              size={18} 
              color={maintenanceStatus.color} 
            />
            <Text style={[styles.statusText, { color: maintenanceStatus.color }]}>
              {maintenanceStatus.status}
            </Text>
          </View>
        </View>

        {/* Información básica */}
        {renderSection('Información General', (
          <View>
            {renderDetailRow('ID del Servicio', service.servicio_id, 'finger-print')}
            {service.local_id && renderDetailRow('ID del Local', service.local_id, 'business')}
            {service.descripcion && renderDetailRow('Descripción', service.descripcion, 'document-text')}
            {renderDetailRow('Estado', service.activo ? 'Activo' : 'Inactivo', 'checkmark-circle')}
          </View>
        ))}

        {/* Fechas importantes */}
        {renderSection('Fechas', (
          <View>
            {renderDetailRow('Fecha de Instalación', formatDate(service.fecha_instalacion), 'calendar')}
            {renderDetailRow('Último Mantenimiento', formatDateTime(service.fecha_ultimo_mantenimiento), 'time')}
            {renderDetailRow(
              'Próximo Mantenimiento', 
              calculateNextMaintenance(service.fecha_ultimo_mantenimiento, service.periodicidad_mantenimiento_dias), 
              'calendar-outline'
            )}
          </View>
        ))}

        {/* Información de mantenimiento */}
        {renderSection('Mantenimiento', (
          <View>
            {renderDetailRow(
              'Periodicidad', 
              service.periodicidad_mantenimiento_dias ? `${service.periodicidad_mantenimiento_dias} días` : 'No definida', 
              'refresh'
            )}
            {service.qr_code_url && renderDetailRow('Código QR', 'Disponible', 'qr-code')}
          </View>
        ))}

        {/* Metadatos */}
        {renderSection('Metadatos', (
          <View>
            {renderDetailRow('Fecha de Creación', formatDateTime(service.created_at), 'add-circle')}
            {renderDetailRow('Última Actualización', formatDateTime(service.updated_at), 'create')}
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
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
  header: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerContent: {
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  serviceLocation: {
    fontSize: 16,
    color: colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 12,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  detailLabelText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textMuted,
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
});

export default ServiceDetailScreen;
