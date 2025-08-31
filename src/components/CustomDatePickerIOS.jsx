import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../styles';

const CustomDatePickerIOS = ({ 
  visible, 
  onClose, 
  onSelectDate, 
  currentDate, 
  title = "Seleccionar Fecha",
  mode = "date" 
}) => {
  const [tempDate, setTempDate] = useState(currentDate);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    onSelectDate(tempDate);
    onClose();
  };

  const handleCancel = () => {
    setTempDate(currentDate); // Revertir a la fecha original
    onClose();
  };

  // Solo renderizar en iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header con título y botones */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.button}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>{title}</Text>
            
            <TouchableOpacity onPress={handleConfirm} style={styles.button}>
              <Text style={styles.confirmText}>Listo</Text>
            </TouchableOpacity>
          </View>

          {/* DateTimePicker */}
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display="spinner"
              onChange={handleDateChange}
              style={styles.picker}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  pickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  picker: {
    backgroundColor: colors.white,
    width: '100%',
  },
});

export default CustomDatePickerIOS;
