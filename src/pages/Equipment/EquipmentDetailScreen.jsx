import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../../styles';
import { supabase } from '../../services/supabase';

const EquipmentDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { equipmentId } = route.params;
  
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-refresh cuando la pantalla gana foco
  useFocusEffect(
    React.useCallback(() => {
      loadEquipmentDetail();
    }, [equipmentId])
  );

  const loadEquipmentDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando detalle del equipo:', equipmentId);
      
      const { data, error } = await supabase
        .from('equipo')
        .select(`
          equipo_id,
          local_id,
          nombre_equipo,
          codigo_equipo,
          descripcion,
          marca,
          modelo,
          numero_serie,
          fecha_adquisicion,
          vida_util_estimada,
          estado_operacional,
          ubicacion_especifica,
          ultimo_mantenimiento,
          proximo_mantenimiento_programado,
          activo
        `)
        .eq('equipo_id', equipmentId)
        .single();

      if (error) {
        console.error('Error cargando detalle del equipo:', error);
        throw error;
      }

      if (data) {
        const formattedEquipment = {
          id: data.equipo_id,
          equipo_id: data.equipo_id,
          local_id: data.local_id,
          nombre: data.nombre_equipo,
          codigo: data.codigo_equipo,
          descripcion: data.descripcion,
          marca: data.marca,
          modelo: data.modelo,
          numero_serie: data.numero_serie,
          fecha_adquisicion: data.fecha_adquisicion,
          vida_util_estimada: data.vida_util_estimada,
          estado_operacional: data.estado_operacional || 'Operativo',
          ubicacion: data.ubicacion_especifica,
          ultimo_mantenimiento: data.ultimo_mantenimiento,
          proximo_mantenimiento: data.proximo_mantenimiento_programado,
          activo: data.activo
        };
        setEquipment(formattedEquipment);
      }

    } catch (error) {
      console.error('Error completo:', error);
      setError(error.message);
      
      Alert.alert(
        'Error', 
        'No se pudo cargar el detalle del equipo.',
        [
          { text: 'Reintentar', onPress: loadEquipmentDetail },
          { text: 'Volver', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    if (!estado) return colors.textMuted;
    
    const estadoNormalizado = estado.toLowerCase().trim();
    
    switch (estadoNormalizado) {
      case 'operativo':
      case 'funcionando':
        return colors.success;
      case 'en mantenimiento':
      case 'mantenimiento':
        return colors.warning;
      case 'fuera de servicio':
      case 'averiado':
      case 'dañado':
        return colors.error;
      case 'en reparación':
      case 'reparacion':
        return colors.info;
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalle del Equipo</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando detalle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!equipment) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Equipo no encontrado</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Equipo no encontrado</Text>
          <Text style={styles.errorText}>
            El equipo que busca no existe o ha sido eliminado.
          </Text>
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
        <Text style={styles.title}>Detalle del Equipo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información Principal */}
        <View style={styles.section}>
          <View style={styles.mainInfo}>
            <Text style={styles.equipmentName}>{equipment.nombre}</Text>
            {equipment.codigo && (
              <Text style={styles.equipmentCode}>{equipment.codigo}</Text>
            )}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(equipment.estado_operacional) }]}>
              <Text style={styles.statusText}>{equipment.estado_operacional}</Text>
            </View>
          </View>
          
          {equipment.descripcion && (
            <Text style={styles.description}>{equipment.descripcion}</Text>
          )}
        </View>

        {/* Información Técnica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Técnica</Text>
          <View style={styles.infoGrid}>
            {equipment.marca && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Marca</Text>
                <Text style={styles.infoValue}>{equipment.marca}</Text>
              </View>
            )}
            
            {equipment.modelo && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Modelo</Text>
                <Text style={styles.infoValue}>{equipment.modelo}</Text>
              </View>
            )}
            
            {equipment.numero_serie && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Número de Serie</Text>
                <Text style={styles.infoValue}>{equipment.numero_serie}</Text>
              </View>
            )}
            
            {equipment.ubicacion && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoValue}>{equipment.ubicacion}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Información de Adquisición */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Adquisición</Text>
          <View style={styles.infoGrid}>
            {equipment.fecha_adquisicion && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de Adquisición</Text>
                <Text style={styles.infoValue}>{formatDate(equipment.fecha_adquisicion)}</Text>
              </View>
            )}
            
            {equipment.vida_util_estimada && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Vida Útil Estimada</Text>
                <Text style={styles.infoValue}>{equipment.vida_util_estimada} años</Text>
              </View>
            )}
          </View>
        </View>

        {/* Información de Mantenimiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Mantenimiento</Text>
          <View style={styles.infoGrid}>
            {equipment.ultimo_mantenimiento && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Último Mantenimiento</Text>
                <Text style={styles.infoValue}>{formatDateTime(equipment.ultimo_mantenimiento)}</Text>
              </View>
            )}
            
            {equipment.proximo_mantenimiento && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Próximo Mantenimiento</Text>
                <Text style={[
                  styles.infoValue,
                  { color: new Date(equipment.proximo_mantenimiento) < new Date() ? colors.error : colors.warning }
                ]}>
                  {formatDateTime(equipment.proximo_mantenimiento)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Estado del Equipo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del Equipo</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={[styles.infoValue, { color: equipment.activo ? colors.success : colors.error }]}>
                {equipment.activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EquipmentDetailScreen;

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
  
  backButton: {
    padding: 4,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  
  headerSpacer: {
    width: 40,
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
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  
  errorText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  content: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  
  section: {
    backgroundColor: colors.white,
    marginBottom: 12,
    padding: 20,
  },
  
  mainInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  equipmentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  equipmentCode: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  
  infoGrid: {
    gap: 16,
  },
  
  infoItem: {
    marginBottom: 12,
  },
  
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
});
