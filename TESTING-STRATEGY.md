# Testing & Staging Strategy

**Goal:** Safely test new features before they reach live customers

---

## Three Environments

```
LOCAL DEV          STAGING            PRODUCTION (LIVE)
(Your Computer)    (Testing)          (Real Users)
      ↓                ↓                    ↓
staging backend  →  staging backend  →  production backend
staging app      →  staging app      →  production app
```

### 1. **LOCAL DEV** (Where you code)
- Your computer
- `npm run web` or Expo Go
- Backend: `https://api.staging.integratedtech.ca`
- Test new features before anyone else

### 2. **STAGING** (Where team tests)
- Separate app build via EAS
- Distribution: QR code or TestFlight/Play Store internal track
- Backend: `https://api.staging.integratedtech.ca` (same as dev)
- Real iPhone/Android devices
- Team tests before anything goes live

### 3. **PRODUCTION** (Live for customers)
- Official App Store & Play Store version
- Backend: `https://api.integratedtech.ca`
- Real customers using the app
- Only after staging passes all tests

---

## Environment Configuration

### Setup Multiple Environments

**Step 1:** Create environment-specific configs

```
src/
├── env/
│  ├── dev.js
│  ├── staging.js
│  └── production.js
└── lib/
   └── api.js
```

**Step 2:** Update `.env` to support environments

```env
# .env.development
REACT_APP_BACKEND_URL=https://api.staging.integratedtech.ca
REACT_APP_ENV=development

# .env.staging
REACT_APP_BACKEND_URL=https://api.staging.integratedtech.ca
REACT_APP_ENV=staging

# .env.production
REACT_APP_BACKEND_URL=https://api.integratedtech.ca
REACT_APP_ENV=production
```

**Step 3:** Use in api.js

```javascript
const backendUrl = process.env.REACT_APP_BACKEND_URL;
const environment = process.env.REACT_APP_ENV;

console.log(`Running in ${environment} - API: ${backendUrl}`);
```

---

## Testing Workflow

### 1. **Local Testing** (Developer)
```
Write Code
    ↓
npm start / npm run web
    ↓
Test on phone with Expo Go
    ↓
Verify feature works locally
    ↓
Commit & push to GitHub
```

### 2. **Staging Build** (QA / Internal Team)
```
Push to GitHub (main branch)
    ↓
Trigger EAS Build (preview profile)
    ↓
Get preview app via QR code
    ↓
Test on real devices:
  ├─ iPhone
  ├─ Android
  └─ Different OS versions
    ↓
✅ All tests pass?
    ↓
Mark ready for production
```

### 3. **Production Release** (Final Step)
```
All staging tests passed ✅
    ↓
Trigger EAS Build (production profile)
    ↓
Submit to Play Store / App Store
    ↓
🚀 Live on app stores
```

---

## Step-by-Step: Set Up Staging Environment

### Phase 1: Configure App for Multiple Environments

**File: `src/lib/env.js`** (Create this)
```javascript
const ENV = {
  development: {
    apiUrl: 'https://api.staging.integratedtech.ca',
    appName: 'Integra Vault (Dev)',
  },
  staging: {
    apiUrl: 'https://api.staging.integratedtech.ca',
    appName: 'Integra Vault (Staging)',
  },
  production: {
    apiUrl: 'https://api.integratedtech.ca',
    appName: 'Integra Vault',
  },
};

const getEnv = () => {
  const env = process.env.REACT_APP_ENV || 'development';
  return ENV[env];
};

export default getEnv;
```

**File: `src/lib/api.js`** (Update)
```javascript
import getEnv from './env';

const env = getEnv();

export async function scanRateCon(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${env.apiUrl}/api/driver-mobile/rate-con/parse`,
    {
      method: 'POST',
      body: formData,
    }
  );

  return await response.json();
}
```

---

### Phase 2: Create EAS Build Profiles

**File: `eas.json`** (Update with staging)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "REACT_APP_ENV": "development"
      }
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "REACT_APP_ENV": "staging"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "distribution": "store",
      "env": {
        "REACT_APP_ENV": "production"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

---

### Phase 3: Build & Test Staging Version

**Local:**
```bash
# Test locally with staging backend
REACT_APP_ENV=staging npm start

# Or on web
REACT_APP_ENV=staging npm run web
```

**Build for Testing:**
```bash
# Build staging version in the cloud
eas build --platform android --profile staging
eas build --platform ios --profile staging

# Get QR code from output
# Share with team for testing
```

**Team Tests:**
1. Scan QR code with Expo Go (iOS) or camera (Android)
2. Test all features thoroughly
3. Report any issues
4. Once approved → proceed to production

---

## Testing Checklist

Before each production release, verify:

### Phase 1 Features
- [ ] Rate Confirmation scanning works
- [ ] Receipt scanning works
- [ ] Smart Scan identifies documents
- [ ] Document Vault displays correctly
- [ ] Expiry notifications trigger
- [ ] Can delete documents
- [ ] Navigation between tabs works

### Phase 2A Features (As added)
- [ ] Document editing form works
- [ ] PDF uploads succeed
- [ ] File picker functions
- [ ] Expenses save correctly
- [ ] Load management works

### General
- [ ] No console errors
- [ ] App doesn't crash
- [ ] Proper error messages show
- [ ] API calls succeed
- [ ] Data persists after restart
- [ ] Works offline (if supported)
- [ ] Performance is acceptable
- [ ] Tested on iOS & Android

---

## Production Release Process

### 1. **Staging Approval**
```
✅ All tests passed in staging
✅ No critical bugs found
✅ Feature works as designed
```

### 2. **Build Production**
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

### 3. **Submit to Stores**
```bash
# After setting up credentials
eas submit --platform android
eas submit --platform ios
```

### 4. **Monitor Live**
```
✅ Monitor crash logs
✅ Gather user feedback
✅ Watch performance metrics
✅ Be ready to hotfix if needed
```

---

## Preventing Live Issues

### Before Going Live:
1. ✅ Test on real devices (not just emulators)
2. ✅ Test on multiple OS versions
3. ✅ Test with slow network (throttle in DevTools)
4. ✅ Test with offline mode
5. ✅ Verify staging backend has same data as production
6. ✅ Check app doesn't have hardcoded staging URLs

### After Going Live:
1. 🔍 Monitor crash reports
2. 🔍 Watch user feedback
3. 🔍 Check API error logs
4. 📊 Monitor performance metrics
5. 🚨 Be ready with hotfix if critical bug found

---

## Quick Reference: Build Commands

```bash
# Local testing with staging backend
REACT_APP_ENV=staging npm start

# Build staging for team testing
eas build --platform android --profile staging
eas build --platform ios --profile staging

# Build production for app stores
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores (after credentials set up)
eas submit --platform android
eas submit --platform ios
```

---

## Timeline Example

```
Monday:    Dev finishes Phase 2A feature
Tuesday:   Build staging → Team tests
Wednesday: Bug fixes → Team re-tests
Thursday:  ✅ Staging approved
Friday:    Build production → Submit to stores
Weekend:   Monitor live version

(Note: Timings vary - may take longer depending on issues found)
```

---

## Key Benefits

✅ **Safety** - Features tested before live customers see them  
✅ **Confidence** - Team validates changes  
✅ **Rollback** - If issues found, stay on previous version  
✅ **Documentation** - Clear testing process  
✅ **Quality** - Fewer bugs reach production  
✅ **Trust** - Customers see stable, tested app  

---

## Next Steps

1. **Implement environment config** (src/lib/env.js)
2. **Update eas.json** with staging profile
3. **Update api.js** to use environment URLs
4. **Test locally** with staging backend
5. **Build & test** staging version
6. **Approve & release** to production

Ready to set this up?
