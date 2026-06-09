import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../lib/theme';

const theme = colors.dark;

export default function Card({ children, style, leftBorder = true, ...props }) {
  return (
    <View
      style={[
        styles.card,
        leftBorder && styles.cardWithBorder,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border.light,
    marginBottom: 12,
  },
  cardWithBorder: {
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
});
