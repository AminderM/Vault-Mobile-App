// Color Theme System
// Provides consistent colors across light and dark modes

export const LIGHT_MODE = {
  primary: '#FF3B30',
  primaryText: '#ffffff',
  secondaryText: '#999999',
  tertiaryText: '#666666',

  background: {
    primary: '#1a1a1a',
    secondary: '#2a2a2a',
    tertiary: '#333333',
  },

  border: {
    light: '#333333',
    medium: '#444444',
    dark: '#555555',
  },

  status: {
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#FF3B30',
  },

  interactive: {
    pressed: 0.8, // opacity
    disabled: 0.5,
  },
};

export const DARK_MODE = {
  primary: '#FF3B30',
  primaryText: '#ffffff',
  secondaryText: '#999999',
  tertiaryText: '#666666',

  background: {
    primary: '#1a1a1a',
    secondary: '#2a2a2a',
    tertiary: '#333333',
  },

  border: {
    light: '#333333',
    medium: '#444444',
    dark: '#555555',
  },

  status: {
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#FF3B30',
  },

  interactive: {
    pressed: 0.8,
    disabled: 0.5,
  },
};

// Get current theme (default to dark mode)
export const getTheme = (isDarkMode = true) => {
  return isDarkMode ? DARK_MODE : LIGHT_MODE;
};

// Helper to create pressed state style
export const getPressedStyle = (baseOpacity = 1) => {
  return {
    opacity: baseOpacity * DARK_MODE.interactive.pressed,
  };
};

// Helper to create button style
export const createButtonStyle = (theme, variant = 'primary') => {
  const variants = {
    primary: {
      backgroundColor: theme.primary,
      color: theme.primaryText,
    },
    secondary: {
      backgroundColor: theme.background.secondary,
      color: theme.primaryText,
      borderWidth: 1,
      borderColor: theme.border.light,
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.primary,
      borderWidth: 1,
      borderColor: theme.primary,
    },
  };

  return variants[variant] || variants.primary;
};

// Helper to create text style
export const createTextStyle = (theme, variant = 'body') => {
  const variants = {
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.primaryText,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.primaryText,
    },
    body: {
      fontSize: 14,
      color: theme.primaryText,
    },
    caption: {
      fontSize: 12,
      color: theme.secondaryText,
    },
    small: {
      fontSize: 11,
      color: theme.tertiaryText,
    },
  };

  return variants[variant] || variants.body;
};

// Helper to create card style
export const createCardStyle = (theme) => {
  return {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  };
};

// Default theme colors for quick access
export const colors = {
  light: LIGHT_MODE,
  dark: DARK_MODE,
};
