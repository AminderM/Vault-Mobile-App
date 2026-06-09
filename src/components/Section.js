import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../lib/theme';

const theme = colors.dark;

export default function Section({
  title,
  subtitle,
  children,
  style,
  ...props
}) {
  return (
    <View style={[styles.section, style]} {...props}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.light,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primaryText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.secondaryText,
  },
  content: {
    gap: 12,
  },
});
