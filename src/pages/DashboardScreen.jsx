import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { globalStyles, colors } from '../styles';

export default function DashboardScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // La navegación se manejará automáticamente por el AppNavigator
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleNavigateToOrders = () => {
    navigation.navigate('WorkOrders');
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={globalStyles.title}>PMLink Dashboard</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            ¡Bienvenido al sistema CMMS de PMLink!
          </Text>
          <Text style={styles.subtitleText}>
            Gestiona tu mantenimiento de forma eficiente
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleNavigateToOrders}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📋</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Órdenes de Trabajo</Text>
              <Text style={styles.actionDescription}>
                Ver y gestionar tus órdenes de trabajo asignadas
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.disabledCard]}
            disabled={true}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>⚙️</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.disabledText]}>Equipos</Text>
              <Text style={[styles.actionDescription, styles.disabledText]}>
                Listado de equipos (Próximamente)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.disabledCard]}
            disabled={true}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📊</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.disabledText]}>Reportes</Text>
              <Text style={[styles.actionDescription, styles.disabledText]}>
                Reportes de mantenimiento (Próximamente)
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  
  logoutButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  
  logoutText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitleText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  
  actionsSection: {
    flex: 1,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  
  actionCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
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
  
  disabledCard: {
    opacity: 0.6,
    backgroundColor: colors.backgroundLight,
  },
  
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  actionIconText: {
    fontSize: 24,
  },
  
  actionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  
  actionDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  
  disabledText: {
    color: colors.textMuted,
  },
});
