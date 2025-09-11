import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { testConnection, getOrdenesTrabajo } from './lib/supabase-cmms';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'ordenes', 'formularios'
  const [selectedOrden, setSelectedOrden] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    const result = await testConnection();
    setIsConnected(result.success);
    
    if (result.success) {
      await loadOrdenes();
    } else {
      Alert.alert('Error de Conexión', result.error);
    }
    setLoading(false);
  };

  const loadOrdenes = async () => {
    const result = await getOrdenesTrabajo();
    if (result.success) {
      setOrdenesTrabajo(result.data || []);
    } else {
      Alert.alert('Error', `No se pudieron cargar las órdenes: ${result.error}`);
    }
  };

  const renderHome = () => (
    <ScrollView style={styles.content}>
      {/* Connection Status */}
      <View style={[styles.statusCard, isConnected ? styles.connected : styles.disconnected]}>
        <Text style={styles.statusTitle}>
          {isConnected ? '✅ Sistema CMMS Conectado' : '❌ Sin Conexión'}
        </Text>
        <Text style={styles.statusSubtitle}>
          {isConnected ? 'Supabase Online' : 'Verificar conexión a internet'}
        </Text>
      </View>

      {/* Menu Principal */}
      {isConnected && (
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>📋 Sistema CMMS Técnicos</Text>
          
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setCurrentView('ordenes')}
          >
            <Text style={styles.menuButtonIcon}>🔧</Text>
            <View style={styles.menuButtonContent}>
              <Text style={styles.menuButtonTitle}>Órdenes de Trabajo</Text>
              <Text style={styles.menuButtonSubtitle}>
                {ordenesTrabajo.length} órdenes disponibles
              </Text>
            </View>
            <Text style={styles.menuButtonArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setCurrentView('formularios')}
          >
            <Text style={styles.menuButtonIcon}>📝</Text>
            <View style={styles.menuButtonContent}>
              <Text style={styles.menuButtonTitle}>Tipos de Informe</Text>
              <Text style={styles.menuButtonSubtitle}>
                4 formularios disponibles
              </Text>
            </View>
            <Text style={styles.menuButtonArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButtonSecondary} 
            onPress={checkConnection}
          >
            <Text style={styles.menuButtonSecondaryText}>🔄 Sincronizar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderOrdenes = () => (
    <ScrollView style={styles.content}>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => setCurrentView('home')}>
          <Text style={styles.backButton}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Órdenes de Trabajo</Text>
      </View>

      {ordenesTrabajo.length > 0 ? (
        ordenesTrabajo.map((orden) => (
          <TouchableOpacity 
            key={orden.id} 
            style={styles.ordenCard}
            onPress={() => {
              setSelectedOrden(orden);
              setCurrentView('formularios');
            }}
          >
            <View style={styles.ordenHeader}>
              <Text style={styles.ordenNumero}>#{orden.numero_orden || orden.id.slice(0, 8)}</Text>
              <Text style={[styles.ordenEstado, 
                orden.estado === 'COMPLETADO' ? styles.estadoCompletado : styles.estadoPendiente
              ]}>
                {orden.estado || 'PENDIENTE'}
              </Text>
            </View>
            <Text style={styles.ordenTipo}>{orden.tipo_mantenimiento || 'Mantenimiento General'}</Text>
            <Text style={styles.ordenFecha}>
              Programado: {orden.fecha_programada ? new Date(orden.fecha_programada).toLocaleDateString() : 'Sin fecha'}
            </Text>
            <Text style={styles.ordenTecnico}>
              Técnico: {orden.tecnico_asignado || 'Sin asignar'}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay órdenes de trabajo disponibles</Text>
          <TouchableOpacity style={styles.button} onPress={loadOrdenes}>
            <Text style={styles.buttonText}>🔄 Recargar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderFormularios = () => (
    <ScrollView style={styles.content}>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => setCurrentView(selectedOrden ? 'ordenes' : 'home')}>
          <Text style={styles.backButton}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Tipos de Informe</Text>
      </View>

      {selectedOrden && (
        <View style={styles.selectedOrdenInfo}>
          <Text style={styles.selectedOrdenTitle}>
            Orden: #{selectedOrden.numero_orden || selectedOrden.id.slice(0, 8)}
          </Text>
          <Text style={styles.selectedOrdenSubtitle}>
            {selectedOrden.tipo_mantenimiento || 'Mantenimiento General'}
          </Text>
        </View>
      )}

      <View style={styles.formulariosGrid}>
        <TouchableOpacity 
          style={styles.formularioCard}
          onPress={() => Alert.alert('Próximamente', 'Formulario Ansul R102 en desarrollo')}
        >
          <Text style={styles.formularioIcon}>🚨</Text>
          <Text style={styles.formularioTitle}>Ansul R102</Text>
          <Text style={styles.formularioDescription}>
            Sistema contra incendios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.formularioCard}
          onPress={() => Alert.alert('Próximamente', 'Formulario Electromecánico en desarrollo')}
        >
          <Text style={styles.formularioIcon}>⚡</Text>
          <Text style={styles.formularioTitle}>Electromecánico</Text>
          <Text style={styles.formularioDescription}>
            Motores y sistemas eléctricos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.formularioCard}
          onPress={() => Alert.alert('Próximamente', 'Formulario Limpieza Ductos en desarrollo')}
        >
          <Text style={styles.formularioIcon}>🌪️</Text>
          <Text style={styles.formularioTitle}>Limpieza Ductos</Text>
          <Text style={styles.formularioDescription}>
            Ventilación y ductos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.formularioCard}
          onPress={() => Alert.alert('Próximamente', 'Formulario Reparaciones en desarrollo')}
        >
          <Text style={styles.formularioIcon}>🔨</Text>
          <Text style={styles.formularioTitle}>Reparaciones</Text>
          <Text style={styles.formularioDescription}>
            Trabajos adicionales
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔧 PMLink CMMS</Text>
        <Text style={styles.subtitle}>Sistema Técnicos en Terreno</Text>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Conectando...</Text>
        </View>
      )}

      {/* Content */}
      {!loading && (
        <>
          {currentView === 'home' && renderHome()}
          {currentView === 'ordenes' && renderOrdenes()}
          {currentView === 'formularios' && renderFormularios()}
        </>
      )}

      {/* Disconnected State */}
      {!loading && !isConnected && (
        <View style={styles.disconnectedContent}>
          <Text style={styles.disconnectedText}>
            No se pudo conectar al sistema CMMS
          </Text>
          <TouchableOpacity style={styles.button} onPress={checkConnection}>
            <Text style={styles.buttonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Status Card
  statusCard: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  connected: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 1,
  },
  disconnected: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  
  // Menu Principal
  menuContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  menuButtonContent: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuButtonSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuButtonArrow: {
    fontSize: 24,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  menuButtonSecondary: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0066cc',
    marginTop: 10,
  },
  menuButtonSecondaryText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Navigation
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  backButton: {
    fontSize: 18,
    color: '#0066cc',
    fontWeight: '600',
    marginRight: 15,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Órdenes de Trabajo
  ordenCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ordenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ordenNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  ordenEstado: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  estadoPendiente: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  estadoCompletado: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  ordenTipo: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  ordenFecha: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ordenTecnico: {
    fontSize: 14,
    color: '#666',
  },
  
  // Información de Orden Seleccionada
  selectedOrdenInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  selectedOrdenTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  selectedOrdenSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  // Grid de Formularios
  formulariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  formularioCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formularioIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  formularioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  formularioDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Estados vacíos
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Botones
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Estado desconectado
  disconnectedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  disconnectedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
