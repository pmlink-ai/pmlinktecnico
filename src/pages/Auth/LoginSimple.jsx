import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  Platform
} from 'react-native';
import { supabase } from '../../services/supabase';

const LoginSimple = ({ navigation }) => {
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
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Éxito', 'Login exitoso');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testInput = () => {
    Alert.alert('Test', 'Botón funciona. Email: ' + email + ', Password: ' + password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PMLINK - {Platform.OS.toUpperCase()}</Text>
      <Text style={styles.subtitle}>Versión Simple</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="contraseña"
          placeholderTextColor="#666"
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testInput}
        >
          <Text style={styles.testButtonText}>
            🧪 Test Botón
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debug}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
        <Text style={styles.debugText}>Email: {email}</Text>
        <Text style={styles.debugText}>Password: {'*'.repeat(password.length)}</Text>
        <Text style={styles.debugText}>Loading: {loading ? 'YES' : 'NO'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  debug: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  debugText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
});

export default LoginSimple;
