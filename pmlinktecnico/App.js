import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { testConnection, listTables } from './lib/supabase';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    const result = await testConnection();
    setIsConnected(result.success);
    
    if (result.success) {
      await loadTables();
    } else {
      Alert.alert('Error de Conexión', result.error);
    }
    setLoading(false);
  };

  const loadTables = async () => {
    const result = await listTables();
    if (result.success) {
      setTables(result.data || []);
    } else {
      Alert.alert('Error', `No se pudieron cargar las tablas: ${result.error}`);
    }
  };

  const createExampleTable = () => {
    Alert.alert(
      'Crear Tabla Nueva',
      'Para crear una tabla nueva:\n\n1. Ve al dashboard de Supabase\n2. Usa el SQL Editor\n3. Ejecuta tu código CREATE TABLE\n\nO comparte tu código SQL y te ayudo a implementarlo.',
      [
        { text: 'Entendido', style: 'default' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔗 PMLink Mobile</Text>
        <Text style={styles.subtitle}>Gestión de Base de Datos</Text>
      </View>

      {/* Connection Status */}
      <View style={[styles.statusCard, isConnected ? styles.connected : styles.disconnected]}>
        <Text style={styles.statusTitle}>
          {isConnected ? '✅ Conectado' : '❌ Desconectado'}
        </Text>
        <Text style={styles.statusSubtitle}>
          {isConnected ? 'Supabase Online' : 'Sin conexión a Supabase'}
        </Text>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Conectando...</Text>
        </View>
      )}

      {/* Tables List */}
      {!loading && isConnected && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>📋 Tablas en la Base de Datos</Text>
          
          {tables.length > 0 ? (
            tables.map((table, index) => (
              <View key={index} style={styles.tableCard}>
                <Text style={styles.tableName}>{table.table_name}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No se encontraron tablas públicas</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={checkConnection}>
              <Text style={styles.buttonText}>🔄 Reconectar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.buttonSecondary} onPress={createExampleTable}>
              <Text style={styles.buttonSecondaryText}>➕ Crear Tabla</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Disconnected State */}
      {!loading && !isConnected && (
        <View style={styles.disconnectedContent}>
          <Text style={styles.disconnectedText}>
            No se pudo conectar a Supabase
          </Text>
          <TouchableOpacity style={styles.button} onPress={checkConnection}>
            <Text style={styles.buttonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingTop: 50,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  tableCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tableName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actions: {
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  buttonSecondaryText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '500',
  },
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
