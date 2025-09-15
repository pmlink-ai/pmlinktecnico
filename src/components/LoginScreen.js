import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { supabase, testConnection } from '../../lib/supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    console.log('🔐 Iniciando proceso de login...');
    console.log('Email:', email);
    
    try {
      // Primero verificar conexión a Supabase
      console.log('🔄 Verificando conexión a Supabase...');
      const connectionTest = await testConnection();
      
      if (!connectionTest.success) {
        console.error('❌ Error de conexión:', connectionTest.error);
        Alert.alert('Error de Conexión', 
          'No se puede conectar al servidor. Verifica tu conexión a internet.\n\nDetalle: ' + connectionTest.error);
        setLoading(false);
        return;
      }
      
      console.log('✅ Conexión a Supabase exitosa');

      // Intentar login
      console.log('🔑 Intentando autenticación...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('❌ Error de autenticación:', error);
        
        let errorMessage = 'Error de autenticación';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos. \n\nCredenciales válidas:\n• Email: admin@pmlink.com\n• Password: admin123456';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email no confirmado. Verifica tu bandeja de entrada.';
        } else {
          errorMessage = error.message;
        }
        
        Alert.alert('Error de Login', errorMessage);
      } else {
        console.log('✅ Login exitoso:', data.user?.email);
        // La navegación se manejará automáticamente por el AuthContext
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      Alert.alert('Error', 'Ocurrió un error durante el login: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.loginContainer}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>PMLink</Text>
            </View>
            <Text style={styles.title}>PMLink Técnico</Text>
            <Text style={styles.subtitle}>Sistema de Gestión de Mantenimiento</Text>
          </View>

          {/* Formulario de Login */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Credenciales de prueba - Solo para desarrollo */}
            <View style={styles.testCredentialsContainer}>
              <Text style={styles.testCredentialsTitle}>🔑 Credenciales de Prueba:</Text>
              <Text style={styles.testCredentialsText}>Email: admin@pmlink.com</Text>
              <Text style={styles.testCredentialsText}>Password: admin123456</Text>
              <TouchableOpacity 
                style={styles.autoFillButton}
                onPress={() => {
                  setEmail('admin@pmlink.com');
                  setPassword('admin123456');
                }}
              >
                <Text style={styles.autoFillButtonText}>Auto-completar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>PMLink CMMS v1.5</Text>
            <Text style={styles.footerSubtext}>Con Equipos Y Servicios</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#3498db',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#95a5a6',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#bdc3c7',
    marginTop: 4,
  },
  testCredentialsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  testCredentialsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  testCredentialsText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  autoFillButton: {
    backgroundColor: '#28a745',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  autoFillButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});