// Paleta de colores para PMLink Cliente CMMS
// Color principal de la marca: Naranja (#FFA500)

export const colors = {
  // Colores principales
  primary: '#FFA500',      // Naranja principal de la marca
  secondary: '#FF8C00',    // Naranja más oscuro para hover/active
  
  // Colores de texto
  text: '#333333',         // Gris oscuro para texto principal
  textLight: '#666666',    // Gris más claro para texto secundario
  textMuted: '#999999',    // Gris muy claro para texto deshabilitado
  
  // Colores de fondo
  background: '#FFFFFF',   // Blanco para fondos principales
  backgroundLight: '#F8F9FA', // Gris muy claro para fondos secundarios
  backgroundDark: '#E9ECEF',  // Gris claro para divisores
  
  // Colores básicos
  white: '#FFFFFF',
  black: '#000000',
  
  // Colores de estado
  success: '#28A745',      // Verde para éxito
  danger: '#DC3545',       // Rojo para errores
  dangerLight: '#FFE6E6',  // Rojo claro para fondos de error
  warning: '#FFC107',      // Amarillo para advertencias
  info: '#17A2B8',         // Azul para información
  
  // Colores específicos para CMMS
  pending: '#FFC107',      // Amarillo para órdenes pendientes
  inProgress: '#17A2B8',   // Azul para órdenes en progreso
  completed: '#28A745',    // Verde para órdenes completadas
  cancelled: '#DC3545',    // Rojo para órdenes canceladas
  
  // Colores de bordes
  border: '#DEE2E6',       // Gris claro para bordes
  borderLight: '#E9ECEF',  // Gris muy claro para bordes sutiles
  
  // Colores de sombras
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Colores de overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Colores específicos para modo oscuro (para futuras implementaciones)
export const darkColors = {
  ...colors,
  background: '#121212',
  backgroundLight: '#1E1E1E',
  backgroundDark: '#2D2D2D',
  text: '#FFFFFF',
  textLight: '#B3B3B3',
  textMuted: '#666666',
  border: '#404040',
  borderLight: '#333333',
};
