import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { globalStyles, colors } from '../styles';

export default function DashboardScreen({ navigation }) {
  // Estados para la información del usuario
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Función para obtener la información del usuario
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError('');

      // Obtener usuario actual de Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error obteniendo sesión:', sessionError);
        setError('Error al obtener la sesión del usuario');
        return;
      }

      if (!session?.user) {
        setError('No hay usuario autenticado');
        return;
      }

      setUser(session.user);

      // Obtener información adicional del usuario desde la tabla usuario
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuario')
        .select(`
          usuario_id,
          nombre_usuario,
          nombre,
          apellido,
          email,
          telefono,
          es_superadmin,
          fecha_ultima_conexion,
          fecha_registro
        `)
        .eq('email', session.user.email)
        .single();

      if (usuarioError) {
        console.error('Error obteniendo información del usuario:', usuarioError);
        // Si no se encuentra en la tabla usuario, usar info básica de auth
        setUserInfo({
          email: session.user.email,
          nombre: session.user.user_metadata?.full_name || 'Usuario',
          apellido: '',
          nombre_usuario: session.user.email.split('@')[0],
        });
        return;
      }

      setUserInfo(usuario);

      // Opcional: Obtener roles del usuario
      const { data: userRoles } = await supabase
        .from('usuario_local')
        .select(`
          rol_id,
          local_id,
          rol:rol_id (
            nombre_rol,
            descripcion
          ),
          local:local_id (
            nombre_local,
            empresa:empresa_id (
              nombre_empresa
            )
          )
        `)
        .eq('usuario_id', usuario.usuario_id);

      if (userRoles && userRoles.length > 0) {
        setUserInfo(prev => ({
          ...prev,
          roles: userRoles
        }));
      }

    } catch (error) {
      console.error('Error inesperado obteniendo usuario:', error);
      setError('Error inesperado al cargar la información del usuario');
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar la información del usuario al montar el componente
  useEffect(() => {
    fetchUserInfo();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserInfo();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserInfo(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // Función para obtener el nombre completo del usuario
  const getDisplayName = () => {
    if (!userInfo) return 'Usuario';
    
    if (userInfo.nombre && userInfo.apellido) {
      return `${userInfo.nombre} ${userInfo.apellido}`;
    } else if (userInfo.nombre) {
      return userInfo.nombre;
    } else if (userInfo.nombre_usuario) {
      return userInfo.nombre_usuario;
    } else {
      return userInfo.email?.split('@')[0] || 'Usuario';
    }
  };

  // Función para obtener el saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  // Función para formatear la fecha de última conexión
  const formatLastConnection = () => {
    if (!userInfo?.fecha_ultima_conexion) return null;
    
    const date = new Date(userInfo.fecha_ultima_conexion);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>PMLink Dashboard</Text>
          {userInfo && (
            <Text style={styles.headerSubtitle}>
              {userInfo.es_superadmin && (
                <Text style={styles.adminBadge}>ADMIN </Text>
              )}
              {userInfo.roles && userInfo.roles.length > 0 && (
                <Text style={styles.roleBadge}>
                  {userInfo.roles[0].rol?.nombre_rol || 'Usuario'}
                </Text>
              )}
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserInfo}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greetingText}>
              {getGreeting()}, {getDisplayName()}!
            </Text>
            <Text style={styles.welcomeSubtext}>
              Bienvenido al sistema CMMS de PMLink
            </Text>
            {userInfo?.roles && userInfo.roles.length > 0 && (
              <Text style={styles.companyText}>
                {userInfo.roles[0].local?.empresa?.nombre_empresa || 'PMLink'}
                {userInfo.roles[0].local?.nombre_local && 
                  ` - ${userInfo.roles[0].local.nombre_local}`
                }
              </Text>
            )}
          </View>

          {/* Información del usuario */}
          <View style={styles.userInfoSection}>
            <Text style={styles.sectionTitle}>Mi Perfil</Text>
            <View style={styles.userInfoCard}>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Email:</Text>
                <Text style={styles.userInfoValue}>{userInfo?.email}</Text>
              </View>
              {userInfo?.telefono && (
                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>Teléfono:</Text>
                  <Text style={styles.userInfoValue}>{userInfo.telefono}</Text>
                </View>
              )}
              {formatLastConnection() && (
                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>Última conexión:</Text>
                  <Text style={styles.userInfoValue}>{formatLastConnection()}</Text>
                </View>
              )}
            </View>
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },

  adminBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.danger,
    backgroundColor: colors.dangerLight || '#ffebee',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },

  roleBadge: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primary,
    backgroundColor: colors.primaryLight || colors.primary + '20',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  
  logoutButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textMuted,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },

  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  welcomeSubtext: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },

  companyText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },

  userInfoSection: {
    marginBottom: 20,
  },

  userInfoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
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

  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  userInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },

  userInfoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
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
    marginBottom: 20,
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
