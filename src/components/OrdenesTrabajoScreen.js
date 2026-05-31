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
  const [debugLines, setDebugLines] = useState([]);

  const addLog = (msg) => {
    console.log(msg);
    setDebugLines(prev => [...prev, msg]);
  };

  // Función para obtener órdenes de trabajo
  const fetchOrdenes = async () => {
    setDebugLines([]);
    try {
      // PASO 1: sesión activa
      addLog('PASO1: obteniendo sesión...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData?.session;
      addLog(`PASO1: session=${session ? 'OK uid=' + session.user?.id?.substring(0,8) : 'NULL'} err=${sessionError ? sessionError.message : 'ninguno'}`);

      if (!session) {
        addLog('PASO1: SIN SESION - no se consulta');
        setOrdenes([]);
        return;
      }

      // PASO 2: query directo
      addLog('PASO2: consultando orden_trabajo directo...');
      const { data: dataDirecto, error: errorDirecto } = await supabase
        .from('orden_trabajo')
        .select('id, activa')
        .limit(5);
      addLog(`PASO2: filas=${dataDirecto?.length ?? 'null'} err=${errorDirecto ? errorDirecto.code + ':' + errorDirecto.message : 'ninguno'}`);

      // PASO 3: RPC
      addLog('PASO3: llamando RPC get_ordenes_activas...');
      const { data, error } = await supabase.rpc('get_ordenes_activas');
      addLog(`PASO3: filas=${data?.length ?? 'null'} err=${error ? error.code + ':' + error.message : 'ninguno'}`);

      if (error) {
        addLog(`ERROR RPC: ${JSON.stringify(error)}`);
        return;
      }

      addLog(`PASO4: setOrdenes con ${data?.length || 0} ordenes`);
      setOrdenes(data || []);
    } catch (err) {
      addLog(`EXCEPCION: ${err?.message}`);
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
  const getStatusColor = (estadoObj) => {
    const estado = estadoObj?.nombre?.toLowerCase();
    switch (estado) {
      case 'pendiente': return '#f39c12';
      case 'en progreso': return '#3498db';
      case 'en_progreso': return '#3498db';
      case 'completada': return '#27ae60';
      case 'cancelada': return '#e74c3c';
      case 'asignada': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  // Función para obtener texto de estado
  const getStatusText = (estadoObj) => {
    const estado = estadoObj?.nombre;
    if (!estado) return 'Sin estado';
    
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'en progreso': return 'En Progreso';
      case 'en_progreso': return 'En Progreso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'asignada': return 'Asignada';
      default: return estado;
    }
  };

  // Renderizar cada orden de trabajo
  const renderOrden = (orden) => (
    <TouchableOpacity 
      key={orden.id} 
      style={styles.ordenItem}
      onPress={() => navigation.navigate('DetalleOrdenScreen', { orden })}
    >
      <View style={styles.ordenHeader}>
        <Text style={styles.ordenId}>#{orden.id.split('-')[0]}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orden.estados_orden_trabajo) }]}>
          <Text style={styles.statusText}>{getStatusText(orden.estados_orden_trabajo)}</Text>
        </View>
      </View>
      
      <Text style={styles.ordenTitulo}>{orden.titulo || 'Sin título'}</Text>
      
      {orden.descripcion_corta && (
        <Text style={styles.ordenDescripcion} numberOfLines={2}>
          {orden.descripcion_corta}
        </Text>
      )}
      
      <View style={styles.ordenFooter}>
        <Text style={styles.ordenFecha}>
          📅 {formatDate(orden.created_at)}
        </Text>
        {orden.prioridades?.nombre && (
          <Text style={styles.ordenPrioridad}>
            ⚡ {orden.prioridades.nombre}
          </Text>
        )}
      </View>
      
      {/* Información adicional */}
      <View style={styles.ordenExtra}>
        {orden.fecha_inicio && (
          <Text style={styles.ordenExtraText}>
            🚀 Inicio: {formatDate(orden.fecha_inicio)}
          </Text>
        )}
        {orden.fecha_estimada_fin && (
          <Text style={styles.ordenExtraText}>
            🎯 Est. fin: {formatDate(orden.fecha_estimada_fin)}
          </Text>
        )}
        {!orden.activa && (
          <Text style={styles.ordenInactiva}>❌ Inactiva</Text>
        )}
        {orden.servicio_id && (
          <Text style={styles.ordenExtraText}>
            📝 Servicio: {orden.servicio_id}
          </Text>
        )}
      </View>
      
      {/* Indicador de navegación */}
      <View style={styles.navigationIndicator}>
        <Text style={styles.navigationText}>👆 Toca para ver formulario</Text>
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
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>🔄 Actualizar</Text>
            </TouchableOpacity>
            {debugLines.length > 0 && (
              <View style={{ marginTop: 16, backgroundColor: '#1e1e1e', borderRadius: 8, padding: 12, width: '100%' }}>
                <Text style={{ color: '#00ff00', fontSize: 10, fontFamily: 'monospace', marginBottom: 4 }}>── DEBUG ──</Text>
                {debugLines.map((line, i) => (
                  <Text key={i} style={{ color: '#00ff00', fontSize: 10, fontFamily: 'monospace' }}>{line}</Text>
                ))}
              </View>
            )}
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
  ordenExtra: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  ordenExtraText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  ordenInactiva: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
    marginTop: 4,
  },
  navigationIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    alignItems: 'center',
  },
  navigationText: {
    fontSize: 12,
    color: '#3498db',
    fontStyle: 'italic',
  },
});