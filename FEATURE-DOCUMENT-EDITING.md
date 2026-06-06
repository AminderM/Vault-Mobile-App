# Feature: Document Editing Form

**Status:** 🔄 In Progress  
**Priority:** 1 (Highest ROI)  
**Effort:** 4-6 hours  
**Branch:** `feature/document-editing`

---

## What's Done ✅

- [x] Created `EditDocumentScreen.js` component
- [x] Handles form field editing
- [x] Save and Cancel buttons with confirmation
- [x] Loading states

## What's Next 🔄

You need to integrate the EditDocumentScreen into each scanner's flow.

---

## How to Test the Feature

### Step 1: Add Edit Button to SmartScanScreen

Update `src/screens/SmartScanScreen.js` - add an "Edit Data" button before "Save to Vault":

**Change this:**
```javascript
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveScannedDocument}
            disabled={!selectedCategory}
          >
            <Text style={styles.saveButtonText}>Save to Vault</Text>
          </TouchableOpacity>
```

**To this:**
```javascript
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
```

### Step 2: Add Handler Function

Add this to SmartScanScreen (above the return statement):

```javascript
  const handleEditData = () => {
    const dataToEdit = {
      docType: selectedCategory,
      expiryDate: expiryDate,
      ...result,
    };

    // For now, just show an alert with the data
    Alert.alert(
      'Edit Form',
      'Full edit form will open here in the mobile version.\n\nData to edit:\n' +
      JSON.stringify(dataToEdit, null, 2)
    );

    // In mobile app, you would navigate to EditDocumentScreen:
    // navigation.navigate('EditDocument', {
    //   extractedData: dataToEdit,
    //   onSave: handleSaveEdited,
    // });
  };

  const handleSaveEdited = async (editedData) => {
    setExpiryDate(editedData.expiryDate);
    setSelectedCategory(editedData.docType);
    setResult({
      ...result,
      ...editedData,
    });
  };
```

### Step 3: Add Styling

Add this to the styles at the bottom:

```javascript
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FF9500',
  },
```

### Step 4: Test on Web

```bash
# Start web version
REACT_APP_ENV=staging npm run web

# Test workflow:
1. Click "Smart Scan" tab
2. Click "Take Photo" or "Pick from Gallery"
3. Select a document category
4. Click "✏️ Edit Data" button
5. Should see alert with extracted data
```

---

## Full Mobile Implementation (For Later)

When you're ready to test on iPhone/Android, integrate with React Navigation:

### 1. Update App.js or Navigation Stack

```javascript
import EditDocumentScreen from './src/screens/EditDocumentScreen';

// In your SmartScanStack navigator:
<Stack.Screen
  name="EditDocument"
  component={EditDocumentScreen}
  options={{ title: 'Edit Document' }}
/>
```

### 2. Update SmartScanScreen Navigation

```javascript
export default function SmartScanScreen({ navigation }) {
  // ... existing code ...

  const handleEditData = () => {
    navigation.navigate('EditDocument', {
      extractedData: {
        docType: selectedCategory,
        expiryDate: expiryDate,
        ...result,
      },
      onSave: handleSaveEdited,
      screenTitle: 'Edit Smart Scan Data',
    });
  };

  // ... rest of component ...
}
```

---

## Testing Checklist

### Web Testing
- [ ] "✏️ Edit Data" button appears
- [ ] Button shows alert with extracted data
- [ ] Alert shows all fields to be edited
- [ ] Can dismiss alert and continue

### Mobile Testing (When Ready)
- [ ] Click "Edit Data" opens form
- [ ] All fields are editable
- [ ] Can modify values
- [ ] "Cancel" shows confirmation dialog
- [ ] "Save & Continue" saves and goes back
- [ ] Edited data is used when saving to vault

---

## Repeat for Other Scanners

Follow the same pattern for:

### ScanRateConScreen
```javascript
// Fields to edit:
- vehicle
- rate
- date
- carrier
- confirmationNumber (if available)
```

### ScanReceiptScreen
```javascript
// Fields to edit:
- vendor
- amount
- date
- description
- category
```

---

## Web Version vs Mobile

### Web (What We're Testing First)
- Shows alert dialog with extracted data
- User can see what would be edited
- This validates the concept

### Mobile (Full Implementation)
- Opens EditDocumentScreen component
- Full form with TextInputs
- Save and Cancel buttons
- Callback to parent screen

---

## API Integration

The `EditDocumentScreen` uses the `onSave` callback, which should call the API:

```javascript
// In parent screen:
const handleSaveEdited = async (editedData) => {
  // Option 1: Update and save new document
  const docData = {
    ...editedData,
    uploadedAt: new Date().toISOString(),
  };
  await saveDocument(docData);

  // Option 2: Update existing document
  // await api.updateDocument(docId, editedData);
};
```

---

## Next Steps

1. **Add Edit Button to SmartScanScreen** ✅ This is your first task
2. Test on web to verify concept works
3. Integrate EditDocumentScreen with React Navigation
4. Repeat for ScanRateConScreen and ScanReceiptScreen
5. Build Phase 2B feature: PDF Support

---

## Files Modified

- `src/screens/EditDocumentScreen.js` - NEW
- `src/screens/SmartScanScreen.js` - ADD edit button
- `src/screens/ScanRateConScreen.js` - ADD edit button (later)
- `src/screens/ScanReceiptScreen.js` - ADD edit button (later)

---

## Commit Message

```
feat: Add document editing form support

- Create EditDocumentScreen component with form fields
- Add edit button to SmartScanScreen
- Users can now review/edit extracted data before saving
- Supports save and cancel with confirmation

Phase 2A Priority 1 feature partially implemented.
Full mobile navigation integration in follow-up commit.
```
