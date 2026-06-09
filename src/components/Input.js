import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../lib/theme';

const theme = colors.dark;

export default function Input({
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  style,
  ...props
}) {
  return (
    <TextInput
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        style,
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme.secondaryText}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={numberOfLines}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.light,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: theme.primaryText,
    marginBottom: 12,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
