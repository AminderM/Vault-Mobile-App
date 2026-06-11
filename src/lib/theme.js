import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';

// Integra Vault - Design Token System
// Derived from Stitch "Unified Trucking Management Suite"
// Dark-mode first, Industrial Brutalism aesthetic

export const BRAND = {
  // Primary brand colors
  crimsonRed: '#9E1520',
  crimsonRedLight: '#ffb3b1',
  vaultBlue: '#3e90ff',

  // Semantic palette
  profitGreen: '#30B0C0',
  hazardOrange: '#FF9500',

  // Compliance tint backgrounds
  complianceValid: '#1A3A38',
  complianceWarning: '#3A2800',
  complianceCritical: '#3A1A1A',
};

export const DARK_THEME = {
  // Brand
  primary: BRAND.crimsonRed,
  primaryLight: BRAND.crimsonRedLight,
  primaryText: '#ffffff',

  // Secondary (Vault Blue)
  secondary: '#aac7ff',
  secondaryContainer: BRAND.vaultBlue,
  secondaryText: '#003064',

  // Tertiary / Teal
  tertiary: '#6fd8cc',
  tertiaryContainer: '#2fa096',

  // Backgrounds / Surfaces
  background: {
    base: '#1e0f0f',        // deepest background
    dark: '#0A0A0A',        // pure obsidian
    surface: '#1e0f0f',     // main content surface
    card: '#1C1C1E',        // glass cards
    container: '#2c1b1b',   // container bg
    containerLow: '#271717',
    containerHigh: '#372625',
    containerHighest: '#433030',
    variant: '#433030',
  },

  // Text
  text: {
    primary: '#f9dcda',     // on-surface
    secondary: '#e4bebc',   // on-surface-variant
    muted: '#ab8987',       // outline
    inverse: '#3e2c2b',
  },

  // Status colors
  status: {
    success: BRAND.profitGreen,
    warning: BRAND.hazardOrange,
    error: '#ffb4ab',
    info: BRAND.vaultBlue,
  },

  // Compliance
  compliance: {
    valid: BRAND.complianceValid,
    warning: BRAND.complianceWarning,
    critical: BRAND.complianceCritical,
  },

  // Border / Outline
  border: {
    default: '#ab8987',     // outline
    variant: '#5b403f',     // outline-variant
    muted: 'rgba(171, 137, 135, 0.2)',
  },

  // Interactive
  interactive: {
    pressed: 0.8,
    disabled: 0.4,
  },
};

export const LIGHT_THEME = {
  // Brand
  primary: BRAND.crimsonRed,
  primaryLight: '#ffdad7',
  primaryText: '#000000',

  // Secondary (Vault Blue)
  secondary: '#005faf',
  secondaryContainer: BRAND.vaultBlue,
  secondaryText: '#ffffff',

  // Tertiary / Teal
  tertiary: '#006a60',
  tertiaryContainer: '#6fd8cc',

  // Backgrounds / Surfaces
  background: {
    base: '#fdf8f8',        // light grey-red tint
    dark: '#ffffff',        // pure white
    surface: '#fff8f7',     // main content surface
    card: '#ffffff',        // clean white cards
    container: '#f4dddc',   // container bg
    containerLow: '#fae3e2',
    containerHigh: '#eed2d1',
    containerHighest: '#e5c5c4',
    variant: '#eed2d1',
  },

  // Text
  text: {
    primary: '#221515',     // dark on-surface
    secondary: '#51403f',   // secondary dark
    muted: '#857372',       // outline
    inverse: '#ffffff',
  },

  // Status colors
  status: {
    success: '#006874',
    warning: '#8a5100',
    error: '#ba1a1a',
    info: BRAND.vaultBlue,
  },

  // Compliance
  compliance: {
    valid: '#ccebe7',
    warning: '#ffe09d',
    critical: '#ffdad6',
  },

  // Border / Outline
  border: {
    default: '#857372',
    variant: '#d8c2c1',
    muted: 'rgba(133, 115, 114, 0.2)',
  },

  // Interactive
  interactive: {
    pressed: 0.8,
    disabled: 0.4,
  },
};

// Dynamic theme state
let currentTheme = 'dark';
let themeListeners = [];

// Mutable theme object for static render-time utility function support
export const T = { ...DARK_THEME };

export const useTheme = () => {
  const [theme, setTheme] = useState(currentTheme);
  useEffect(() => {
    themeListeners.push(setTheme);
    return () => {
      themeListeners = themeListeners.filter((l) => l !== setTheme);
    };
  }, []);
  return {
    mode: theme,
    t: theme === 'light' ? LIGHT_THEME : DARK_THEME,
  };
};

export const toggleTheme = () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  const newTheme = currentTheme === 'light' ? LIGHT_THEME : DARK_THEME;
  
  // Mutate T for static call compatibility
  Object.assign(T, newTheme);
  
  themeListeners.forEach((listener) => listener(currentTheme));
};

export const getThemeMode = () => currentTheme;

export function createThemedStyleSheet(factory) {
  return () => {
    const { t } = useTheme();
    return React.useMemo(() => factory(t), [t]);
  };
}

// Alias for backward compatibility
export const DARK_THEME_STATIC = DARK_THEME;
export const LIGHT_MODE = T;
export const DARK_MODE = T;

export const getTheme = () => T;

export const colors = {
  light: T,
  dark: T,
};

// Typography scale matching Stitch design tokens
export const TYPOGRAPHY = {
  displayMetrics: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.72,
  },
  displayMetricsMobile: {
    fontFamily: 'System',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
  },
  headlineLg: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  headlineSm: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  labelData: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
};

// Spacing tokens (4px base grid)
export const SPACING = {
  base: 4,
  stackSm: 8,
  stackMd: 16,
  stackLg: 24,
  gutter: 16,
  marginMobile: 16,
};

// Card style factories
export const createGlassCard = () => ({
  backgroundColor: T.background.card,
  borderWidth: 1,
  borderColor: T.border.muted,
  borderRadius: 12,
});

export const createStatusBorderCard = (borderColor) => ({
  ...createGlassCard(),
  borderLeftWidth: 4,
  borderLeftColor: borderColor,
});

export const createLoadCard = (pulseType = 'normal') => {
  const borderColors = {
    high: BRAND.profitGreen,        // High yield
    urgent: BRAND.crimsonRed,       // Hazmat/Urgent
    normal: T.border.default,
  };
  return createStatusBorderCard(borderColors[pulseType] || borderColors.normal);
};
