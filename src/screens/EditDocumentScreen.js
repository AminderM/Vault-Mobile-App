import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import { BRAND, TYPOGRAPHY, SPACING, useTheme, createThemedStyleSheet } from '../lib/theme';

export default function EditDocumentScreen({
  navigation,
  route,
}) {
  const { extractedData, onSave, screenTitle = 'Edit Document' } = route?.params || {};

  const [formData, setFormData] = useState(extractedData || {});
  const [isLoading, setIsLoading] = useState(false);
  const { t: T } = useTheme();
  const styles = useStyles();

  const handleFieldChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!formData || Object.keys(formData).length === 0) {
      Alert.alert('Error', 'No data to save');
      return;
    }

    setIsLoading(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
      Alert.alert('Success', 'Document saved successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel', 'Discard changes?', [
      {
        text: 'Keep Editing',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Discard',
        onPress: () => navigation.goBack(),
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{screenTitle}</Text>
        <Text style={styles.subtitle}>Review and edit extracted information</Text>
      </View>

      <View style={styles.formContainer}>
        {Object.entries(formData).map(([key, value]) => (
          <View key={key} style={styles.fieldContainer}>
            <Text style={styles.label}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <TextInput
              style={styles.input}
              value={String(value || '')}
              onChangeText={(text) => handleFieldChange(key, text)}
              placeholder={`Enter ${key}`}
              placeholderTextColor={T.text.muted}
              multiline={key.includes('description') || key.includes('text')}
              numberOfLines={key.includes('description') ? 4 : 1}
            />
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const useStyles = createThemedStyleSheet((T) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.background.base,
  },
  header: {
    backgroundColor: T.primary,
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: T.text.secondary,
  },
  formContainer: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text.primary,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  input: {
    backgroundColor: T.background.card,
    borderWidth: 1,
    borderColor: T.border.default,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: T.text.primary,
    minHeight: 44,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: T.background.container,
    borderWidth: 1,
    borderColor: T.border.variant,
  },
  cancelButtonText: {
    color: T.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: T.primary,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
}));
