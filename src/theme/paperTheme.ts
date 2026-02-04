import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper'

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#65a30d',
    primaryContainer: '#d9f99d',
    onPrimaryContainer: '#1a2e05',
    secondary: '#84cc16',
    secondaryContainer: '#ecfccb',
    onSecondaryContainer: '#1a2e05',
    tertiary: '#22c55e',
    tertiaryContainer: '#dcfce7',
    onTertiaryContainer: '#052e16',
    error: '#ef4444',
    background: '#fafaf9',
    surface: '#ffffff',
    surfaceVariant: '#ffffff',
    onSurface: '#0c0a09',
    onSurfaceVariant: '#57534e',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#ffffff',
      level2: '#ffffff',
      level3: '#ffffff',
      level4: '#ffffff',
      level5: '#ffffff',
    },
  },
}

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#84cc16',
    primaryContainer: '#3f6212',
    onPrimaryContainer: '#d9f99d',
    secondary: '#a3e635',
    secondaryContainer: '#4d7c0f',
    onSecondaryContainer: '#ecfccb',
    tertiary: '#4ade80',
    tertiaryContainer: '#166534',
    onTertiaryContainer: '#dcfce7',
    error: '#f87171',
    background: '#0c0a09',
    surface: '#1c1917',
    surfaceVariant: '#292524',
    onSurface: '#fafaf9',
    onSurfaceVariant: '#d6d3d1',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level2: '#84cc16',
    },
  },
}
