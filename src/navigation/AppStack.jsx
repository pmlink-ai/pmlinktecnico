import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import { colors } from '../styles';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ 
          headerShown: false,
          title: 'PMLink CMMS'
        }}
      />
      
      {/* Aquí se pueden añadir más pantallas del stack principal */}
      {/* Por ejemplo: */}
      {/* 
      <Stack.Screen 
        name="WorkOrderDetail" 
        component={WorkOrderDetailScreen}
        options={{ 
          headerShown: true,
          title: 'Detalle de Orden',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="CreateWorkOrder" 
        component={CreateWorkOrderScreen}
        options={{ 
          headerShown: true,
          title: 'Nueva Orden',
          headerBackTitleVisible: false,
          presentation: 'modal',
        }}
      />
      */}
    </Stack.Navigator>
  );
}
