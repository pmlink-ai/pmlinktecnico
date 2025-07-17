import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles';

// Componente temporal para el logo hasta que se añada el archivo real
export default function LogoPlaceholder({ style }) {
  return (
    <View style={[styles.logoContainer, style]}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>PM</Text>
      </View>
      <Text style={styles.logoTitle}>PMLink</Text>
      <Text style={styles.logoSubtitle}>Cliente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  
  logoSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
});