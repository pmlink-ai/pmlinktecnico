import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Componente de aviso para web
function WebWarning() {
  if (Platform.OS !== 'web') return null;
  
  return (
    <View style={styles.webWarning}>
      <Text style={styles.webWarningText}>
        ⚠️ Esta app está diseñada para móvil (Android/iOS)
      </Text>
      <Text style={styles.webWarningSubtext}>
        Para mejor experiencia, úsala en Expo Go en tu dispositivo móvil
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WebWarning />
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  webWarning: {
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa7',
    padding: 12,
    alignItems: 'center',
  },
  webWarningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  webWarningSubtext: {
    color: '#856404',
    fontSize: 12,
  },
});
