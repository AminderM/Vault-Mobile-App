# Backend Integration Checklist

**Status:** 🔄 In Progress  
**Mobile App Version:** Phase 2A Complete (v1.0)  
**Expected Go-Live:** June 12-15, 2026  

---

## Overview

The React Native mobile app needs **full integration** with the backend API before production submission. This guide lists all endpoints, test cases, and configuration requirements.

**App Details:**
- Android Package: `com.integraatech.vault`
- iOS Bundle ID: `com.integraatech.vault`
- Staging Backend URL: `https://api.staging.integratedtech.ca`
- Production Backend URL: `https://api.integratedtech.ca`

---

## Phase 1: Document Scanning Endpoints

### 1. Rate Confirmation Scanner
**Endpoint:** `POST /api/driver-mobile/rate-con/parse`

**Purpose:** Parse rate confirmation documents and extract data

**Request:**
```
Content-Type: multipart/form-data
Body: File (image or PDF)
```

**Expected Response (Success 200):**
```json
{
  "carrier": "JB Hunt",
  "rateAmount": 4200,
  "loadDate": "2026-06-01",
  "destination": "Houston, TX",
  "origin": "Windsor, ON",
  "expiryDate": "2026-12-31",
  "rawText": "extracted text from document"
}
```

**Test Cases:**
- ✅ Valid rate confirmation (PNG/JPG)
- ✅ Valid rate confirmation (PDF)
- ✅ Rotated image
- ❌ Unsupported file type (returns 415)
- ❌ File too large >10MB (returns 413)
- ❌ Blank/invalid document (returns 422)
- ❌ No OCR available (returns 503)

---

### 2. Receipt Scanner
**Endpoint:** `POST /api/driver-mobile/receipt/parse`

**Purpose:** Parse receipt/expense documents

**Request:**
```
Content-Type: multipart/form-data
Body: File (image or PDF)
```

**Expected Response (Success 200):**
```json
{
  "vendor": "Shell Gas",
  "amount": 85.50,
  "category": "fuel",
  "date": "2026-06-01",
  "location": "Toronto, ON",
  "rawText": "extracted text"
}
```

**Test Cases:**
- ✅ Gas station receipt
- ✅ Toll receipt
- ✅ Meal receipt
- ✅ PDF receipt
- ❌ Invalid format
- ❌ File size limits
- ❌ Low quality image

---

### 3. Smart Document Identification
**Endpoint:** `POST /api/driver-mobile/scan/identify`

**Purpose:** Auto-identify document type and extract relevant data

**Request:**
```
Content-Type: multipart/form-data
Body: File (any document)
```

**Expected Response (Success 200):**
```json
{
  "documentType": "rate_confirmation",
  "confidence": 0.95,
  "data": {
    "carrier": "JB Hunt",
    "rateAmount": 4200
  },
  "requiresManualReview": false
}
```

**Possible Document Types:**
- `rate_confirmation` - Rate quotes
- `receipt` - Expense receipts
- `invoice` - Invoices
- `bol` - Bills of lading
- `insurance` - Insurance documents
- `license` - Driver license
- `registration` - Vehicle registration
- `unknown` - Unable to identify

**Test Cases:**
- ✅ Rate confirmation
- ✅ Receipt
- ✅ Invoice
- ✅ Multiple document types
- ✅ Low confidence documents
- ❌ Invalid files

---

## Phase 2A: Document Management Endpoints

### 4. Save Document
**Endpoint:** `POST /api/documents`

**Purpose:** Save scanned/uploaded document to vault

**Request:**
```json
{
  "docType": "rate_confirmation",
  "extractedData": {
    "carrier": "JB Hunt",
    "rateAmount": 4200,
    "loadDate": "2026-06-01"
  },
  "expiryDate": "2026-12-31",
  "fileUrl": "s3://bucket/doc123.pdf",
  "fileName": "rate-conf-2606.pdf",
  "uploadedAt": "2026-06-01T10:30:00Z"
}
```

**Expected Response (Success 201):**
```json
{
  "id": "doc_123456",
  "docType": "rate_confirmation",
  "extractedData": {...},
  "expiryDate": "2026-12-31",
  "createdAt": "2026-06-01T10:30:00Z",
  "status": "active"
}
```

**Test Cases:**
- ✅ Save with all fields
- ✅ Save without optional fields
- ✅ Save with expiry date
- ✅ Save without expiry date
- ❌ Missing required fields
- ❌ Invalid docType
- ❌ Database error

---

### 5. Get Document
**Endpoint:** `GET /api/documents/:id`

**Purpose:** Retrieve a single document

**Request:**
```
GET /api/documents/doc_123456
```

**Expected Response (Success 200):**
```json
{
  "id": "doc_123456",
  "docType": "rate_confirmation",
  "extractedData": {...},
  "expiryDate": "2026-12-31",
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-01T10:30:00Z"
}
```

**Test Cases:**
- ✅ Get existing document
- ❌ Get non-existent document (returns 404)
- ❌ Unauthorized access

---

### 6. List Documents
**Endpoint:** `GET /api/documents`

**Purpose:** List all documents in vault

**Request:**
```
GET /api/documents?limit=20&offset=0&category=rate_confirmation
```

**Expected Response (Success 200):**
```json
{
  "documents": [
    {
      "id": "doc_123456",
      "docType": "rate_confirmation",
      "fileName": "rate-conf-2606.pdf",
      "createdAt": "2026-06-01T10:30:00Z",
      "expiryDate": "2026-12-31",
      "expiryStatus": "active"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

**Expiry Status Values:**
- `active` - No expiration
- `warning` - Expires in 30 days
- `urgent` - Expires in 7 days
- `expired` - Already expired

**Test Cases:**
- ✅ List all documents
- ✅ Filter by category
- ✅ Pagination (limit/offset)
- ✅ Sorting options
- ✅ Empty list
- ✅ Large list (100+ items)

---

### 7. Update Document
**Endpoint:** `PUT /api/documents/:id`

**Purpose:** Update document metadata

**Request:**
```json
{
  "extractedData": {
    "carrier": "Updated Carrier"
  },
  "expiryDate": "2026-12-31"
}
```

**Expected Response (Success 200):**
```json
{
  "id": "doc_123456",
  "extractedData": {...},
  "updatedAt": "2026-06-01T11:45:00Z"
}
```

**Test Cases:**
- ✅ Update single field
- ✅ Update multiple fields
- ✅ Partial update
- ❌ Update non-existent document
- ❌ Invalid data format

---

### 8. Delete Document
**Endpoint:** `DELETE /api/documents/:id`

**Purpose:** Delete document from vault

**Request:**
```
DELETE /api/documents/doc_123456
```

**Expected Response (Success 200):**
```json
{
  "id": "doc_123456",
  "status": "deleted",
  "deletedAt": "2026-06-01T11:45:00Z"
}
```

**Test Cases:**
- ✅ Delete existing document
- ❌ Delete non-existent document (returns 404)
- ✅ Verify file cleanup (S3/storage)

---

### 9. Upload File to Vault
**Endpoint:** `POST /api/documents/upload`

**Purpose:** Upload file directly without scanning

**Request:**
```
Content-Type: multipart/form-data
- file: Binary file
- category: "invoices"
- expiryDate: "2026-12-31" (optional)
- notes: "Invoice for June" (optional)
```

**Expected Response (Success 201):**
```json
{
  "id": "doc_upload_789",
  "fileName": "invoice-june-2026.pdf",
  "fileSize": 2500000,
  "category": "invoices",
  "uploadedAt": "2026-06-01T10:30:00Z",
  "expiryDate": "2026-12-31",
  "notes": "Invoice for June"
}
```

**Valid Categories:**
- `invoices`
- `bills-of-lading`
- `rate-confirmations`
- `safety-compliance`
- `business-docs`
- `expense-receipts`
- `other`

**Test Cases:**
- ✅ Upload image file
- ✅ Upload PDF
- ✅ Upload with expiry date
- ✅ Upload with notes
- ❌ File too large >10MB (returns 413)
- ❌ Unsupported file type (returns 415)
- ❌ Missing required category

---

## Phase 2A: Expense Tracking Endpoints

### 10. Create Expense
**Endpoint:** `POST /api/driver-mobile/expenses`

**Purpose:** Create a new expense record

**Request:**
```json
{
  "category": "fuel",
  "vendor": "Shell Gas",
  "amount": 85.50,
  "date": "2026-06-01",
  "location": "Toronto, ON",
  "notes": "Fill-up",
  "loadId": "load_123" // optional
}
```

**Expected Response (Success 201):**
```json
{
  "id": "exp_123456",
  "category": "fuel",
  "vendor": "Shell Gas",
  "amount": 85.50,
  "date": "2026-06-01",
  "createdAt": "2026-06-01T10:30:00Z"
}
```

**Valid Categories:**
- `fuel`
- `tolls`
- `meals`
- `accommodation`
- `maintenance`
- `parking`
- `other`

**Test Cases:**
- ✅ Create with all fields
- ✅ Create with minimal fields
- ✅ Create linked to load
- ❌ Missing required fields
- ❌ Invalid category
- ❌ Future date validation

---

### 11. Get Expenses
**Endpoint:** `GET /api/driver-mobile/expenses?filters`

**Purpose:** List expenses with filtering

**Query Parameters:**
```
?startDate=2026-06-01
&endDate=2026-06-30
&category=fuel
&limit=50
&offset=0
```

**Expected Response (Success 200):**
```json
{
  "expenses": [
    {
      "id": "exp_123456",
      "category": "fuel",
      "vendor": "Shell Gas",
      "amount": 85.50,
      "date": "2026-06-01",
      "location": "Toronto, ON"
    }
  ],
  "total": 125,
  "totalAmount": 3250.75,
  "limit": 50,
  "offset": 0
}
```

**Test Cases:**
- ✅ Get all expenses
- ✅ Filter by date range
- ✅ Filter by category
- ✅ Pagination
- ✅ Sorting (date, amount, vendor)
- ✅ Empty results

---

### 12. Delete Expense
**Endpoint:** `DELETE /api/driver-mobile/expenses/:id`

**Purpose:** Delete an expense record

**Request:**
```
DELETE /api/driver-mobile/expenses/exp_123456
```

**Expected Response (Success 200):**
```json
{
  "id": "exp_123456",
  "status": "deleted"
}
```

**Test Cases:**
- ✅ Delete existing expense
- ❌ Delete non-existent expense (returns 404)

---

## Phase 2A: Load Management Endpoints

### 13. Create Load
**Endpoint:** `POST /api/driver-mobile/loads`

**Purpose:** Create a new load/trip record

**Request:**
```json
{
  "startLocation": "Windsor, ON",
  "endLocation": "Houston, TX",
  "date": "2026-06-01",
  "rateAmount": 4200,
  "carrier": "JB Hunt",
  "status": "pending",
  "notes": "Direct load",
  "rateConfirmationId": "doc_123" // optional
}
```

**Expected Response (Success 201):**
```json
{
  "id": "load_123456",
  "startLocation": "Windsor, ON",
  "endLocation": "Houston, TX",
  "date": "2026-06-01",
  "rateAmount": 4200,
  "carrier": "JB Hunt",
  "status": "pending",
  "createdAt": "2026-06-01T10:30:00Z"
}
```

**Valid Status Values:**
- `pending` - Not yet started
- `in-progress` - Currently running
- `completed` - Load delivered
- `cancelled` - Cancelled

**Test Cases:**
- ✅ Create with all fields
- ✅ Create with minimal fields
- ✅ Link to rate confirmation
- ❌ Missing required fields
- ❌ Invalid status

---

### 14. Get Loads
**Endpoint:** `GET /api/driver-mobile/loads?filters`

**Purpose:** List loads with filtering

**Query Parameters:**
```
?status=pending
&startDate=2026-06-01
&endDate=2026-06-30
&carrier=JB Hunt
&limit=50
```

**Expected Response (Success 200):**
```json
{
  "loads": [
    {
      "id": "load_123456",
      "startLocation": "Windsor, ON",
      "endLocation": "Houston, TX",
      "date": "2026-06-01",
      "rateAmount": 4200,
      "carrier": "JB Hunt",
      "status": "pending",
      "rateConfirmationId": "doc_123",
      "expenseCount": 2
    }
  ],
  "total": 45,
  "totalRevenue": 189000,
  "completedCount": 10,
  "limit": 50,
  "offset": 0
}
```

**Test Cases:**
- ✅ Get all loads
- ✅ Filter by status
- ✅ Filter by date range
- ✅ Filter by carrier
- ✅ Pagination
- ✅ Statistics (total revenue, completed count)

---

### 15. Get Single Load
**Endpoint:** `GET /api/driver-mobile/loads/:id`

**Purpose:** Get detailed load information

**Expected Response (Success 200):**
```json
{
  "id": "load_123456",
  "startLocation": "Windsor, ON",
  "endLocation": "Houston, TX",
  "date": "2026-06-01",
  "rateAmount": 4200,
  "carrier": "JB Hunt",
  "status": "pending",
  "rateConfirmationId": "doc_123",
  "expenseIds": ["exp_001", "exp_002"],
  "notes": "Direct load",
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-01T10:30:00Z"
}
```

**Test Cases:**
- ✅ Get existing load
- ❌ Get non-existent load (returns 404)

---

### 16. Update Load
**Endpoint:** `PUT /api/driver-mobile/loads/:id`

**Purpose:** Update load status or details

**Request:**
```json
{
  "status": "completed",
  "actualCompletionDate": "2026-06-02",
  "notes": "Completed ahead of schedule"
}
```

**Expected Response (Success 200):**
```json
{
  "id": "load_123456",
  "status": "completed",
  "actualCompletionDate": "2026-06-02",
  "updatedAt": "2026-06-02T08:15:00Z"
}
```

**Test Cases:**
- ✅ Update status
- ✅ Update notes
- ✅ Update completion date
- ❌ Invalid status
- ❌ Non-existent load

---

### 17. Delete Load
**Endpoint:** `DELETE /api/driver-mobile/loads/:id`

**Purpose:** Delete a load record

**Request:**
```
DELETE /api/driver-mobile/loads/load_123456
```

**Expected Response (Success 200):**
```json
{
  "id": "load_123456",
  "status": "deleted"
}
```

**Test Cases:**
- ✅ Delete pending load
- ✅ Delete completed load
- ❌ Delete non-existent load

---

## Additional Requirements

### Authentication
**Required:** Bearer token in Authorization header

```
Authorization: Bearer eyJhbGc...
```

**Status Codes:**
- 401: Invalid/missing token
- 403: Insufficient permissions

**Test Cases:**
- ✅ Valid token → Success
- ❌ Missing token → 401
- ❌ Invalid token → 401
- ❌ Expired token → 401

---

### Rate Limiting
**Recommended:** 100 requests per minute per user

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1622548800
```

**Test Cases:**
- ✅ Under limit → Success
- ❌ Over limit → 429 Too Many Requests

---

### File Upload Handling

**Requirements:**
- Max file size: 10MB
- Supported formats: PNG, JPG, PDF
- Store in S3 or equivalent
- Return signed URLs for downloads
- Auto-delete expired documents

**Test Cases:**
- ✅ Upload valid file
- ✅ Generate signed URL
- ❌ File >10MB → 413
- ❌ Invalid format → 415

---

### Notifications & Expiry

**Document Expiry Alerts:**
- Email reminders at: 60 days, 30 days, 15 days, 7 days, 1 day before expiry
- Push notifications (FCM/APNs) for mobile app
- Mark as "urgent" if <7 days
- Archive after expiration

**Test Cases:**
- ✅ Expiry reminder emails sent
- ✅ Push notifications delivered
- ✅ Documents marked urgent
- ✅ Auto-archive on expiry

---

## Testing Environment Setup

### Staging Configuration
```
Base URL: https://api.staging.integratedtech.ca
Database: staging_db
File Storage: s3://staging-vault-files/
```

### Production Configuration
```
Base URL: https://api.integratedtech.ca
Database: production_db
File Storage: s3://production-vault-files/
```

---

## Integration Testing Checklist

### Phase 1: Scanner Endpoints
- [ ] Rate confirmation scanner works (image & PDF)
- [ ] Receipt scanner works (image & PDF)
- [ ] Smart ID works for all document types
- [ ] Error handling for invalid files
- [ ] File size limits enforced
- [ ] OCR accuracy acceptable (>90%)

### Phase 2A: Document Management
- [ ] Save document stores in vault
- [ ] Get document retrieves correctly
- [ ] List documents with filtering works
- [ ] Update document saves changes
- [ ] Delete document removes from system
- [ ] File upload accepts images & PDFs
- [ ] Expiry date tracking works

### Phase 2A: Expenses
- [ ] Create expense saves data
- [ ] Get expenses with filtering
- [ ] All 7 categories supported
- [ ] Date range filtering works
- [ ] Delete expense removes record
- [ ] Statistics calculated correctly

### Phase 2A: Loads
- [ ] Create load saves data
- [ ] Get loads with filtering
- [ ] Status filtering (pending/completed/cancelled)
- [ ] Update load changes status
- [ ] Delete load removes record
- [ ] Statistics (revenue, count) calculated

### Cross-Feature
- [ ] Loads can be linked to rate confirmations
- [ ] Loads can have multiple expenses
- [ ] Authentication required for all endpoints
- [ ] Proper error messages for all failures
- [ ] Response times <200ms for list endpoints
- [ ] Response times <100ms for single document

---

## Sign-Off Checklist

**Backend Team:**
- [ ] All endpoints tested
- [ ] Database migrations completed
- [ ] File upload service configured
- [ ] Notification service ready
- [ ] Staging environment stable
- [ ] Production environment ready
- [ ] Authentication service working
- [ ] Rate limiting configured
- [ ] Error handling complete
- [ ] Documentation complete

**Frontend Team (Mobile):**
- [ ] All endpoints integrated
- [ ] Error handling in app
- [ ] Loading states working
- [ ] Network timeouts handled
- [ ] Offline queue prepared (Phase 2B)
- [ ] Testing complete on web & devices

**DevOps:**
- [ ] Staging deployed
- [ ] Production deployed
- [ ] Monitoring setup
- [ ] Alerting configured
- [ ] Backup strategy verified
- [ ] Database replicated

---

## Next Steps

1. **Review this checklist** with backend team
2. **Assign endpoints** to backend developers
3. **Set target date** for Phase 1 completion
4. **Set target date** for Phase 2A completion
5. **Schedule integration tests** with frontend
6. **Get sign-off** from all teams
7. **Proceed to Task 2:** Credentials Setup

---

**Status:** 🔄 Pending Backend Team Review  
**Next Milestone:** All endpoints tested and working  
**Timeline:** 3-5 days for Phase 1 + Phase 2A integration

Ready to share this with your backend team? 🚀
