# Feature: PDF Document Support

**Status:** 🔄 In Progress  
**Priority:** 2  
**Effort:** 3-4 hours  
**Branch:** `feature/pdf-support`

---

## What's This Feature?

Currently, users can only upload **images** (photos from camera/gallery).

We're adding support for **PDF files** so users can:
- Scan a document as a photo → Convert to PDF (in Phase 2B)
- Upload existing PDF files directly
- Submit PDFs to all scanning endpoints (rate confirmation, receipt, smart scan)

---

## Implementation Plan

### Step 1: Install Document Picker Library

We need a library that can pick ANY file type (not just images).

```bash
npm install expo-document-picker --legacy-peer-deps
```

### Step 2: Create a File Picker Utility

Create `src/lib/filePicker.js`:

```javascript
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export const pickFile = async (options = {}) => {
  const { allowedTypes = ['image/*', 'application/pdf'] } = options;
  
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: allowedTypes,
    });

    if (!result.cancelled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to pick file: ${error.message}`);
  }
};

export const takePhoto = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.cancelled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to take photo: ${error.message}`);
  }
};

export const pickFromGallery = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.cancelled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to pick from gallery: ${error.message}`);
  }
};

export const validateFileSize = (uri, maxSizeMB = 10) => {
  // File size validation (basic - actual size checking happens on backend)
  const maxBytes = maxSizeMB * 1024 * 1024;
  return true; // Backend will reject if too large
};

export const getFileType = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};
```

### Step 3: Update SmartScanScreen to Support PDFs

Add a new button for "Upload Document" alongside "Take Photo" and "Pick from Gallery":

**In SmartScanScreen.js, update the button section:**

```javascript
import { pickFile, takePhoto, pickFromGallery } from '../lib/filePicker';

// Add new handler:
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

// Update scanDocument to handle PDFs:
const scanDocument = async (asset) => {
  try {
    setLoading(true);
    const file = {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.name || 'document',
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

// Add button in JSX:
<TouchableOpacity
  style={styles.button}
  onPress={handlePickDocument}
  disabled={loading}
>
  <Text style={styles.buttonText}>📄 Upload Document</Text>
</TouchableOpacity>
```

### Step 4: Update ScanRateConScreen

Add PDF support to rate confirmation scanner (same pattern as SmartScanScreen).

### Step 5: Update ScanReceiptScreen

Add PDF support to receipt scanner.

### Step 6: Update API Calls

The backend already supports PDFs. Just ensure the file type is correct when uploading:

```javascript
// In src/lib/api.js
export async function scanIdentify(file) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  });

  const response = await fetch(
    `${getEnv().apiUrl}/api/driver-mobile/scan/identify`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Scan failed');
  }

  return await response.json();
}
```

---

## Testing Checklist

### Web Testing
- [ ] Create test PDF file locally
- [ ] Can upload PDF via file picker
- [ ] Can still take photos
- [ ] Can still pick from gallery
- [ ] File type validation works

### Mobile Testing
- [ ] Can access files on iPhone
- [ ] Can upload PDF from Files app
- [ ] Can upload image from Photos
- [ ] Extracted data displays correctly

### Backend Integration
- [ ] PDF uploads succeed
- [ ] Backend processes PDFs correctly
- [ ] Results display in app
- [ ] No errors in console

---

## Error Handling

Handle these error cases:

```javascript
// File too large
if (fileSize > 10 * 1024 * 1024) {
  Alert.alert('Error', 'File is too large (max 10MB)');
}

// Unsupported file type
const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
if (!validTypes.includes(file.type)) {
  Alert.alert('Error', 'Unsupported file type. Use PDF or image.');
}

// Network error
if (error.message.includes('Network')) {
  Alert.alert('Error', 'Network error. Check your connection.');
}
```

---

## What's Next After This?

Once PDF support is done:
1. Priority 3: Expense Records (5-6 hours)
2. Priority 4: Load Management (6-8 hours)
3. Priority 5: File Picker (3-4 hours)
4. Then Phase 2B features (Offline, Dark mode, etc.)

---

## Files to Modify

- `src/lib/filePicker.js` - NEW (utility functions)
- `src/screens/SmartScanScreen.js` - ADD PDF button
- `src/screens/ScanRateConScreen.js` - ADD PDF button
- `src/screens/ScanReceiptScreen.js` - ADD PDF button
- `src/lib/api.js` - ENSURE PDF support

---

## Commit Message

```
feat: Add PDF document support

- Install expo-document-picker for file selection
- Create filePicker utility with PDF support
- Add "Upload Document" button to SmartScanScreen
- Support PDFs in rate confirmation and receipt scanners
- Handle PDF uploads via existing API endpoints

Users can now upload PDFs directly instead of only images.
Phase 2A Priority 2 feature.
```
