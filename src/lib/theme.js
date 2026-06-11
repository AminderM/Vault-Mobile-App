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

// Alias for backward compatibility
export const LIGHT_MODE = DARK_THEME;
export const DARK_MODE = DARK_THEME;

export const getTheme = () => DARK_THEME;

export const colors = {
  light: DARK_THEME,
  dark: DARK_THEME,
};

// Typography scale matching Stitch design tokens
export const TYPOGRAPHY = {
  displayMetrics: {
    fontFamily: 'Archivo Narrow',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.72,
  },
  displayMetricsMobile: {
    fontFamily: 'Archivo Narrow',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
  },
  headlineLg: {
    fontFamily: 'Archivo Narrow',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  headlineSm: {
    fontFamily: 'Archivo Narrow',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  labelData: {
    fontFamily: 'monospace',
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
  backgroundColor: DARK_THEME.background.card,
  borderWidth: 1,
  borderColor: DARK_THEME.border.muted,
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
    normal: DARK_THEME.border.default,
  };
  return createStatusBorderCard(borderColors[pulseType] || borderColors.normal);
};
