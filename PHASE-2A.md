# Phase 2A: Feature Parity Implementation

**Goal:** Complete all Phase 2A features to achieve full parity with PWA before launching to Play Store/App Store

**Timeline:** 5-7 days of development work  
**Status:** 🔄 In Progress

---

## Priority 1: Document Editing Form (4-6 hours) ⭐ HIGHEST PRIORITY

**Why First:** Used across ALL scanners (rate, receipt, smart scan) - highest ROI

**What to build:**
- Edit screen with form fields pre-filled with extracted data
- Confirm/Save button
- Cancel without saving
- Validation for required fields

**Implementation Steps:**
1. Create `EditDocumentScreen.tsx`
2. Accept props: `{ extractedData, onSave, onCancel }`
3. Display editable TextInput fields
4. Save corrected data via `api.updateDocument()`
5. Add to navigation stacks for each scanner

**Files to Modify:**
- `src/screens/EditDocumentScreen.tsx` (new)
- `src/screens/ScanRateConScreen.js` (add edit flow)
- `src/screens/ScanReceiptScreen.js` (add edit flow)
- `src/screens/SmartScanScreen.js` (add edit flow)

**Testing:**
- [ ] Scan document
- [ ] Edit extracted fields
- [ ] Save corrected data
- [ ] View saved changes in vault

---

## Priority 2: PDF Support (3-4 hours)

**Why Second:** Enables more document types without breaking existing flow

**What to build:**
- Replace image-picker with document-picker that accepts PDFs
- Update API calls to handle PDF uploads
- File type validation
- Display handling (store URI, show preview if possible)

**Implementation Steps:**
1. Add document-picker library
2. Create file picker component with PDF support
3. Update all scanning screens to accept PDFs
4. Test with various PDF sizes

**Files to Modify:**
- `src/lib/api.js` (handle PDF uploads)
- `src/screens/ScanRateConScreen.js` (PDF picker)
- `src/screens/ScanReceiptScreen.js` (PDF picker)
- `src/screens/SmartScanScreen.js` (PDF picker)

**Testing:**
- [ ] Pick PDF from files
- [ ] Upload to backend
- [ ] Verify in vault
- [ ] Test with different file sizes

---

## Priority 3: Expense Records (5-6 hours)

**Why Third:** Separates receipt data from document vault (different data model)

**What to build:**
- Separate data model for expenses (AsyncStorage)
- Save receipts as expense entries (not vault documents)
- Create ExpensesScreen to list all expenses
- Display in table format: vendor, amount, date
- Edit/delete functionality

**Implementation Steps:**
1. Create expense data model/service
2. Create ExpensesScreen
3. Add expense list display
4. Add edit/delete functionality
5. Link Receipt scanner to expense creation

**Files to Modify:**
- `src/lib/expenses.js` (new)
- `src/screens/ExpensesScreen.tsx` (new)
- `src/screens/ScanReceiptScreen.js` (save as expense)
- Navigation config (add Expenses screen)

**Testing:**
- [ ] Scan receipt
- [ ] Save as expense entry
- [ ] View in Expenses list
- [ ] Edit/delete expense
- [ ] Verify separate from vault

---

## Priority 4: Load Management (6-8 hours)

**Why Fourth:** Highest complexity, but needed for "My Loads" functionality

**What to build:**
- Load data model (active, completed, pending)
- Rate confirmations linked to loads
- Create load screen with status tracking
- Show multiple confirmations per load
- Edit/complete load

**Implementation Steps:**
1. Create load data model/service
2. Create LoadsScreen (list all loads)
3. Create EditLoadScreen (create/edit)
4. Link rate confirmations to loads
5. Show load status and confirmations

**Files to Modify:**
- `src/lib/loads.js` (new)
- `src/screens/LoadsScreen.tsx` (new)
- `src/screens/EditLoadScreen.tsx` (new)
- `src/screens/ScanRateConScreen.js` (link to load)
- Navigation config

**Testing:**
- [ ] Create new load
- [ ] Scan rate confirmation for load
- [ ] View load with confirmations
- [ ] Edit load details
- [ ] Complete load

---

## Priority 5: File Picker for Manual Upload (3-4 hours)

**Why Last:** Lower priority than core features, builds on PDF support

**What to build:**
- Upload button in Vault
- File picker dialog
- Metadata form (type, expiry, etc.)
- Upload progress indicator
- Error handling

**Implementation Steps:**
1. Create file picker component
2. Add upload button to DocumentVaultScreen
3. Create metadata form
4. Upload via API
5. Show progress and errors

**Files to Modify:**
- `src/screens/DocumentVaultScreen.js` (add upload button)
- `src/components/FileUploadModal.tsx` (new)

**Testing:**
- [ ] Tap upload button
- [ ] Select file
- [ ] Fill metadata
- [ ] Upload and save
- [ ] View in vault

---

## Implementation Order (Recommended)

```
Week 1:
├─ Mon: Document Editing (4-6h)
├─ Tue: PDF Support (3-4h)
└─ Wed: Expense Records (5-6h)

Week 2:
├─ Thu: Load Management (6-8h)
└─ Fri: File Picker (3-4h) + Testing & Fixes

Week 3:
├─ Full regression testing
├─ Performance optimization
└─ Prepare for production build
```

---

## Acceptance Criteria

Phase 2A is complete when:

- [ ] Document Editing form works for all scanners
- [ ] PDFs can be uploaded and scanned
- [ ] Receipts saved as separate Expense entries
- [ ] Rates linked to Load records
- [ ] Manual file upload to vault works
- [ ] All Phase 1 features still work ✅
- [ ] No console errors on web
- [ ] Successfully builds on Android & iOS via EAS

---

## Testing Checklist

Before moving to production:

- [ ] Test Rate Confirmation: scan → edit → save to load
- [ ] Test Receipt: scan → edit → save as expense
- [ ] Test Smart Scan: scan → category → save to vault with expiry
- [ ] Test Vault: view documents, delete, upload files
- [ ] Test Loads: create, add rate confirmation, view, complete
- [ ] Test Expenses: scan receipt, save, view list, delete
- [ ] Test Notifications: expiry reminders trigger correctly
- [ ] Test on Android emulator
- [ ] Test on iOS simulator
- [ ] Test on physical Android device (if possible)
- [ ] Test on physical iPhone (via Expo Go)

---

## Notes

- All new features use same API endpoints (already connected)
- AsyncStorage for local data persistence
- Consistent styling with existing components
- Follow existing code patterns
- Add unit tests for new data services
