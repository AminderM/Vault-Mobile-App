# React Native Mobile App - Setup Guide

**For:** New developer setting up local development environment

---

## Step 1: Prerequisites (15 minutes)

### Install Node.js
- Download from https://nodejs.org/ (version 18 or higher)
- Verify installation: `node --version` and `npm --version`

### Install Expo & EAS CLI
```bash
npm install -g expo-cli eas-cli
```

### For Android Testing (Optional)
- Download [Android Studio](https://developer.android.com/studio)
- During installation, install Android SDK and emulator
- Create a virtual device (emulator)

### For iOS Testing (Mac Only)
- Install Xcode from App Store
- Install CocoaPods: `sudo gem install cocoapods`

---

## Step 2: Clone Repository (5 minutes)

```bash
# Clone the mobile app repo
git clone https://github.com/AminderM/Vault-Mobile-App.git
cd Vault-Mobile-App

# Verify you're on main branch
git branch
```

---

## Step 3: Install Dependencies (10 minutes)

```bash
# Install all npm packages
npm install

# This downloads:
# - React Native
# - Expo modules
# - React Navigation
# - All other dependencies
```

---

## Step 4: Verify Configuration (5 minutes)

### Check Environment Variables
```bash
# .env should contain:
cat .env
# Output: REACT_APP_BACKEND_URL=https://api.staging.integratedtech.ca
```

Update if needed for production:
```bash
# Edit .env file to point to production backend
REACT_APP_BACKEND_URL=https://api.integratedtech.ca
```

### Check app.json
```bash
# Verify Expo configuration
cat app.json
# Should have:
# - name: "Integra Vault"
# - package: "com.integraatech.vault"
# - plugins for camera, location, notifications
```

---

## Step 5: Start Development Server (5 minutes)

```bash
# Start Expo dev server
npm start

# You should see:
# ✓ Metro Bundler started
# ✓ Expo server running
# ✓ QR code displayed in terminal
```

---

## Step 6: Test the App

### Option A: Test on Physical Android Phone (Easiest)
```bash
# Phone requirements:
# - Same WiFi as your computer
# - Expo Go app installed from Play Store

# Steps:
# 1. Open Expo Go app on your phone
# 2. Tap "Scan QR code"
# 3. Scan the QR code from your terminal
# 4. App loads on your phone in ~10 seconds
```

### Option B: Test on Android Emulator
```bash
# Prerequisites: Android Studio with emulator created

# From terminal running 'npm start', press:
# 'a' - Opens app in Android emulator
# 'r' - Reloads the app
# 'j' - Opens debugger
```

### Option C: Test on Web Browser (Quick Testing)
```bash
# From terminal running 'npm start', press:
# 'w' - Opens app in your default web browser
# Good for quick UI testing, but mobile features won't work
```

---

## Step 7: Verify Everything Works

### Check These Features
- [ ] App loads without errors
- [ ] Bottom navigation with 4 tabs visible
- [ ] Home screen shows feature cards
- [ ] Can tap on "Scan Rate Confirmation" button
- [ ] Permission prompt appears when accessing camera
- [ ] Can take photo (or select from gallery)

### If Something Breaks
```bash
# Clear cache and restart
npm start -- --reset-cache

# Or completely rebuild
rm -rf node_modules
npm install
npm start
```

---

## Step 8: Understand the Project Structure

```
Vault-Mobile-App/
│
├── App.js                    ← Main app entry point (navigation)
├── app.json                  ← Expo configuration
├── eas.json                  ← Build profiles for Android/iOS
├── package.json              ← Dependencies
├── .env                      ← Backend URL (don't commit API keys!)
│
├── src/
│   ├── screens/              ← App screens (add new screens here)
│   │   ├── HomeScreen.js     ← Welcome screen
│   │   ├── ScanRateConScreen.js      ← Rate confirmation scanner
│   │   ├── ScanReceiptScreen.js      ← Receipt scanner
│   │   ├── SmartScanScreen.js        ← Document identification
│   │   └── DocumentVaultScreen.js    ← Document list & management
│   │
│   └── lib/                  ← Reusable logic
│       ├── api.js            ← Backend API calls
│       └── expiryNotifications.js    ← Reminder system
│
├── DEVELOPER.md              ← Full developer guide
├── FEATURES.md               ← Feature checklist vs web app
└── README.md                 ← Project overview
```

---

## Step 9: Make Your First Change

### Test That Hot Reload Works

1. Edit `src/screens/HomeScreen.js`
2. Find the line: `<Text style={styles.title}>Welcome to Integra Vault</Text>`
3. Change it to: `<Text style={styles.title}>Welcome to Development!</Text>`
4. Save file
5. The app should auto-reload and show your change
6. Change it back

**This confirms:** Hot reload works ✓

---

## Step 10: Understand the Development Workflow

### Making Changes
1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make changes and test
3. Run linter: `npm run lint`
4. Commit: `git add . && git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Create Pull Request on GitHub

### Testing Your Changes
```bash
# Always test on a real device or emulator before pushing
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser (quick testing)

# Test with slow network:
# Chrome DevTools → Network → "Slow 3G"
```

### Debugging
```bash
# From terminal with 'npm start' running:
# 'j' - Open debugger in browser
# 'i' - Inspect elements
# 'r' - Reload app
# 'm' - Show more tools
```

---

## Step 11: Connect to Backend

### Verify Backend is Accessible

```bash
# Test from your terminal:
curl https://api.staging.integratedtech.ca/api/documents

# Should get a response (even if empty or error)
# If you get "Connection refused", backend is down
```

### Test API Connection from App

1. Open SmartScanScreen
2. Take/select a photo
3. If you see JSON result, API is working ✓
4. If you see error, check:
   - Backend URL in `.env`
   - Backend is running
   - Network connectivity

---

## Step 12: Read Documentation

Priority order:
1. **DEVELOPER.md** - Full guide with examples
2. **FEATURES.md** - What needs to be built (feature checklist)
3. **README.md** - Project overview

---

## Common Issues

### "Metro Bundler Error"
```bash
npm start -- --reset-cache
```

### "Module not found" errors
```bash
rm -rf node_modules
npm install
```

### "Can't connect to backend"
1. Check .env file has correct URL
2. Verify backend is running
3. Try from web: `npm run web` then open DevTools
4. Check network tab for failed requests

### "Permission denied" on camera
- Make sure you allowed permission when app asked
- Reset app permissions in phone settings
- Uninstall and reinstall Expo Go app

### "No Android emulator found"
```bash
# Create emulator in Android Studio
# Or use Expo Go on physical device
npm start
# Press 's' to scan QR code
```

---

## Useful Commands Reference

```bash
# Development
npm start                     # Start dev server
npm run android              # Run on Android emulator
npm run ios                  # Run on iOS simulator
npm run web                  # Run on web browser
npm run lint                 # Check code style

# Dependencies
npm install                  # Install packages
npm install <package-name>   # Add new package
npm update                   # Update packages
npm audit                    # Check for vulnerabilities

# Building
eas build --platform android  # Build Android APK
eas build --platform ios      # Build iOS archive
eas submit                     # Submit to stores

# Git
git status                    # See changes
git add .                     # Stage all changes
git commit -m "message"       # Create commit
git push                      # Push to GitHub
git pull                      # Get latest changes
git checkout -b feature/name  # Create feature branch
```

---

## Next Steps

1. ✅ Complete this setup
2. Read **DEVELOPER.md** for detailed information
3. Read **FEATURES.md** to understand what needs to be built
4. Pick a feature from the TODO list
5. Implement it following the code examples in DEVELOPER.md
6. Test on Android/iOS
7. Create pull request

---

## Getting Help

- **Questions?** Check DEVELOPER.md for answers
- **Feature details?** See FEATURES.md
- **React Navigation?** https://reactnavigation.org/
- **Expo docs?** https://docs.expo.dev/
- **React Native?** https://reactnative.dev/
- **Backend API?** Ask your backend team or check their documentation

---

## Success Checklist

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] npm install completed
- [ ] npm start runs without errors
- [ ] App loads on phone/emulator
- [ ] Can navigate between tabs
- [ ] Made a test change (Step 9)
- [ ] Can see hot reload working
- [ ] Backend connection verified
- [ ] You've read DEVELOPER.md

**If all above are checked, you're ready to start developing!** 🚀

---

**Need help?** Contact your team lead or refer to the documentation files.

**Last Updated:** 2026-06-04