# Screenshot & Testing Guide

**For:** Capturing and comparing UI screenshots in light and dark modes

---

## How to Capture Screenshots

### Android (Physical Device or Emulator)

**Via Android Studio:**
1. Open Android Studio
2. Select device → Device Manager
3. Run your app with `npm run android`
4. Click Camera icon in emulator toolbar
5. Screenshot saved to `~/Pictures/`

**Via ADB Command:**
```bash
# Take screenshot
adb shell screencap -p /sdcard/screenshot.png

# Pull to computer
adb pull /sdcard/screenshot.png ~/screenshot.png
```

**Via Emulator Menu:**
1. Open emulator control buttons (far right side panel)
2. Click camera icon (screenshot)
3. Images saved automatically

### iOS (Physical Device)

**iPhone 14+:**
- Press Side + Volume Up simultaneously
- Screenshot saved to Photos app

**iOS Simulator (Mac):**
```bash
# Keyboard shortcut
Cmd + S

# Or via xcrun
xcrun simctl io booted screenshot screenshot.png
```

---

## Screenshot Checklist - Light Mode

### Home Screen
```
✓ Title: "Welcome to Integra Vault" (blue header)
✓ Subtitle visible below title
✓ Three white cards visible:
  - Scan Rate Confirmation
  - Scan Receipt
  - Document Vault
✓ Card shadows visible (elevation)
✓ Text color is black/dark
✓ Background is light gray
✓ Bottom navigation tabs visible (4 tabs)
✓ "My Loads" tab highlighted in blue
```

### Scan Rate Confirmation Screen
```
✓ Two primary blue buttons (full width)
  - Take Photo
  - Pick from Gallery
✓ Buttons have rounded corners
✓ Text is white on blue background
✓ Buttons have proper spacing
✓ After scanning: JSON result displayed
  - Result card has white background
  - Monospace font for JSON
  - Card has shadow/elevation
```

### Smart Scan Screen
```
✓ Three buttons visible:
  - 📸 Take Photo (blue)
  - 🖼️ Pick from Gallery (blue)
  - 📄 Upload Document (orange)
✓ After scan: Document Detected section
✓ Category buttons (License, Insurance, etc.)
  - Unselected: white with gray border
  - Selected: blue background, white text
✓ Expiry date input field visible
  - Border color: gray
✓ Two action buttons at bottom:
  - ✏️ Edit Data (orange)
  - Save to Vault (green)
```

### Document Vault Screen
```
✓ List of documents visible
✓ Each card shows:
  - Document type (dark text, bold)
  - Upload date (small gray text)
  - Delete button (red, top right)
✓ Expiry status color coding:
  - Valid: green border, light green background
  - Expiring Soon: orange border, yellow background
  - Overdue: red border, light red background
✓ Document description visible
✓ Empty state (if no docs):
  - "No documents yet" centered
  - Helper text below
✓ Pull-to-refresh gesture works
```

### Bottom Navigation
```
✓ 4 tabs visible at bottom:
  - My Loads (with icon)
  - Expenses (with icon)
  - Smart Scan (with icon)
  - Vault (with icon)
✓ Active tab text is blue (#007AFF)
✓ Inactive tabs are gray
✓ Tab bar background is white
✓ Tab bar has light border at top
```

---

## Screenshot Checklist - Dark Mode

### Activate Dark Mode

**Android:**
1. Settings → Display → Dark Theme (toggle On)
2. Restart app

**iOS:**
1. Settings → Display & Brightness → Dark
2. Restart app

**Or in app (if implemented):**
```javascript
// Temporarily test with:
const isDark = true; // Force dark mode
```

### Home Screen (Dark Mode)
```
✓ Title still visible (blue or bright blue)
✓ Background is dark gray (#1a1a1a)
✓ Cards have dark background (#2a2a2a)
✓ Text is white/light gray
✓ Card shadows still visible
✓ Header blue is brighter (#0A84FF for better contrast)
✓ Bottom nav bar is dark
```

### All Screens (Dark Mode)
```
✓ Text contrast is sufficient (white on dark)
✓ Borders are visible (lighter than dark mode background)
✓ Buttons are readable (bright blue/green/orange)
✓ Status colors still clear:
  - Green: still recognizable
  - Orange: still visible
  - Red: bright enough to read
✓ Form inputs are visible (dark background with light border)
✓ JSON display in result cards is readable
```

---

## Device Size Testing

### Small Phones (< 5 inches)
```
Devices: iPhone SE, Google Pixel 4a
✓ Text is readable at default size
✓ Buttons are easily tappable (48x48 minimum)
✓ All content fits without horizontal scroll
✓ Cards don't wrap text awkwardly
✓ Bottom navigation tabs fit without overlap
```

### Standard Phones (5-6 inches)
```
Devices: iPhone 14, Google Pixel 6
✓ All content displays well
✓ Layout matches design specifications
✓ Spacing is consistent
```

### Large Phones (6+ inches)
```
Devices: iPhone 14 Plus, Google Pixel 7 Pro
✓ Extra space is used effectively
✓ Cards are proportionally sized
✓ Text doesn't feel cramped
✓ Touch targets remain appropriate size
```

### Tablets (Optional Testing)
```
Devices: iPad, Samsung Tab
✓ Multi-column layout works (if implemented)
✓ Document vault shows more cards per row
✓ Master-detail view (if implemented)
```

---

## Orientation Testing

### Portrait Mode (Primary)
```
✓ All screens work correctly
✓ Bottom nav is at bottom
✓ Content flows top to bottom
✓ Buttons are full width (with padding)
```

### Landscape Mode
```
✓ Layout adjusts appropriately
✓ Bottom nav still accessible
✓ Cards arrange side-by-side (if possible)
✓ Text doesn't overflow
✓ Buttons remain usable
```

---

## Feature Verification

### Camera & Gallery
```
✓ Take Photo button opens camera
✓ Pick from Gallery button opens photo library
✓ Upload Document button opens file picker
✓ Can select files and return to app
✓ Selected image processes without errors
```

### Document Scanning
```
✓ Scanned documents show results
✓ JSON result is formatted correctly
✓ Error messages display clearly
✓ Network errors are handled
```

### Form Interactions
```
✓ Category buttons toggle selection on tap
✓ Only one category selected at a time
✓ Expiry date input accepts typing
✓ Date format validation works
✓ Edit button opens editor (if implemented)
✓ Save button saves and confirms success
```

### Navigation
```
✓ Bottom tabs switch screens
✓ Back button works (navigation stack)
✓ Can navigate between all 4 tabs
✓ Screen state persists when switching tabs
```

### Document List
```
✓ Documents display in list
✓ Pull-to-refresh updates list
✓ Delete button removes document
✓ Empty state shows when no docs
✓ Expiry colors match status
```

---

## Performance Metrics (If Tools Available)

### Frame Rate
```
Target: 60 FPS (consistent scrolling)
Testing:
- Scroll through document list
- Tap buttons (should be instant)
- Animations should be smooth
```

### Load Time
```
Target:
- App startup: < 3 seconds
- Screen transition: < 500ms
- API response: < 2 seconds
```

### Memory Usage
```
Target: < 100 MB typical usage
Monitor in:
- Android: Android Studio Profiler
- iOS: Xcode Memory Debugger
```

---

## Error State Testing

### Network Errors
```
✓ Backend down: Shows clear error message
✓ Slow network: Shows loading state, doesn't timeout
✓ Invalid file: Shows specific error (unsupported type, too large)
✓ OCR failure: Shows "Cannot read document"
```

### Permission Errors
```
✓ Deny camera: Shows permission prompt
✓ Deny gallery: Shows permission prompt
✓ Revoke permission: App handles gracefully
```

### Data Errors
```
✓ Missing category: Shows validation error
✓ Invalid date format: Shows helpful message
✓ Empty vault: Shows empty state (not error)
```

---

## Screenshot Comparison Workflow

### For Light vs Dark Mode

**Step 1: Take Light Mode Screenshot**
```
1. Ensure light mode is active
2. Navigate to Home screen
3. Take screenshot (save as "home-light.png")
4. Repeat for each screen:
   - Scan Rate Confirmation
   - Scan Receipt
   - Smart Scan (with result)
   - Document Vault (with docs + empty)
```

**Step 2: Take Dark Mode Screenshot**
```
1. Activate dark mode
2. Restart app
3. Navigate to same screens
4. Take identical screenshots (save as "home-dark.png")
```

**Step 3: Compare Side-by-Side**
```
Tools for comparison:
- Preview (Mac): Open both images in Preview, arrange windows
- Photos app: Compare in carousel view
- Online: https://www.diffchecker.com/ (if converted to web)
- IDE: VS Code side-by-side view
- Figma: Upload images for feedback
```

---

## Automated Screenshot Testing (Advanced)

### Using Detox (Optional)
```bash
# Install Detox
npm install --save-dev detox-cli detox detox-test-utils

# Create test file
// e2e/firstTest.e2e.js
describe('Home Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show welcome message', async () => {
    await expect(element(by.text('Welcome to Integra Vault'))).toBeVisible();
  });
});

# Run tests
detox test e2e/firstTest.e2e.js --configuration ios.sim.debug --cleanup
```

---

## Screenshot Documentation Template

For each screen, document:

```markdown
## Screen: Home Screen (Light Mode)

**Captured:** 2026-06-05
**Device:** iPhone 14 (Portrait)
**OS Version:** iOS 17
**App Version:** 1.0.0

### Visual Elements
- ✓ Header with "Welcome to Integra Vault"
- ✓ Three feature cards
- ✓ Bottom navigation (4 tabs)
- ✓ Colors match design specification

### Status
- ✓ PASS - Matches light mode design

---

## Screen: Home Screen (Dark Mode)

**Captured:** 2026-06-05
**Device:** iPhone 14 (Portrait, Dark Mode)
**OS Version:** iOS 17
**App Version:** 1.0.0

### Visual Elements
- ✓ Header with bright blue
- ✓ Dark background (#1a1a1a)
- ✓ Dark cards (#2a2a2a)
- ✓ White text
- ✓ Sufficient contrast

### Status
- ✓ PASS - Matches dark mode design
```

---

## Tools & Resources

### Screenshot Tools
- **Android Studio Emulator:** Built-in camera button
- **ADB:** Command-line screenshots
- **iOS Simulator:** Cmd+S shortcut
- **Xcode:** Screenshots in Device window

### Image Comparison
- **Figma:** Upload for annotations
- **Pixlr:** Online image editor
- **Compare Images Online:** https://www.imgonline.com.ua/
- **DiffChecker:** https://www.diffchecker.com/

### Testing
- **BrowserStack:** Real device testing
- **Appetize.io:** Cloud emulator testing
- **Detox:** E2E testing framework

### Accessibility Checking
- **Accessibility Inspector:** Built into XCode and Android Studio
- **WAVE:** https://wave.webaim.org/
- **Color Blind Simulator:** https://www.color-blindness.com/coblis-color-blindness-simulator/

---

## Sign-Off Checklist

Before considering screenshots ready for production:

- [ ] Light mode captures for all 4 main screens
- [ ] Dark mode captures for all 4 main screens
- [ ] Tested on multiple device sizes (small, medium, large)
- [ ] All text is readable and well-formatted
- [ ] Colors match design specification
- [ ] No UI elements are cut off or overflow
- [ ] Status indicators (expiry colors) are clear
- [ ] Bottom navigation is visible and functional
- [ ] All buttons are visible and tappable
- [ ] Empty states are clear and helpful
- [ ] Loading states show spinner
- [ ] Error states show clear messages
- [ ] Contrast meets WCAG AA standards

---

**Last Updated:** 2026-06-04
**Status:** Ready for QA and testing