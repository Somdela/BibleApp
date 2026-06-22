export const colors = {
  background: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  primary: '#208AEF',
  danger: '#DC2626',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Palette des 5 couleurs de surlignage disponibles pour les annotations.
export const highlightColors = {
  yellow: '#FDE68A',
  green: '#A7F3D0',
  blue: '#BFDBFE',
  pink: '#FBCFE8',
  orange: '#FED7AA',
} as const;

export type HighlightColor = keyof typeof highlightColors;
