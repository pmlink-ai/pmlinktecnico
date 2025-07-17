import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';

export default function LoginTest({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) {
        Alert.alert('Error', 'Credenciales inválidas');
      } else {
        Alert.alert('Éxito', 'Login exitoso');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PMLink Cliente</Text>
        <Text style={styles.subtitle}>Prueba de Teclado</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="test@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID="email-input"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="contraseña"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            testID="password-input"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={handleLogin}
          disabled={loading}
          testID="login-button"
        >
          <Text style={styles.buttonText}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Email: {email}</Text>
          <Text style={styles.debugText}>Password: {password ? '****' : 'vacío'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#FFA500',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  debugInfo: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
