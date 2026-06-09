# UI Redesign Roadmap - Match PWA Design

**Goal:** Polish all screens to match PWA's professional design  
**Timeline:** 1-2 weeks  
**Target Launch:** June 18-20, 2026

---

## Design System Foundation

### Colors (Already Set ✅)
```
Primary:       #FF3B30 (Red)
Background:    #1a1a1a (Dark)
Cards:         #2a2a2a (Medium Dark)
Text Primary:  #ffffff (White)
Text Secondary: #999999 (Gray)
Borders:       #333333 (Dark Gray)
Success:       #34C759 (Green)
Warning:       #FF9500 (Orange)
```

### Typography
- **Title:** 28px, Bold, White
- **Subtitle:** 18px, Semibold, White
- **Body:** 14px, Regular, White
- **Caption:** 12px, Regular, Gray
- **Label:** 11px, Medium, Gray

### Spacing
- **Padding:** 16px (standard)
- **Gap:** 12px (between elements)
- **Margin:** 20px (sections)
- **Border Radius:** 8px (standard)

### Shadows & Borders
- **Card Border:** 1px solid #333333
- **Card Shadow:** Subtle (rgba 0,0,0,0.3)
- **Left Border:** 4px solid primary color

---

## Screen-by-Screen Redesign

### Screen 1: My Loads (Priority 1)

**Current Issues:**
- Basic card layout
- Needs better spacing
- Stats display needs refinement
- Status badges need better styling

**Target Design (from PWA):**
```
┌─────────────────────────────────┐
│ My Loads                        │
│ Scan and verify rate confirm... │
└─────────────────────────────────┘

┌──┬──┬──┐
│45 │10 │$189K│  (Stats cards with borders)
└──┴──┴──┘

[ALL] [PENDING] [COMPLETED] [CANCELLED]

┌─────────────────────────────┐
│ LOAD-001                    │ ← Card with left border
│ Windsor, ON → Houston, TX   │
│ $4,200      JB Hunt         │
│ Due: Jun 4, 2026            │
│ 📄 Rate Confirmation        │
│ 💰 2 Expenses              │
└─────────────────────────────┘

[SCAN RATE CONFIRMATION] [CREATE LOAD]
```

**Changes Required:**
- [ ] Improve stat cards with better spacing
- [ ] Enhance load cards with left border accent
- [ ] Better status badge styling
- [ ] Improve button styling (larger, rounder)
- [ ] Add subtle card shadows
- [ ] Better section spacing

---

### Screen 2: Expenses (Priority 2)

**Target Design (from PWA):**
```
┌─────────────────────────────┐
│ Expenses                    │
│ Manage trip expenses        │
└─────────────────────────────┘

[ALL TIME] [THIS WEEK] [THIS MONTH] [THIS YEAR]

Total Spent: $150.00 (in RED)

┌─────────────────────────────┐
│ Category Breakdown          │
│                             │
│ 🚗 Fuel                     │
│ ████████████ $150.00        │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 🚗 Tolls          -$150.00  │
│ Jun 1, 2026                 │
└─────────────────────────────┘

[SCAN] [ADD EXPENSE]
```

**Changes Required:**
- [ ] Better stat display (larger font, red color)
- [ ] Improved breakdown card styling
- [ ] Better expense list items
- [ ] Cleaner category breakdown visualization
- [ ] Enhanced button styling

---

### Screen 3: Smart Scan (Priority 3)

**Target Design (from PWA):**
```
┌─────────────────────────────┐
│ Smart Scan                  │
│ Scan rate confirmations...  │
└─────────────────────────────┘

[📸 TAKE PHOTO] [🖼️ PICK GALLERY] [📄 UPLOAD DOC]

(When document detected:)

┌─────────────────────────────┐
│ Document Detected           │
│                             │
│ Category Selection:         │
│ [License] [Insurance]...    │
│                             │
│ Expiry Date:                │
│ [YYYY-MM-DD          ]      │
│                             │
│ [✏️ EDIT DATA] [SAVE]       │
└─────────────────────────────┘
```

**Changes Required:**
- [ ] Better button styling (larger, more prominent)
- [ ] Improved form layout spacing
- [ ] Better category button grid
- [ ] Input field styling with proper borders
- [ ] Button pair layout (Edit/Save side-by-side)

---

### Screen 4: Upload to Vault (Priority 4)

**Target Design (from PWA):**
```
┌─────────────────────────────┐
│ Upload to Vault             │
│ Add files to your vault     │
└─────────────────────────────┘

1. Select File:
┌─────────────────────────────┐
│   📁 Pick File              │
│   (dashed border)           │
└─────────────────────────────┘

2. Choose Category:
┌──┬──┐
│📄 │📦 │
│Inv│BOL│
├──┼──┤
│📋 │🛡️ │
│RC │SC │
└──┴──┘

3. Expiry Date (Optional):
[YYYY-MM-DD          ]

4. Notes (Optional):
[Add notes...                  ]

[📤 UPLOAD TO VAULT]
```

**Changes Required:**
- [ ] Better file picker styling (dashed border)
- [ ] Category grid with icons (2x3 or 2x4)
- [ ] Input field refinement
- [ ] Upload button prominence
- [ ] Form section spacing

---

## Component Improvements

### Cards
**Current:** Basic background color  
**Target:** 
- Subtle border: 1px solid #333333
- Left accent border: 4px solid primary
- Padding: 16px
- Border radius: 8px
- Subtle shadow

### Buttons
**Current:** Basic colored rectangles  
**Target:**
- Padding: 14-16px vertical, 20px+ horizontal
- Border radius: 8px
- Font weight: 600
- Font size: 14-16px
- Shadow on press
- Consistent sizing

### Input Fields
**Current:** Basic border  
**Target:**
- Border: 1px solid #333333
- Background: #2a2a2a
- Padding: 12px
- Border radius: 8px
- Text color: #ffffff
- Placeholder: #666666

### Stats Display
**Current:** Basic text  
**Target:**
- Large, bold numbers
- Supporting text below
- Card-based layout
- Better spacing
- Color-coded (success=green, primary=red)

---

## Implementation Plan

### Week 1: Foundation
- [ ] Create reusable Card component
- [ ] Create reusable Button component
- [ ] Create reusable Input component
- [ ] Create reusable Section component
- [ ] Update theme.js with component styles

### Week 1-2: Screen Updates
- [ ] Redesign LoadsScreen
- [ ] Redesign ExpenseScreen
- [ ] Redesign SmartScanScreen
- [ ] Redesign FilePickerScreen

### Week 2: Polish & Testing
- [ ] Test all screens on web
- [ ] Test on iOS Expo Go (once available)
- [ ] Test on Android device
- [ ] Fix any spacing/alignment issues
- [ ] Performance optimization

### Week 2: Final Review
- [ ] Compare with PWA side-by-side
- [ ] User acceptance testing
- [ ] Final tweaks
- [ ] Ready for production builds

---

## Visual Comparison Checklist

For each screen, verify:
- [ ] **Spacing** - Matches PWA padding/margins
- [ ] **Typography** - Sizes and weights match
- [ ] **Colors** - Red (#FF3B30) used correctly
- [ ] **Cards** - Border and shadow styling
- [ ] **Buttons** - Size and positioning
- [ ] **Icons** - Emoji/SVG placement
- [ ] **Forms** - Input field styling
- [ ] **Lists** - Item spacing and dividers
- [ ] **Headers** - Title and subtitle placement
- [ ] **Overall Feel** - Professional and polished

---

## Success Criteria

✅ **Phase 1: Foundation**
- Reusable components created
- Theme system extended
- No visual inconsistencies

✅ **Phase 2: Screens**
- All 4 screens redesigned
- PWA design closely matched
- Responsive on all sizes

✅ **Phase 3: Polish**
- No spacing issues
- Smooth interactions
- Professional appearance
- Ready for app stores

---

## Next Step

**Start with: Create Reusable Components**
1. Card component (src/components/Card.js)
2. Button component (src/components/Button.js)
3. Input component (src/components/Input.js)
4. Section component (src/components/Section.js)

These will be used across all screens for consistency!

---

**Ready to start the redesign?** 🎨

Which component should we build first?
