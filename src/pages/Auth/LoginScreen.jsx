import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { globalStyles, colors } from '../../styles';
import LogoPlaceholder from '../../components/LogoPlaceholder';

export default function LoginScreen({ navigation }) {
  // Estados para los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Estados para la lógica de autenticación
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Referencias para los campos de texto
  const passwordInputRef = useRef(null);

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    // Limpiar errores previos
    setError('');
    
    // Validación básica
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    setLoading(true);

    try {
      // Intento de inicio de sesión con Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (authError) {
        // Manejo de errores de autenticación
        let errorMessage = 'Error al iniciar sesión';
        
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales inválidas';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirma tu email';
        } else if (authError.message.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos, intenta más tarde';
        }
        
        setError(errorMessage);
        return;
      }

      if (data.user) {
        // Verificación de usuario y rol basada en el esquema real de la BD
        console.log('Login exitoso para usuario:', data.user.email);
        
        try {
          // Obtener información del usuario desde la tabla usuario
          const { data: usuario, error: usuarioError } = await supabase
            .from('usuario')
            .select('usuario_id, nombre_usuario, email, es_superadmin, activo')
            .eq('email', data.user.email)
            .single();

          if (usuarioError) {
            console.error('Error al obtener información del usuario:', usuarioError);
            setError('Error al verificar el usuario en el sistema');
            await supabase.auth.signOut();
            return;
          }

          // Verificar si el usuario está activo
          if (!usuario.activo) {
            setError('Usuario inactivo. Contacte al administrador');
            await supabase.auth.signOut();
            return;
          }

          // Obtener roles del usuario (relación usuario_local)
          const { data: userRoles, error: rolesError } = await supabase
            .from('usuario_local')
            .select(`
              rol_id,
              local_id,
              rol:rol_id (
                nombre_rol,
                descripcion
              )
            `)
            .eq('usuario_id', usuario.usuario_id);

          if (rolesError) {
            console.warn('Error al obtener roles del usuario:', rolesError);
            // Permitir acceso si es superadmin
            if (usuario.es_superadmin) {
              console.log('Usuario superadmin - acceso permitido');
            } else {
              setError('Error al verificar permisos del usuario');
              await supabase.auth.signOut();
              return;
            }
          } else {
            // Verificar si el usuario tiene rol de cliente
            const hasClientRole = userRoles?.some(userRole => 
              userRole.rol?.nombre_rol?.toLowerCase().includes('cliente')
            );

            if (!hasClientRole && !usuario.es_superadmin) {
              setError('Acceso no autorizado para este tipo de usuario');
              await supabase.auth.signOut();
              return;
            }
          }

          // Actualizar fecha de última conexión
          await supabase
            .from('usuario')
            .update({ fecha_ultima_conexion: new Date().toISOString() })
            .eq('usuario_id', usuario.usuario_id);

          console.log('Login exitoso - navegando al dashboard');
          
        } catch (error) {
          console.error('Error en verificación de usuario:', error);
          setError('Error inesperado al verificar usuario');
          await supabase.auth.signOut();
          return;
        }
      }

    } catch (error) {
      console.error('Error inesperado:', error?.message || 'Error desconocido');
      setError('Error inesperado. Intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  // Función para navegar a la pantalla de recuperación de contraseña
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo de la Aplicación */}
          <View style={styles.logoContainer}>
            <LogoPlaceholder style={styles.logo} />
          </View>

          {/* Título de Bienvenida */}
          <View style={styles.welcomeContainer}>
            <Text style={globalStyles.title}>¡Bienvenido!</Text>
            <Text style={globalStyles.textLight}>
              Inicia sesión para acceder a tu sistema CMMS
            </Text>
          </View>

          {/* Formulario de Login */}
          <View style={styles.formContainer}>
          {/* Mensaje de Error */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

            {/* Campo de Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput
                style={[
                  globalStyles.input,
                  emailFocused && globalStyles.inputFocused,
                  error && styles.inputError
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(''); // Limpiar error al escribir
                }}
                placeholder="Ingresa tu correo electrónico"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoCompleteType="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!loading}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  // Enfocar el campo de contraseña cuando se presiona "next"
                  passwordInputRef.current?.focus();
                }}
              />
            </View>

            {/* Campo de Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                ref={passwordInputRef}
                style={[
                  globalStyles.input,
                  passwordFocused && globalStyles.inputFocused,
                  error && styles.inputError
                ]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(''); // Limpiar error al escribir
                }}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoCompleteType="password"
                textContentType="password"
                returnKeyType="done"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                editable={!loading}
                blurOnSubmit={true}
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Botón de Inicio de Sesión */}
            <TouchableOpacity
              style={[
                globalStyles.button, 
                styles.loginButton,
                loading && styles.buttonDisabled
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={[
                globalStyles.buttonText,
                loading && styles.buttonTextDisabled
              ]}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Enlace "Olvidé mi Contraseña" */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Información adicional */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>PMLink Cliente</Text>
            <Text style={styles.footerSubtext}>
              Sistema de Gestión de Mantenimiento
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },

  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  formContainer: {
    width: '100%',
    marginBottom: 30,
  },

  errorContainer: {
    backgroundColor: colors.dangerLight || '#ffebee',
    borderColor: colors.danger || '#dc3545',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },

  errorText: {
    color: colors.danger || '#dc3545',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },

  inputError: {
    borderColor: colors.danger,
    borderWidth: 1,
  },

  loginButton: {
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.textMuted,
  },

  buttonTextDisabled: {
    color: colors.white,
  },

  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },

  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  footerContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },

  footerSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
