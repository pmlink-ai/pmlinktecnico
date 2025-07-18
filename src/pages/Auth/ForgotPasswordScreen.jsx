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

export default function ForgotPasswordScreen({ navigation }) {
  // Estados para el formulario
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Función para manejar el envío de recuperación de contraseña
  const handleResetPassword = async () => {
    // Limpiar estados previos
    setError('');
    setSuccess(false);
    
    // Validación básica
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
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
      // Enviar email de recuperación con Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: 'pmlinkacliente://reset-password', // Deep link para la app
        }
      );

      if (resetError) {
        // Manejo de errores específicos
        let errorMessage = 'Error al enviar el correo de recuperación';
        
        if (resetError.message.includes('Email not found')) {
          errorMessage = 'No se encontró una cuenta con este correo electrónico';
        } else if (resetError.message.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos, intenta más tarde';
        } else if (resetError.message.includes('Invalid email')) {
          errorMessage = 'Correo electrónico inválido';
        }
        
        setError(errorMessage);
        return;
      }

      // Éxito - mostrar mensaje de confirmación
      setSuccess(true);
      
    } catch (error) {
      console.error('Error inesperado en recuperación:', error);
      setError('Error inesperado. Intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  // Función para volver al login
  const handleBackToLogin = () => {
    navigation.goBack();
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

          {/* Título y descripción */}
          <View style={styles.headerContainer}>
            <Text style={globalStyles.title}>Recuperar Contraseña</Text>
            <Text style={globalStyles.textLight}>
              {success 
                ? 'Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.'
                : 'Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.'
              }
            </Text>
          </View>

          {/* Formulario de recuperación o mensaje de éxito */}
          <View style={styles.formContainer}>
            {success ? (
              /* Mensaje de éxito */
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>
                <Text style={styles.successTitle}>¡Correo Enviado!</Text>
                <Text style={styles.successMessage}>
                  Revisa tu bandeja de entrada y sigue las instrucciones del correo para restablecer tu contraseña.
                </Text>
                <Text style={styles.successNote}>
                  Si no ves el correo, revisa tu carpeta de spam.
                </Text>
              </View>
            ) : (
              /* Formulario de email */
              <>
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
                    returnKeyType="done"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    editable={!loading}
                    onSubmitEditing={handleResetPassword}
                  />
                </View>

                {/* Botón de Enviar */}
                <TouchableOpacity
                  style={[
                    globalStyles.button, 
                    styles.resetButton,
                    loading && styles.buttonDisabled
                  ]}
                  onPress={handleResetPassword}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Text style={[
                    globalStyles.buttonText,
                    loading && styles.buttonTextDisabled
                  ]}>
                    {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Botón para volver al login */}
            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={handleBackToLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLoginText}>
                ← Volver al inicio de sesión
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

  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },

  formContainer: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 20,
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

  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success || '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  successIcon: {
    fontSize: 40,
    color: colors.white,
    fontWeight: 'bold',
  },

  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },

  successMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },

  successNote: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
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

  resetButton: {
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

  backToLoginContainer: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 10,
  },

  backToLoginText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },

  footerContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: 20,
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
