import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { pickFile } from '../lib/filePicker';
import { uploadFileToVault } from '../lib/api';
import { scheduleExpiryReminders } from '../lib/expiryNotifications';
import { colors } from '../lib/theme';

const theme = colors.dark;

const DOCUMENT_CATEGORIES = [
  { id: 'invoices', label: 'Invoices', icon: '📄' },
  { id: 'bills-of-lading', label: 'Bills of Lading', icon: '📦' },
  { id: 'rate-confirmations', label: 'Rate Confirmations', icon: '📋' },
  { id: 'safety-compliance', label: 'Safety & Compliance', icon: '🛡️' },
  { id: 'business-docs', label: 'Business Docs', icon: '🏢' },
  { id: 'expense-receipts', label: 'Expense Receipts', icon: '💰' },
  { id: 'other', label: 'Other', icon: '📝' },
];

export default function FilePickerScreen({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handlePickFile = async () => {
    try {
      const file = await pickFile({
        allowedTypes: ['image/*', 'application/pdf'],
      });
      if (file) {
        setSelectedFile(file);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setUploading(true);
      const uploadData = {
        file: selectedFile,
        category: selectedCategory,
        expiryDate: expiryDate || null,
        notes: notes || null,
      };

      const result = await uploadFileToVault(uploadData);

      if (expiryDate) {
        const categoryLabel = DOCUMENT_CATEGORIES.find(
          (c) => c.id === selectedCategory
        )?.label;
        await scheduleExpiryReminders(
          result.id,
          selectedCategory,
          categoryLabel,
          expiryDate
        );
      }

      Alert.alert('Success', 'File uploaded to vault!', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedFile(null);
            setSelectedCategory(null);
            setExpiryDate('');
            setNotes('');
            if (onClose) onClose();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Upload Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Upload to Vault</Text>
            <Text style={styles.subtitle}>Add files manually to your vault</Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* File Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Select File</Text>
        <TouchableOpacity
          style={styles.pickButton}
          onPress={handlePickFile}
          disabled={uploading}
        >
          <Text style={styles.pickButtonText}>
            {selectedFile ? `✅ ${selectedFile.name}` : '📁 Pick File'}
          </Text>
        </TouchableOpacity>
        {selectedFile && (
          <Text style={styles.fileInfo}>
            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Text>
        )}
      </View>

      {/* Category Selection */}
      {selectedFile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Choose Category</Text>
          <View style={styles.categoryGrid}>
            {DOCUMENT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id &&
                    styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === category.id &&
                      styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Expiry Date */}
      {selectedCategory && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Expiry Date (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.secondaryText}
            value={expiryDate}
            onChangeText={setExpiryDate}
          />
        </View>
      )}

      {/* Notes */}
      {selectedCategory && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add notes about this file..."
            placeholderTextColor={theme.secondaryText}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      {/* Upload Button */}
      {selectedFile && selectedCategory && (
        <View style={styles.actionContainer}>
          {uploading && (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={styles.loader}
            />
          )}
          <TouchableOpacity
            style={[
              styles.uploadButton,
              uploading && styles.uploadButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : '📤 Upload to Vault'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    backgroundColor: theme.primary,
    padding: 20,
    paddingTop: 12,
  },
  closeBtn: {
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 22,
    color: theme.primaryText,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.primaryText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.primaryText,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.light,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primaryText,
    marginBottom: 12,
  },
  pickButton: {
    backgroundColor: theme.background.secondary,
    borderWidth: 2,
    borderColor: theme.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  fileInfo: {
    fontSize: 12,
    color: theme.secondaryText,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.light,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: theme.secondaryText,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: theme.primaryText,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.primaryText,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionContainer: {
    padding: 16,
    marginBottom: 20,
  },
  loader: {
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primaryText,
  },
});
