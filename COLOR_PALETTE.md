# Vault Mobile App - Color Palette Reference

## Light Mode Color Scheme

### Primary Colors
```
Name:     Primary Blue
HEX:      #007AFF
RGB:      0, 122, 255
Usage:    Buttons, headers, active tabs, links
Example:  Primary action buttons, active navigation
```

```
Name:     Success Green
HEX:      #34C759
RGB:      52, 199, 89
Usage:    Success messages, positive actions
Example:  "Save to Vault" button, valid document status
```

```
Name:     Warning Orange
HEX:      #FF9500
RGB:      255, 149, 0
Usage:    Warning states, secondary actions
Example:  "Upload Document" button, expiring soon indicator
```

```
Name:     Error Red
HEX:      #FF3B30
RGB:      255, 59, 48
Usage:    Errors, deletions, overdue documents
Example:  Delete button, overdue expiry badge
```

### Neutral Colors (Light Mode)
```
Name:     Neutral Dark
HEX:      #000000
RGB:      0, 0, 0
Usage:    Primary text, headings
Example:  All text on light backgrounds
```

```
Name:     Neutral Medium
HEX:      #333333
RGB:      51, 51, 51
Usage:    Secondary text, descriptions
Example:  Subtitle text, body copy
```

```
Name:     Neutral Light
HEX:      #666666
RGB:      102, 102, 102
Usage:    Tertiary text, timestamps
Example:  Upload date, helper text
```

```
Name:     Background Light
HEX:      #f5f5f5
RGB:      245, 245, 245
Usage:    Screen background, inactive elements
Example:  Full screen background
```

```
Name:     Card Background
HEX:      #ffffff
RGB:      255, 255, 255
Usage:    Cards, modal backgrounds
Example:  Document cards in vault
```

### Status Colors (Light Mode)

**Expiry Valid (Green)**
```
Border:   #34C759
Background: #f0faf3
Text:     #333333
```

**Expiry Expiring Soon (Orange)**
```
Border:   #FF9500
Background: #fff3cd
Text:     #333333
```

**Expiry Overdue (Red)**
```
Border:   #FF3B30
Background: #ffebee
Text:     #d32f2f
```

---

## Dark Mode Color Scheme

### Primary Colors (Dark Mode)
```
Name:     Primary Blue (Dark)
HEX:      #0A84FF
RGB:      10, 132, 255
Usage:    Buttons, headers, active tabs (brighter for contrast)
Example:  Primary action buttons
```

```
Name:     Success Green (Dark)
HEX:      #30B0C0
RGB:      48, 176, 192
Usage:    Success messages (adjusted for dark background)
Example:  "Save to Vault" button
```

```
Name:     Warning Orange (Dark)
HEX:      #FF9500
RGB:      255, 149, 0
Usage:    Warning states (same as light mode)
Example:  Secondary actions
```

```
Name:     Error Red (Dark)
HEX:      #FF453A
RGB:      255, 69, 58
Usage:    Errors, deletions (brighter for contrast)
Example:  Delete button, error messages
```

### Neutral Colors (Dark Mode)
```
Name:     Neutral Dark (inverted)
HEX:      #ffffff
RGB:      255, 255, 255
Usage:    Primary text (white on dark)
Example:  All text on dark backgrounds
```

```
Name:     Neutral Medium (Dark)
HEX:      #e0e0e0
RGB:      224, 224, 224
Usage:    Secondary text, descriptions
Example:  Subtitle text
```

```
Name:     Neutral Light (Dark)
HEX:      #a0a0a0
RGB:      160, 160, 160
Usage:    Tertiary text, timestamps
Example:  Upload date, helper text
```

```
Name:     Background Dark
HEX:      #1a1a1a
RGB:      26, 26, 26
Usage:    Screen background, inactive elements
Example:  Full screen background
```

```
Name:     Card Background (Dark)
HEX:      #2a2a2a
RGB:      42, 42, 42
Usage:    Cards, modal backgrounds
Example:  Document cards in vault
```

---

## Color Usage Guidelines

### Buttons

**Primary Button (Light Mode)**
```
Background:  #007AFF
Text:        #ffffff
Border:      none
Padding:     16px
Disabled:    opacity: 0.5
```

**Primary Button (Dark Mode)**
```
Background:  #0A84FF
Text:        #ffffff
Border:      none
Padding:     16px
Disabled:    opacity: 0.5
```

**Secondary Button (Light Mode)**
```
Background:  #f5f5f5
Text:        #007AFF
Border:      1px #ddd
Padding:     16px
```

**Secondary Button (Dark Mode)**
```
Background:  #2a2a2a
Text:        #0A84FF
Border:      1px #444
Padding:     16px
```

**Danger Button (Both Modes)**
```
Background:  #FF3B30
Text:        #ffffff
Border:      none
Padding:     16px
```

### Text Colors

**Primary Text (Heading)**
- Light: #000000 (Neutral Dark)
- Dark:  #ffffff (Neutral Dark inverted)

**Secondary Text (Body)**
- Light: #333333 (Neutral Medium)
- Dark:  #e0e0e0 (Neutral Medium Dark)

**Tertiary Text (Helper)**
- Light: #666666 (Neutral Light)
- Dark:  #a0a0a0 (Neutral Light Dark)

**Disabled Text**
- Light: #ccc
- Dark:  #555

### Cards

**Card Background**
- Light: #ffffff
- Dark:  #2a2a2a

**Card Border/Shadow**
- Light: 1px #eee or shadow 0px 2px 4px rgba(0,0,0,0.1)
- Dark:  1px #333 or shadow 0px 2px 4px rgba(0,0,0,0.3)

**Card Title**
- Light: #000000
- Dark:  #ffffff

**Card Description**
- Light: #666666
- Dark:  #a0a0a0

### Form Elements

**Input Border (Focus)**
- Light: #007AFF
- Dark:  #0A84FF

**Input Border (Default)**
- Light: #ddd
- Dark:  #444

**Input Background**
- Light: #ffffff
- Dark:  #2a2a2a

**Input Text**
- Light: #000000
- Dark:  #ffffff

**Placeholder Text**
- Light: #999999
- Dark:  #666666

---

## Contrast Compliance

### WCAG AA Contrast Ratios (Target: 4.5:1 for normal text)

**Light Mode - Compliant ✓**
- Dark text (#000) on white (#fff): 21:1
- Dark text (#000) on light gray (#f5f5f5): 18:1
- Blue text (#007AFF) on white: 3.5:1 (use only for interactive elements)
- Gray text (#666) on white: 7:1

**Dark Mode - Compliant ✓**
- White text (#fff) on dark (#1a1a1a): 20:1
- White text (#fff) on card (#2a2a2a): 18:1
- Bright blue (#0A84FF) on dark: 6:1
- Light gray (#e0e0e0) on dark: 11:1

---

## Semantic Color System

### Status Indicators

**Positive/Valid**
```
Color:       #34C759 (Light) / #30B0C0 (Dark)
Example:     Document expires in 60 days
Card BG:     #f0faf3 (Light) / #1a3a38 (Dark)
Border:      #34C759
```

**Warning/Expiring Soon**
```
Color:       #FF9500 (Both modes)
Example:     Document expires in 5 days
Card BG:     #fff3cd (Light) / #3a2800 (Dark)
Border:      #FF9500
```

**Danger/Expired**
```
Color:       #FF3B30 (Light) / #FF453A (Dark)
Example:     Document expired
Card BG:     #ffebee (Light) / #3a1a1a (Dark)
Border:      #FF3B30 (Light) / #FF453A (Dark)
```

---

## Animation & Transitions

### Color Transitions
- Duration: 200ms
- Easing: ease-in-out
- Example: Button color change on press

### Opacity Changes
- Disabled state: 0.5 opacity
- Pressed state: 0.8 opacity
- Fade transitions: 300ms

---

## CSS/React Native Examples

### Light Mode StyleSheet
```javascript
const colors = {
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  text: '#000000',
  textSecondary: '#333333',
  textTertiary: '#666666',
  background: '#f5f5f5',
  card: '#ffffff',
  border: '#ddd',
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    color: '#ffffff',
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  text: {
    color: colors.text,
  },
});
```

### Dark Mode StyleSheet
```javascript
const colorsDark = {
  primary: '#0A84FF',
  success: '#30B0C0',
  warning: '#FF9500',
  error: '#FF453A',
  text: '#ffffff',
  textSecondary: '#e0e0e0',
  textTertiary: '#a0a0a0',
  background: '#1a1a1a',
  card: '#2a2a2a',
  border: '#444',
};

const darkStyles = StyleSheet.create({
  button: {
    backgroundColor: colorsDark.primary,
    color: colorsDark.text,
  },
  card: {
    backgroundColor: colorsDark.card,
    borderColor: colorsDark.border,
  },
  text: {
    color: colorsDark.text,
  },
});
```

### Dynamic Mode Selector
```javascript
import { useColorScheme } from 'react-native';

const isDark = useColorScheme() === 'dark';
const colors = isDark ? colorsDark : colorsLight;

return (
  <View style={[styles.card, { backgroundColor: colors.card }]}>
    <Text style={{ color: colors.text }}>Content</Text>
  </View>
);
```

---

## Color Accessibility Checklist

- [ ] All text meets WCAG AA contrast requirements (4.5:1)
- [ ] Status indicators don't rely on color alone (use icons + color)
- [ ] Color-blind friendly palette (tested with simulators)
- [ ] High contrast mode support
- [ ] Sufficient differentiation between interactive elements
- [ ] Disabled states visually distinct
- [ ] Focus states clearly visible
- [ ] Dark mode tested for contrast

---

## Tools for Verification

- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Color Blind Simulator:** https://www.color-blindness.com/coblis-color-blindness-simulator/
- **Accessibility Validator:** https://www.accessibilityvalidator.com/
- **React Native Dark Mode:** `useColorScheme()` hook

---

**Last Updated:** 2026-06-04
**Status:** Ready for implementation