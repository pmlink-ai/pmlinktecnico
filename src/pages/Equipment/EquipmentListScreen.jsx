import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../../styles';
import { supabase } from '../../services/supabase';

const EquipmentListScreen = () => {
  const navigation = useNavigation();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-refresh cuando la pantalla gana foco
  useFocusEffect(
    React.useCallback(() => {
      loadEquipment();
    }, [])
  );

  const loadEquipment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cargando equipos desde Supabase...');
      
      // Cargar todos los equipos con todos los campos
      const { data, error } = await supabase
        .from('equipo')
        .select(`
          equipo_id,
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
        .eq('activo', true)
        .order('nombre_equipo', { ascending: true });

      if (error) {
        console.error('Error cargando equipos desde Supabase:', error);
        throw error;
      }

      console.log('Equipos cargados desde Supabase:', data?.length || 0);
      console.log('Datos completos de equipos:', JSON.stringify(data, null, 2));
      
      if (data && data.length > 0) {
        console.log('Datos de equipos:', data);
        setEquipment(data); // Usar los datos directamente sin reformatear
      } else {
        console.log('No se encontraron equipos activos');
        setEquipment([]);
      }

    } catch (error) {
      console.error('Error completo:', error);
      setError(error.message);
      setEquipment([]);
      
      Alert.alert(
        'Error', 
        'No se pudo cargar los equipos. Verifique su conexión.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentPress = (equipmentId) => {
    navigation.navigate('EquipmentDetail', { equipmentId });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'operativo':
        return '#4CAF50'; // Verde
      case 'en mantenimiento':
        return '#FF9800'; // Naranja
      case 'fuera de servicio':
        return '#F44336'; // Rojo
      case 'en reparacion':
        return '#FF5722'; // Rojo-naranja
      default:
        return '#9E9E9E'; // Gris
    }
  };

  const renderEquipmentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.equipmentCard}
      onPress={() => handleEquipmentPress(item.equipo_id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{item.nombre_equipo}</Text>
          {item.codigo_equipo && (
            <Text style={styles.equipmentCode}>{item.codigo_equipo}</Text>
          )}
          {item.marca && item.modelo && (
            <Text style={styles.equipmentDetails}>{item.marca} - {item.modelo}</Text>
          )}
          {item.ubicacion_especifica && (
            <Text style={styles.equipmentLocation}>📍 {item.ubicacion_especifica}</Text>
          )}
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.estado_operacional) }
        ]}>
          <Text style={styles.statusText}>{item.estado_operacional}</Text>
        </View>
      </View>
      
      {item.descripcion && (
        <Text style={styles.equipmentDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>
      )}
      
      <View style={styles.cardFooter}>
        {item.numero_serie && (
          <Text style={styles.serialNumber}>S/N: {item.numero_serie}</Text>
        )}
        {item.ultimo_mantenimiento && (
          <Text style={styles.lastMaintenance}>
            Último: {new Date(item.ultimo_mantenimiento).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && equipment.length === 0) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Equipos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando equipos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Equipos</Text>
      </View>

      {equipment.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No hay equipos registrados</Text>
          <Text style={styles.emptyText}>
            No se encontraron equipos en la base de datos
          </Text>
        </View>
      ) : (
        <FlatList
          data={equipment}
          renderItem={renderEquipmentItem}
          keyExtractor={(item) => item.equipo_id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  
  listContainer: {
    padding: 16,
  },
  
  equipmentCard: {
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
  
  equipmentInfo: {
    flex: 1,
  },
  
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  
  equipmentCode: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },

  equipmentDetails: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  equipmentLocation: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  equipmentDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 18,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  serialNumber: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },

  lastMaintenance: {
    fontSize: 12,
    color: colors.textMuted,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
});

export default EquipmentListScreen;
