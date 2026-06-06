# Vault Mobile App - Developer Guide

## Overview

This is a React Native version of the Integra Vault PWA (web app). It provides native iOS and Android apps with identical features to the web version, enabling publishing to Apple App Store and Google Play Store.

**Why React Native?**
- Web PWA cannot be published to app stores
- React Native provides native performance and app store support
- Code sharing with backend API (same endpoints as web)
- Native access to camera, location, notifications, storage

**Backend:** Separate repository - connects to existing staging/production API

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli` (for building)
- Android Studio (for Android emulator) or physical Android/iOS device

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/AminderM/Vault-Mobile-App.git
cd Vault-Mobile-App

# 2. Install dependencies
npm install

# 3. Configure environment (update if needed)
# .env already has: REACT_APP_BACKEND_URL=https://api.staging.integratedtech.ca

# 4. Start development server
npm start

# 5. Choose platform:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Press 'w' for web browser
# - Press 's' to scan QR code with Expo Go app
```

---

## Architecture

### Folder Structure
```
src/
├── screens/              # App screens
│   ├── HomeScreen.js
│   ├── ScanRateConScreen.js    # Rate confirmation scanner
│   ├── ScanReceiptScreen.js    # Receipt scanner
│   ├── SmartScanScreen.js      # Universal doc scanner
│   └── DocumentVaultScreen.js  # Document list & management
├── lib/
│   ├── api.js            # Backend API client
│   └── expiryNotifications.js  # Expiry reminder system
└── components/           # Reusable components (if added)
```

### Navigation
- **Bottom Tab Navigation** with 4 main tabs:
  1. **My Loads** - Scan Rate Confirmations
  2. **Expenses** - Scan Receipts
  3. **Smart Scan** - Universal document scanner
  4. **Vault** - View and manage all documents

- **Stack Navigation** within each tab for detail screens

---

## Feature Checklist

### ✅ Implemented
- [x] Bottom tab navigation
- [x] Rate Confirmation Scanner (camera + gallery)
- [x] Receipt Scanner (camera + gallery)
- [x] Smart Scan with document identification
- [x] Document Vault (list, view, delete)
- [x] Expiry date detection and tracking
- [x] Expiry reminder notifications (60/30/15/7/1 days before + overdue)
- [x] API client with error handling
- [x] Camera and location permissions
- [x] Android build configuration

### 🔄 To Implement
- [ ] PDF document support (currently images only)
- [ ] Document upload with file picker
- [ ] OCR for additional fields beyond expiry
- [ ] Offline document caching
- [ ] Sync status indicators
- [ ] User authentication/login
- [ ] Document sharing/export
- [ ] iOS optimization (safe area, icons)
- [ ] Dark mode support
- [ ] Push notifications (currently local only)

---

## Backend API Endpoints

All endpoints are relative to `REACT_APP_BACKEND_URL` (see .env)

### Document Scanning
```
POST /api/driver-mobile/rate-con/parse
  Request: FormData with 'file' (image/pdf)
  Response: { vehicle, rate, expiryDate, ... }

POST /api/driver-mobile/receipt/parse
  Request: FormData with 'file'
  Response: { vendor, amount, date, description, ... }

POST /api/driver-mobile/scan/identify
  Request: FormData with 'file'
  Response: { docType, expiryDate, ... }
```

### Document Management
```
GET  /api/documents
  Response: [{ id, docType, expiryDate, uploadedAt, ... }]

POST /api/documents
  Request: { docType, expiryDate, description, uploadedAt, ... }
  Response: { id, ... }

PUT  /api/documents/:docId
  Request: { docType, expiryDate, description, ... }
  Response: { id, ... }

DELETE /api/documents/:docId
  Response: { success: true }

GET  /api/documents/:docId
  Response: { id, docType, ... }
```

**Error Codes:**
- `415` - Unsupported file type
- `413` - File too large
- `503` - Scanner not configured (API key missing)
- `422` - Cannot read document (OCR failed)

---

## Development Workflow

### Adding a New Screen

1. **Create screen file** in `src/screens/NewScreen.js`:
```javascript
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default function NewScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text>Your content here</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
});
```

2. **Add to navigation** in `App.js`:
```javascript
import NewScreen from './src/screens/NewScreen';

// In tab navigator:
<Tab.Screen name="NewTab" component={NewScreen} options={{ title: 'New Tab' }} />
```

### Using the API Client

```javascript
import { scanRateCon, listDocuments, saveDocument } from '../lib/api';

// Scan a document
const file = { uri: photoUri, type: 'image/jpeg', name: 'photo.jpg' };
const result = await scanRateCon(file);

// List documents
const docs = await listDocuments();

// Save document
const saved = await saveDocument({
  docType: 'License',
  expiryDate: '2026-12-31',
  description: 'Driver License'
});
```

### Using Expiry Notifications

```javascript
import { 
  scheduleExpiryReminders, 
  cancelExpiryReminders,
  checkDueNotifications
} from '../lib/expiryNotifications';

// Schedule reminders when saving a document
await scheduleExpiryReminders(docId, 'License', 'license', '2026-12-31');

// Cancel reminders when deleting
await cancelExpiryReminders(docId);

// Check for due notifications (runs on app load)
const due = await checkDueNotifications();
```

---

## Testing

### Local Testing
```bash
# Start dev server
npm start

# Test on Android emulator
npm run android

# Test on iOS simulator (macOS only)
npm run ios

# Test on web (quick debugging)
npm run web
```

### Manual Testing Checklist
- [ ] Open app and see home screen
- [ ] Tap "Scan Rate Confirmation" and take/pick photo
- [ ] Verify scan result displays correctly
- [ ] Save scanned document to vault
- [ ] Open Document Vault and see saved documents
- [ ] Delete a document
- [ ] Test with documents having expiry dates
- [ ] Verify expiry reminders trigger
- [ ] Test offline behavior (airplane mode)

### Device Testing
```bash
# Build for internal testing
eas build --platform android --profile preview

# QR code will be generated - scan to download and install
```

---

## Building for Production

### Android

**Build APK (for testing):**
```bash
eas build --platform android --profile preview
```

**Build AAB (for Play Store):**
```bash
eas build --platform android --profile production
```

**Submit to Google Play:**
```bash
eas submit --platform android --latest
```

### iOS

**Build for TestFlight:**
```bash
eas build --platform ios --profile preview
```

**Build for App Store:**
```bash
eas build --platform ios --profile production
```

**Submit to App Store:**
```bash
eas submit --platform ios --latest
```

### Pre-submission Checklist
- [ ] Update version in `app.json`
- [ ] Update `CHANGELOG.md`
- [ ] Test on real devices (Android & iOS)
- [ ] Test all scanning features
- [ ] Verify notifications work
- [ ] Check permissions prompts
- [ ] Test with slow network
- [ ] Verify backend API is correct

---

## Configuration Files

### `app.json`
Expo configuration:
- App name: "Integra Vault"
- Package name: `com.integraatech.vault`
- Permissions: Camera, Location, Notifications
- Plugins: expo-image-picker, expo-location, expo-notifications

### `eas.json`
Build profiles:
- `development` - Dev client with fast refresh
- `preview` - Internal testing (APK for Android, archive for iOS)
- `production` - Store submission (AAB for Android, archive for iOS)

### `.env`
Environment variables:
```
REACT_APP_BACKEND_URL=https://api.staging.integratedtech.ca
```
Update for production:
```
REACT_APP_BACKEND_URL=https://api.integratedtech.ca
```

---

## Troubleshooting

### Metro Bundler Errors
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Build Failures
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
expo prebuild --clean
```

### API Connection Issues
1. Check `.env` has correct backend URL
2. Verify backend is accessible: `curl https://api.staging.integratedtech.ca`
3. Test from phone: open browser to backend URL
4. Check CORS headers in backend logs

### Notification Issues
- On Android: Check notification permissions in settings
- On iOS: Check notification settings in Settings app
- Use Expo Notifications documentation for debugging

### Camera Permission Issues
```javascript
// Debug permissions
import * as MediaLibrary from 'expo-media-library';
const { status } = await MediaLibrary.requestPermissionsAsync();
console.log('Camera permission status:', status);
```

---

## Performance Tips

1. **Image Optimization**: Compress images before sending to backend
   ```javascript
   import { manipulateAsync } from 'expo-image-manipulator';
   const optimized = await manipulateAsync(uri, [{ resize: { width: 1200 } }], { compress: 0.7 });
   ```

2. **Lazy Loading**: Load documents on demand in Vault screen
   ```javascript
   useFocusEffect(useCallback(() => { loadDocuments(); }, []));
   ```

3. **Caching**: Cache document list with AsyncStorage
   ```javascript
   const cached = await AsyncStorage.getItem('documents');
   ```

---

## Security Considerations

1. **API Keys**: Never commit API keys to git
   - Use `.env` file (ignored by git)
   - For production, use EAS secrets:
   ```bash
   eas secret:create --scope project --name BACKEND_API_KEY
   ```

2. **Secure Storage**: For sensitive data (tokens, passwords)
   ```javascript
   import * as SecureStore from 'expo-secure-store';
   await SecureStore.setItemAsync('token', value);
   ```

3. **HTTPS Only**: Always use HTTPS for backend calls

---

## Useful Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build](https://docs.expo.dev/build-reference/apk/)

---

## Common Commands

```bash
# Development
npm start                      # Start dev server
npm run android              # Run on Android emulator
npm run ios                  # Run on iOS simulator
npm run web                  # Run on web browser

# Building
eas build --platform android  # Build Android
eas build --platform ios      # Build iOS
eas submit                     # Submit to stores

# Maintenance
npm install                   # Install dependencies
npm audit                     # Check vulnerabilities
npm run lint                  # Run ESLint
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create pull request on GitHub
```

---

## Questions?

Refer to:
- Backend API docs (separate repo)
- Web app implementation (for feature reference)
- Expo/React Native official docs
- GitHub issues for bug reports

---

**Last Updated:** 2026-06-04
**Status:** Phase 2 (Mobile App Development)