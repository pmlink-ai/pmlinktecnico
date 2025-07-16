import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { supabase, testSupabaseConnection } from './src/services/supabase';
import { colors, globalStyles } from './src/styles';
import LoginScreen from './src/pages/Auth/LoginScreen';

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState('Conectando...');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'Conexión exitosa ✅' : 'Error de conexión ❌');
      
      // Después de 2 segundos, mostrar la pantalla de login
      setTimeout(() => {
        setShowLogin(true);
      }, 2000);
    } catch (error) {
      setConnectionStatus('Error: ' + error.message);
      setTimeout(() => {
        setShowLogin(true);
      }, 2000);
    }
  };

  // Mostrar pantalla de login después de la verificación
  if (showLogin) {
    return <LoginScreen />;
  }

  // Pantalla de carga/verificación inicial
  return (
    <View style={globalStyles.containerCentered}>
      <Text style={globalStyles.title}>PMLink Cliente</Text>
      <Text style={globalStyles.subtitle}>CMMS - Sistema de Gestión de Mantenimiento</Text>
      <Text style={[globalStyles.text, { textAlign: 'center', marginBottom: 20 }]}>
        {connectionStatus}
      </Text>
      <Text style={globalStyles.textMuted}>
        Aplicación móvil nativa para iOS y Android
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

// Estilos específicos para esta pantalla (si son necesarios)
const styles = StyleSheet.create({
  // Puedes agregar estilos específicos aquí si son necesarios
});
