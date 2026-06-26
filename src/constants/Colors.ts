export const Colors = {
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // main gold/orange color
    600: '#d97706', // active primary color
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  danger: '#ef4444',
  dangerLight: '#fca5a5',
  white: '#ffffff',
  black: '#000000',
  googleRed: '#EA4335',
  googleBlue: '#4285F4',
  // Special background colors
  bgLight: 'rgba(249, 250, 251, 0.5)',
  bgLight70: 'rgba(249, 250, 251, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.45)',
  whiteOpacity: 'rgba(255, 255, 255, 0.9)',
} as const;

export type ColorType = typeof Colors;
export default Colors;
