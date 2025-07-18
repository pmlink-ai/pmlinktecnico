import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../../styles';

const WorkOrderListScreenSimple = () => {
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Órdenes de Trabajo</Text>
        <Text style={styles.subtitle}>Pantalla en desarrollo</Text>
      </View>
    </SafeAreaView>
  );
};

export default WorkOrderListScreenSimple;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
