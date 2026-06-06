import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { pickFile, takePhoto, pickFromGallery } from '../lib/filePicker';
import { scanIdentify, saveDocument } from '../lib/api';
import { scheduleExpiryReminders } from '../lib/expiryNotifications';
import { colors } from '../lib/theme';

const theme = colors.dark;

export default function SmartScanScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');

  const categories = [
    'License',
    'Insurance',
    'Inspection',
    'Registration',
    'Other',
  ];

  const handlePickImage = async () => {
    try {
      const file = await pickFromGallery();
      if (file) {
        await scanDocument(file);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const file = await takePhoto();
      if (file) {
        await scanDocument(file);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePickDocument = async () => {
    try {
      const file = await pickFile({
        allowedTypes: ['image/*', 'application/pdf'],
      });
      if (file) {
        await scanDocument(file);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const scanDocument = async (asset) => {
    try {
      setLoading(true);
      const file = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'document.jpg',
      };

      const response = await scanIdentify(file);
      setResult(response);
      if (response.expiryDate) {
        setExpiryDate(response.expiryDate);
      }
    } catch (error) {
      Alert.alert('Scan Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveScannedDocument = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a document category');
      return;
    }

    try {
      setLoading(true);
      const docData = {
        ...result,
        docType: selectedCategory,
        expiryDate: expiryDate || null,
        uploadedAt: new Date().toISOString(),
      };

      const saved = await saveDocument(docData);

      if (expiryDate) {
        await scheduleExpiryReminders(
          saved.id,
          selectedCategory,
          selectedCategory,
          expiryDate
        );
      }

      Alert.alert('Success', 'Document saved to vault');
      setResult(null);
      setSelectedCategory(null);
      setExpiryDate('');
    } catch (error) {
      Alert.alert('Save Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditData = () => {
    const dataToEdit = {
      docType: selectedCategory,
      expiryDate: expiryDate,
      ...result,
    };

    Alert.alert(
      'Edit Form',
      'Full edit form will open here in the mobile version.\n\nData to edit:\n' +
      JSON.stringify(dataToEdit, null, 2)
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleTakePhoto}
          disabled={loading}
        >
          <Text style={styles.buttonText}>📸 Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handlePickImage}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🖼️ Pick from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.pdfButton]}
          onPress={handlePickDocument}
          disabled={loading}
        >
          <Text style={styles.buttonText}>📄 Upload Document</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Scanning document...</Text>
        </View>
      )}

      {result && (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Document Detected</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === cat &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Expiry Date (if detected)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, styles.editButton]}
              onPress={handleEditData}
              disabled={!selectedCategory}
            >
              <Text style={styles.saveButtonText}>✏️ Edit Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveScannedDocument}
              disabled={!selectedCategory}
            >
              <Text style={styles.saveButtonText}>Save to Vault</Text>
            </TouchableOpacity>
          </View>
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
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  pdfButton: {
    backgroundColor: theme.status.warning,
  },
  buttonText: {
    color: theme.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.secondaryText,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: theme.primaryText,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.primaryText,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border.light,
    backgroundColor: theme.background.secondary,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryButtonText: {
    fontSize: 13,
    color: theme.secondaryText,
  },
  categoryButtonTextActive: {
    color: theme.primaryText,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.background.secondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border.light,
    padding: 12,
    fontSize: 14,
    color: theme.primaryText,
  },
  saveButton: {
    backgroundColor: theme.status.success,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: theme.status.warning,
  },
});