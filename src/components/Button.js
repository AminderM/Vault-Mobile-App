import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../lib/theme';

const theme = colors.dark;

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  ...props
}) {
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
    danger: {
      backgroundColor: theme.primary,
      color: theme.primaryText,
    },
  };

  const sizes = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 12,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    large: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      fontSize: 16,
    },
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderWidth: variantStyle.borderWidth || 0,
          borderColor: variantStyle.borderColor || 'transparent',
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyle.fontSize,
            color: variantStyle.color,
          },
          disabled && styles.disabledText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.6,
  },
});
