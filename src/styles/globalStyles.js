import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './colors';

// Obtener dimensiones de la pantalla
const { width, height } = Dimensions.get('window');

// Estilos globales para PMLink Cliente CMMS
export const globalStyles = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  
  containerCentered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  containerNoPadding: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Títulos y texto
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    marginTop: 20,
  },
  
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  
  textLight: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  
  textMuted: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  
  // Botones
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 48,
  },
  
  buttonSecondary: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  buttonDanger: {
    backgroundColor: colors.danger,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 48,
  },
  
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  buttonTextSecondary: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Inputs
  input: {
    height: 48,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
    fontSize: 16,
    color: colors.text,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  
  // Mensajes de error y validación
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: -12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  
  successText: {
    color: colors.success,
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 4,
  },
  
  // Cards y contenedores
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  // Listas y separadores
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },
  
  // Estados específicos para CMMS
  statusPending: {
    backgroundColor: colors.pending,
    color: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  statusInProgress: {
    backgroundColor: colors.inProgress,
    color: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  statusCompleted: {
    backgroundColor: colors.completed,
    color: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  statusCancelled: {
    backgroundColor: colors.cancelled,
    color: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Utilidades
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Márgenes y padding
  marginTop: {
    marginTop: 16,
  },
  
  marginBottom: {
    marginBottom: 16,
  },
  
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  
  // Loading y overlays
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
  },
});

// Estilos específicos para diferentes tamaños de pantalla
export const responsiveStyles = {
  // Para pantallas pequeñas (< 400px)
  small: StyleSheet.create({
    container: {
      ...globalStyles.container,
      padding: 16,
    },
    title: {
      ...globalStyles.title,
      fontSize: 24,
    },
  }),
  
  // Para pantallas medianas (400-600px)
  medium: StyleSheet.create({
    container: {
      ...globalStyles.container,
      padding: 20,
    },
  }),
  
  // Para pantallas grandes (> 600px)
  large: StyleSheet.create({
    container: {
      ...globalStyles.container,
      padding: 24,
    },
  }),
};
