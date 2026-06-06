# Vault Mobile App - UI Design Specification

**For:** Frontend developers implementing design mockups and styling

---

## Design System

### Color Palette

#### Light Mode
```
Primary Blue:        #007AFF
Success Green:       #34C759
Warning Orange:      #FF9500
Error Red:           #FF3B30
Neutral Dark:        #000000
Neutral Medium:      #333333
Neutral Light:       #666666
Neutral BG:          #f5f5f5
White:               #ffffff
```

#### Dark Mode
```
Primary Blue:        #0A84FF (brighter for contrast)
Success Green:       #30B0C0 (adapted for dark)
Warning Orange:      #FF9500
Error Red:           #FF453A (brighter for contrast)
Neutral Dark:        #ffffff
Neutral Medium:      #e0e0e0
Neutral Light:       #a0a0a0
Neutral BG:          #1a1a1a
White:               #0d0d0d
```

### Typography
- **Title (H1):** 28px, Bold, Primary Blue
- **Heading (H2):** 18px, SemiBold, Neutral Dark
- **Label:** 14px, SemiBold, Neutral Dark
- **Body:** 14px, Regular, Neutral Medium
- **Small:** 12px, Regular, Neutral Light

### Spacing
- **Padding:** 16px (standard), 12px (compact)
- **Gap between elements:** 12px
- **Border radius:** 8px (cards), 4px (buttons)
- **Shadow:** elevation 3 (Android), 0px 2px 4px rgba(0,0,0,0.1) (iOS)

---

## Screen Specifications

### 1. Home Screen (My Loads)

**Layout:**
```
┌─────────────────────────────────┐
│  Welcome to Integra Vault       │  ← Header (Blue BG)
│  Manage and scan your...        │
├─────────────────────────────────┤
│                                 │
│  ┌──────────────────────────┐   │
│  │ Scan Rate Confirmation   │   │ ← Card
│  │ Scan and verify rates    │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │ Scan Receipt             │   │ ← Card
│  │ Scan and record expenses │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │ Document Vault           │   │ ← Card
│  │ View and manage all docs │   │
│  └──────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- **Header Section:**
  - Background: Primary Blue
  - Title: "Welcome to Integra Vault" (28px, bold, white)
  - Subtitle: "Manage and scan your documents with ease" (16px, light blue)
  - Padding: 20px
  
- **Card (x3):**
  - Background: White (light) / #2a2a2a (dark)
  - Border radius: 8px
  - Shadow: elevation 3
  - Padding: 16px
  - Margin bottom: 12px
  - Card title: 18px, SemiBold
  - Card description: 14px, gray

**Interactive:**
- Tap card → Navigate to corresponding screen
- Ripple effect on tap (Android)

---

### 2. Scan Rate Confirmation Screen

**Layout:**
```
┌─────────────────────────────────┐
│ ═══════════════════════════════ │
│ [ Take Photo ]                  │
│ ═══════════════════════════════ │
│                                 │
│ ═══════════════════════════════ │
│ [ Pick from Gallery ]           │
│ ═══════════════════════════════ │
│                                 │
│ (Scanning...)                   │
│ [Spinner]                       │
│                                 │
│ ┌─ Scan Result ────────────────┐ │
│ │ {                             │ │
│ │  "vehicle": "2024 Volvo",    │ │
│ │  "rate": 2.50,               │ │
│ │  "date": "2026-06-04"        │ │
│ │ }                             │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- **Button Container:**
  - Gap: 12px
  - Padding: 16px
  
- **Buttons (Primary):**
  - Background: #007AFF
  - Text: White, 16px, SemiBold
  - Padding: 16px
  - Border radius: 8px
  - Width: Full width
  - Pressed state: opacity 0.8
  
- **Loading State:**
  - Spinner: #007AFF
  - Text: "Scanning document..." (16px, gray)
  - Centered, padding: 32px
  
- **Result Card:**
  - Background: White (light) / #2a2a2a (dark)
  - Border radius: 8px
  - Padding: 16px
  - Title: "Scan Result" (18px, SemiBold)
  - Content: JSON display in monospace (12px)
  - Background of content: #f9f9f9 (light) / #1a1a1a (dark)

**Dark Mode Adjustments:**
- Button background: #0A84FF
- Card background: #2a2a2a
- Text: white/light gray
- JSON background: #1a1a1a

---

### 3. Smart Scan Screen

**Layout:**
```
┌─────────────────────────────────┐
│ [ 📸 Take Photo ]               │
│ [ 🖼️  Pick from Gallery ]       │
│ [ 📄 Upload Document ]          │
│                                 │
│ ┌─ Document Detected ──────────┐ │
│ │                               │ │
│ │ Category                      │ │
│ │ [License] [Insurance]         │ │
│ │ [Inspection] [Reg.] [Other]   │ │
│ │                               │ │
│ │ Expiry Date (if detected)     │ │
│ │ [______________ YYYY-MM-DD]   │ │
│ │                               │ │
│ │ [ ✏️ Edit Data ] [Save Vault] │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- **Button Container:**
  - 3 buttons: Take Photo (blue), Gallery (blue), Upload (orange)
  - Padding: 16px, gap: 12px
  - Upload Document button: #FF9500 (orange)
  
- **Category Selector:**
  - Grid layout (2 columns on mobile)
  - Buttons: 45% width each
  - Unselected: border: 1px #ddd, bg: white
  - Selected: border: #007AFF, bg: #007AFF, text: white
  - Padding: 12px, gap: 8px
  
- **Text Input (Expiry Date):**
  - Border: 1px #ddd
  - Border radius: 6px
  - Padding: 12px
  - Placeholder text: "YYYY-MM-DD" (gray)
  
- **Action Buttons:**
  - Edit Data: bg: #ff9500 (orange)
  - Save Vault: bg: #34C759 (green)
  - Side by side on wide screens, full width on narrow
  - Height: 50px
  - Border radius: 8px

**Dark Mode:**
- Unselected button border: #444
- BG: dark gray
- Text: white
- Input border: #555

---

### 4. Document Vault Screen

**Layout:**
```
┌─────────────────────────────────┐
│ (Pull to refresh)               │
│                                 │
│ ┌─ License ────────────────────┐ │
│ │ Uploaded: Jun 4, 2026       │ │ [Delete]
│ │                               │ │
│ │ Expires: Dec 31, 2026         │ │
│ │ ─────────────────────────────│ │
│ │ Driver License document       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ Insurance ───────────────────┐│ [Delete]
│ │ Uploaded: Jun 1, 2026        ││
│ │                               ││
│ │ Expires: JUL 15, 2026 (EXPIR!)││
│ │ ─────────────────────────────││
│ │ Vehicle insurance policy      ││
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ Inspection ──────────────────┐│ [Delete]
│ │ Uploaded: May 15, 2026       ││
│ │                               ││
│ │ Expires: MAY 10, 2026 (OVERD!)││
│ │ ─────────────────────────────││
│ │ Annual vehicle inspection     ││
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘

No documents
┌─────────────────────────────────┐
│                                 │
│     No documents yet            │
│                                 │
│  Start by scanning your first   │
│      document                   │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- **Document Card:**
  - Background: White (light) / #2a2a2a (dark)
  - Border radius: 8px
  - Padding: 16px
  - Shadow: elevation 3
  - Margin bottom: 12px
  
- **Card Header:**
  - Flex row: title on left, delete button on right
  - Document type: 16px, SemiBold
  - Upload date: 12px, gray
  
- **Delete Button:**
  - Background: #FF3B30 (red)
  - Text: white, 12px, SemiBold
  - Padding: 6px 12px
  - Border radius: 4px
  
- **Expiry Info:**
  - Background: 
    - Green (#f0f0f0 light): Valid
    - Orange (#fff3cd light): Expiring soon (≤7 days)
    - Red (#ffebee light): Overdue
  - Border left: 4px solid (matching color)
  - Padding: 8px 12px
  - Margin bottom: 12px
  - Expiry text: 13px
  - Status indicators: "(EXPIRING SOON)" or "(OVERDUE)" in red/bold
  
- **Description:**
  - Font size: 14px
  - Color: #666
  - Line height: 20px

**Empty State:**
- Center of screen
- Icon/emoji (or empty box)
- Title: "No documents yet" (18px, SemiBold)
- Subtitle: "Start by scanning your first document" (14px, gray)

**Dark Mode:**
- Card background: #2a2a2a
- Text: white/light gray
- Expiry backgrounds: darker shades
- Border colors: lighter

---

## Bottom Tab Navigation

**Layout:**
```
┌─────────────────────────────────┐
│                                 │
│      Screen Content             │
│                                 │
├─────────────────────────────────┤
│ Home  Expen  Smart  Vault       │
│  ✓                              │ ← Active tab highlighted
└─────────────────────────────────┘
```

**Tabs:**
1. **My Loads** - Icon: 📦 or home icon
2. **Expenses** - Icon: 💰 or receipt icon
3. **Smart Scan** - Icon: 🔍 or scan icon
4. **Vault** - Icon: 🔒 or folder icon

**Tab Style:**
- Background: White (light) / #1a1a1a (dark)
- Text: #007AFF (active), #999 (inactive)
- Height: 60px (with safe area)
- Border top: 1px #eee (light) / #333 (dark)
- Label: 12px
- Icon: 24px
- Gap between icon and label: 4px

**Active Tab Indicator:**
- Text color: #007AFF
- Icon color: #007AFF
- Bold text: optional
- Bottom border: 3px #007AFF (optional)

---

## Dark Mode Implementation

**Switch all colors:**
- Light BG: #f5f5f5 → Dark BG: #1a1a1a
- Cards: #ffffff → #2a2a2a
- Text: #000000 → #ffffff
- Headers: #007AFF → #0A84FF (brighter)
- Borders: #ddd → #444
- Shadows: lighter opacity

**Use React Native's `useColorScheme` hook:**
```javascript
import { useColorScheme } from 'react-native';

const isDark = useColorScheme() === 'dark';
const bgColor = isDark ? '#1a1a1a' : '#ffffff';
```

---

## Component Library (if creating)

### Button Component
```javascript
<Button 
  title="Action"
  onPress={handlePress}
  variant="primary" | "secondary" | "danger"
  size="large" | "medium" | "small"
  disabled={false}
  loading={false}
/>
```

**Variants:**
- `primary`: #007AFF, white text
- `secondary`: #34C759, white text
- `danger`: #FF3B30, white text

### Card Component
```javascript
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Input Component
```javascript
<TextInput 
  placeholder="Enter text"
  value={value}
  onChangeText={setValue}
  secureTextEntry={false}
/>
```

### Badge Component
```javascript
<Badge 
  status="valid" | "warning" | "expired"
  text="Jun 4, 2026"
/>
```

---

## Responsive Design

### Portrait Mode (Primary)
- Phone: Full width minus padding
- Max width: no limit (fills screen)
- Stack layouts vertically

### Landscape Mode (Secondary)
- Consider two-column layouts for vault
- Buttons may appear side-by-side
- Consider drawer navigation for tabs

### iPad Support (Optional)
- Split view with document preview
- Wider cards with more spacing
- Master-detail layout for vault

---

## Animation & Transitions

### Screen Transitions
- Type: Slide from right (push)
- Duration: 300ms
- Easing: ease-in-out

### Button Press
- Opacity: 0.8 on press
- Scale: 0.98 on press (optional)
- Duration: 100ms

### Loading Spinner
- Duration: 1000ms per rotation
- Color: #007AFF

### Pull-to-Refresh
- Distance to trigger: 50px
- Spinner color: #007AFF
- Auto-dismiss: 500ms after complete

---

## Accessibility Requirements

### Text Contrast
- All text: WCAG AA minimum (4.5:1 for small text)
- Button text: minimum 14px for readability

### Touch Targets
- Minimum size: 48x48 points (Apple), 48x48 dp (Android)
- Button padding: 16px minimum

### Screen Reader Support
- Label all buttons and inputs
- Describe images/icons with alt text
- Use semantic layout

### Dark Mode
- Ensure sufficient contrast in dark mode
- Test with accessibility tools

---

## Platform-Specific Notes

### Android
- Use Material Design principles
- Bottom navigation height: 56 dp
- Safe area for notches: included
- Back button: hardware back button support

### iOS
- Use iOS Human Interface Guidelines
- Tab bar height: 50 points (plus safe area)
- Safe area for notch: included
- Swipe back gesture support

---

## Testing Checklist

- [ ] Light mode: all screens tested
- [ ] Dark mode: all screens tested
- [ ] Portrait orientation
- [ ] Landscape orientation
- [ ] Different screen sizes (small, medium, large phones)
- [ ] Tablets (if supported)
- [ ] Touch interactions work smoothly
- [ ] Text is readable at all sizes
- [ ] Colors meet accessibility standards
- [ ] Animations are smooth (60 FPS)
- [ ] Loading states display correctly
- [ ] Error states are clear
- [ ] Empty states are helpful

---

## Design Resources

### Icon Suggestions
- Take Photo: 📸 or camera icon
- Gallery: 🖼️ or photo library icon
- Upload: 📄 or document icon
- Delete: 🗑️ or trash icon
- Edit: ✏️ or pencil icon
- Save: 💾 or checkmark icon

### Font Recommendations
- **Default:** System font (San Francisco on iOS, Roboto on Android)
- **Monospace:** Courier New or Menlo (for JSON display)

### Icon Library Options
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)
- [Expo Icons](https://expo.dev/guides/icons)
- [Ionicons](https://ionic.io/ionicons)

---

## Future Enhancements

- [ ] Custom splash screen with logo
- [ ] Custom app icon (app.json)
- [ ] Themed navigation headers
- [ ] Floating action button for quick scan
- [ ] Animated document cards
- [ ] Parallax scrolling in vault
- [ ] Custom animations on document save
- [ ] Gradient backgrounds (optional)

---

**Last Updated:** 2026-06-04
**Status:** Ready for frontend implementation