import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { supabase, testSupabaseConnection } from './lib/supabase';

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState('Conectando...');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'Conexión exitosa ✅' : 'Error de conexión ❌');
    } catch (error) {
      setConnectionStatus('Error: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CMMS Cliente</Text>
      <Text style={styles.subtitle}>Aplicación Móvil Nativa</Text>
      <Text style={styles.status}>{connectionStatus}</Text>
      <Text style={styles.note}>
        Recuerda configurar tus variables de entorno en el archivo .env
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
