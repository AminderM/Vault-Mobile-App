# Feature: File Picker (Manual Upload to Vault)

**Status:** 🔄 In Progress  
**Priority:** 5 (Final Phase 2A Feature)  
**Effort:** 3-4 hours  
**Branch:** `feature/file-picker`

---

## What's This Feature?

Users can now **manually upload files directly to the vault** without needing to scan them first.

Based on the PWA, File Picker allows users to:
- 📁 Browse and select files from their device
- 📸 Upload images, PDFs, or documents
- 🏷️ Categorize files (Invoices, Bills of Lading, Rate Confirmations, etc.)
- 📅 Set expiry dates for tracking
- 💾 Save to vault with metadata

---

## Design Reference (From PWA)

### File Picker Flow
```
VAULT TAB
├─ [+ UPLOAD] Button
│
└─ File Upload Dialog
   ├─ Select file
   ├─ Choose category
   ├─ Set expiry date
   └─ [SAVE] / [CANCEL]
```

### Document Categories (From PWA Vault)
- 📄 Invoices
- 📦 Bills of Lading
- 📋 Rate Confirmations
- 🛡️ Safety & Compliance
- 🏢 Business Docs
- 💰 Expense Receipts
- 📝 Other

---

## Implementation Plan

### Step 1: Create File Picker Types

Create `src/types/fileUpload.ts`:

```typescript
export interface FileUploadInput {
  file: {
    uri: string;
    type: string;
    name: string;
  };
  category: string;
  expiryDate?: string;
  notes?: string;
}

export interface UploadedFile {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  category: string;
  expiryDate?: string;
  notes?: string;
}

export type DocumentCategory =
  | 'invoices'
  | 'bills-of-lading'
  | 'rate-confirmations'
  | 'safety-compliance'
  | 'business-docs'
  | 'expense-receipts'
  | 'other';

export interface DocumentCategoryInfo {
  id: DocumentCategory;
  label: string;
  icon: string;
  description: string;
}
```

### Step 2: Create File Upload API Functions

Update `src/lib/api.js`:

```javascript
export async function uploadFileToVault(fileData, api = API_BASE) {
  const formData = new FormData();
  formData.append('file', {
    uri: fileData.file.uri,
    type: fileData.file.type,
    name: fileData.file.name,
  });
  formData.append('category', fileData.category);
  if (fileData.expiryDate) {
    formData.append('expiryDate', fileData.expiryDate);
  }
  if (fileData.notes) {
    formData.append('notes', fileData.notes);
  }

  const res = await fetch(`${api}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 413) throw new Error('File too large (max 10MB)');
    if (status === 415) throw new Error('Unsupported file type');
    throw new Error('Failed to upload file');
  }

  return await res.json();
}

export async function getDocumentCategories(api = API_BASE) {
  const res = await fetch(`${api}/api/documents/categories`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch categories');
  return await res.json();
}
```

### Step 3: Create File Picker Screen

Create `src/screens/FilePickerScreen.js`:

```javascript
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

export default function FilePickerScreen() {
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
        <Text style={styles.title}>Upload to Vault</Text>
        <Text style={styles.subtitle}>Add files manually to your vault</Text>
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
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
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
```

### Step 4: Integrate into Vault Tab

Update `src/components/app-tabs.web.tsx`:

Replace the vault case to show FilePickerScreen instead of the placeholder.

### Step 5: Test on Web

```bash
npm run web

# Test workflow:
1. Click "Vault" tab
2. Click "📁 Pick File"
3. Select an image or PDF
4. Choose a category
5. (Optional) Set expiry date and notes
6. Click "📤 Upload to Vault"
```

---

## Testing Checklist

### Web Testing
- [ ] File picker dialog opens
- [ ] Can select image or PDF
- [ ] File name displays
- [ ] File size shows correctly
- [ ] Category selection works
- [ ] All 7 categories available
- [ ] Date input works
- [ ] Notes textarea works
- [ ] Upload button triggers upload
- [ ] Success message appears
- [ ] Form resets after upload

### Mobile Testing
- [ ] Works on iOS
- [ ] Works on Android
- [ ] File permissions requested
- [ ] Responsive layout
- [ ] Touch interactions smooth

---

## Files to Create/Modify

- `src/types/fileUpload.ts` - NEW (TypeScript types)
- `src/screens/FilePickerScreen.js` - NEW (main component)
- `src/lib/api.js` - UPDATE (add upload endpoint)
- `src/components/app-tabs.web.tsx` - UPDATE (integrate screen)
- `FEATURE-FILE-PICKER.md` - THIS FILE

---

## Commit Message

```
feat: Add manual file upload to vault

- Create FilePickerScreen with category selection
- Support image and PDF file uploads
- Allow expiry date and notes for files
- Add file upload API endpoint
- Integrate file picker into vault tab
- Support all document categories from PWA

Phase 2A Priority 5 complete - FINAL FEATURE!
Full feature parity with PWA achieved.
Ready for production release.
```

---

## Phase 2A Complete! 🎉

After this feature:
- ✅ Document Editing
- ✅ PDF Support  
- ✅ Expense Records
- ✅ Load Management
- ✅ File Picker

**Phase 2A is 100% COMPLETE - Full feature parity with PWA!**

Next: Production release & App Store submission! 🚀
