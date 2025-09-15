import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function OrdenesTrabajoScreen({ navigation }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Función para obtener órdenes de trabajo
  const fetchOrdenes = async () => {
    try {
      console.log('🔍 Obteniendo órdenes de trabajo...');
      
      const { data, error } = await supabase
        .from('ordenes_trabajo')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo órdenes:', error);
        Alert.alert('Error', 'No se pudieron cargar las órdenes de trabajo: ' + error.message);
        return;
      }

      console.log('✅ Órdenes obtenidas:', data?.length || 0);
      setOrdenes(data || []);
    } catch (error) {
      console.error('❌ Error de red:', error);
      Alert.alert('Error de Conexión', 'Verifique su conexión a internet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar órdenes al iniciar
  useEffect(() => {
    fetchOrdenes();
  }, []);

  // Función para refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchOrdenes();
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Función para obtener color según estado
  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return '#f39c12';
      case 'en_progreso': return '#3498db';
      case 'completada': return '#27ae60';
      case 'cancelada': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  // Función para obtener texto de estado
  const getStatusText = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'en_progreso': return 'En Progreso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado || 'Sin estado';
    }
  };

  // Renderizar cada orden de trabajo
  const renderOrden = (orden) => (
    <TouchableOpacity key={orden.id} style={styles.ordenItem}>
      <View style={styles.ordenHeader}>
        <Text style={styles.ordenId}>#{orden.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orden.estado) }]}>
          <Text style={styles.statusText}>{getStatusText(orden.estado)}</Text>
        </View>
      </View>
      
      <Text style={styles.ordenTitulo}>{orden.titulo || 'Sin título'}</Text>
      
      {orden.descripcion && (
        <Text style={styles.ordenDescripcion} numberOfLines={2}>
          {orden.descripcion}
        </Text>
      )}
      
      <View style={styles.ordenFooter}>
        <Text style={styles.ordenFecha}>
          📅 {formatDate(orden.created_at)}
        </Text>
        {orden.prioridad && (
          <Text style={styles.ordenPrioridad}>
            ⚡ {orden.prioridad}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Órdenes de Trabajo</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando órdenes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Órdenes de Trabajo</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
          />
        }
      >
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Total de órdenes: {ordenes.length}
          </Text>
        </View>

        {ordenes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>📋 No hay órdenes de trabajo</Text>
            <Text style={styles.emptyText}>
              No se encontraron órdenes en la base de datos.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>🔄 Actualizar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ordenesContainer}>
            {ordenes.map(renderOrden)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  refreshButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ordenesContainer: {
    paddingBottom: 20,
  },
  ordenItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ordenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ordenId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ordenTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  ordenDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
    lineHeight: 20,
  },
  ordenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ordenFecha: {
    fontSize: 14,
    color: '#95a5a6',
  },
  ordenPrioridad: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
  },
});