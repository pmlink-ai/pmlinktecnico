import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import CreateWorkOrderScreen from '../pages/WorkOrders/CreateWorkOrderScreen';
import EditWorkOrderScreen from '../pages/WorkOrders/EditWorkOrderScreen';
import WorkOrderDetailScreen from '../pages/WorkOrders/WorkOrderDetailScreen';
import EquipmentListScreen from '../pages/Equipment/EquipmentListScreen';
import EquipmentDetailScreen from '../pages/Equipment/EquipmentDetailScreen';
import CreateEquipmentScreen from '../pages/Equipment/CreateEquipmentScreen';
import EditEquipmentScreen from '../pages/Equipment/EditEquipmentScreen';
import ServiceDetailScreen from '../pages/Services/ServiceDetailScreen';
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
      
      {/* Pantallas de Equipos */}
      <Stack.Screen 
        name="EquipmentDetail" 
        component={EquipmentDetailScreen}
        options={{ 
          title: 'Detalle de Equipo',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="CreateEquipment" 
        component={CreateEquipmentScreen}
        options={{ 
          title: 'Nuevo Equipo',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="EditEquipment" 
        component={EditEquipmentScreen}
        options={{ 
          title: 'Editar Equipo',
          presentation: 'modal',
        }} 
      />

      {/* Pantallas de Servicios */}
      <Stack.Screen 
        name="ServiceDetail" 
        component={ServiceDetailScreen}
        options={{ 
          title: 'Detalle de Servicio',
          presentation: 'card',
        }} 
      />
    </Stack.Navigator>
  );
}
