# CI/CD Pipeline Setup

This project uses GitHub Actions for automated linting, type checking, and mobile builds.

## Workflows

### 1. Lint & Build (`lint-and-build.yml`)
Runs on every push and pull request to `main` or `develop`:
- **Lint**: Checks code style with `npm run lint`
- **Type Check**: Validates TypeScript with `tsc --noEmit`
- **Web Build**: Verifies the web build compiles

**No secrets required** - runs automatically on all PRs.

### 2. EAS Build (`eas-build.yml`)
Manually triggered workflow for building native apps:
- Builds Android APK/AAB
- Builds iOS archive
- Supports preview and production profiles

**Requires Setup:**
1. Create Expo account at https://expo.dev
2. Add `EXPO_TOKEN` secret to GitHub repo settings
3. Link project with `eas init`

**Usage:**
```bash
# Trigger via GitHub UI
Actions → EAS Build → Run workflow

# Or manually:
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Build Profiles

### Development
- Uses development client
- Internal distribution
- Fast build time
- For testing on emulator

### Preview
- Test build
- APK for Android (easy to share)
- iOS simulator build
- Internal distribution

### Production
- Optimized release build
- Android: App Bundle (for Play Store)
- iOS: Release build (for App Store)
- Store distribution

## Environment Variables

For GitHub Actions to work with EAS, set:
- `EXPO_TOKEN`: Generate at https://expo.dev/settings/tokens

For production submission (iOS), also set:
- `APPLE_ID`: Your Apple ID email
- `APPLE_PASSWORD`: App-specific password (not your Apple ID password)
- `APPLE_TEAM_ID`: Your Apple Developer Team ID
- `ASC_APP_ID`: Your app's ID in App Store Connect

## Local Building

### Android
```bash
eas build --platform android --profile production
```

### iOS (requires Mac)
```bash
eas build --platform ios --profile production
```

## Next Steps

1. **Set up credentials:**
   - Create Expo account
   - Generate EXPO_TOKEN
   - Set GitHub secrets

2. **Configure app submission:**
   - Update `eas.json` with your Apple ID
   - Configure Play Store credentials
   - Test with preview build first

3. **Test workflows:**
   - Make a PR to trigger lint/type check
   - Manually trigger EAS build from GitHub UI

4. **Monitor builds:**
   - Check GitHub Actions tab for logs
   - View EAS builds at https://expo.dev/builds
