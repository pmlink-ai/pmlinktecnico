import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorkOrdersScreenTemp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Órdenes de Trabajo</Text>
      <Text style={styles.subtitle}>Pantalla temporal - funciona correctamente</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default WorkOrdersScreenTemp;
