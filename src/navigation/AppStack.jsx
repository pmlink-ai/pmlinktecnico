import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import CreateWorkOrderScreen from '../pages/WorkOrders/CreateWorkOrderScreen';
import EditWorkOrderScreen from '../pages/WorkOrders/EditWorkOrderScreen';
import WorkOrderDetailScreen from '../pages/WorkOrders/WorkOrderDetailScreen';
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
      
      <Stack.Screen 
        name="CreateWorkOrder" 
        component={CreateWorkOrderScreen}
        options={{
          title: 'Nueva Orden de Trabajo',
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="EditWorkOrder" 
        component={EditWorkOrderScreen}
        options={{
          headerShown: false, // Usamos header personalizado en el componente
        }}
      />
      
      <Stack.Screen 
        name="WorkOrderDetail" 
        component={WorkOrderDetailScreen}
        options={{
          headerShown: false, // Usamos header personalizado en el componente
        }}
      />
    </Stack.Navigator>
  );
}
