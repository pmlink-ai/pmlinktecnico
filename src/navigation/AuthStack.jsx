import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../pages/Auth/LoginScreen';
import ForgotPasswordScreen from '../pages/Auth/ForgotPasswordScreen';
import { colors } from '../styles';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ 
          headerShown: false,
          title: 'Iniciar Sesión'
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ 
          headerShown: true,
          title: 'Recuperar Contraseña',
          headerBackTitleVisible: false,
          presentation: 'modal', // Mejor UX para esta pantalla
        }}
      />
    </Stack.Navigator>
  );
}
