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
      
      // Cargar todos los equipos sin filtro por ahora
      const { data, error } = await supabase
        .from('equipo')
        .select(`
          equipo_id,
          nombre_equipo,
          codigo_equipo,
          estado_operacional,
          activo
        `)
        .order('nombre_equipo', { ascending: true });

      if (error) {
        console.error('Error cargando equipos desde Supabase:', error);
        throw error;
      }

      console.log('Equipos cargados desde Supabase:', data?.length || 0);
      
      if (data && data.length > 0) {
        // Formatear datos para mostrar
        const formattedEquipment = data.map(equipo => ({
          id: equipo.equipo_id,
          equipo_id: equipo.equipo_id,
          nombre: equipo.nombre_equipo,
          codigo: equipo.codigo_equipo,
          estado_operacional: equipo.estado_operacional || 'Operativo',
          activo: equipo.activo
        }));
        setEquipment(formattedEquipment);
      } else {
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

  const handleCreateEquipment = () => {
    Alert.alert('Info', 'Funcionalidad de crear equipo próximamente');
  };

  const handleEquipmentPress = (equipmentId) => {
    Alert.alert('Info', `Seleccionado equipo: ${equipmentId}`);
  };

  const renderEquipmentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.equipmentCard}
      onPress={() => handleEquipmentPress(item.equipo_id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{item.nombre}</Text>
          {item.codigo && (
            <Text style={styles.equipmentCode}>{item.codigo}</Text>
          )}
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.estado_operacional}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && equipment.length === 0) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Equipos</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleCreateEquipment}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
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
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateEquipment}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {equipment.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No hay equipos registrados</Text>
          <Text style={styles.emptyText}>
            Comienza registrando tu primer equipo
          </Text>
          <TouchableOpacity 
            style={[globalStyles.button, styles.createFirstButton]}
            onPress={handleCreateEquipment}
          >
            <Text style={globalStyles.buttonText}>Registrar Primer Equipo</Text>
          </TouchableOpacity>
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
