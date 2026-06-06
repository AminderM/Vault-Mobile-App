# Backend Requirements for Integra Vault Mobile App

**Document for:** Backend Developer  
**Prepared by:** Frontend Team  
**Date:** 2026-06-06  
**Status:** In Progress - Phase 2A

---

## 1. Authentication & User Management

### Required Endpoints

#### User Authentication
- `POST /api/auth/register`
  - Input: `{ email, password, firstName, lastName, phone }`
  - Output: `{ userId, token, refreshToken, user }`
  - Validation: Email format, password strength, phone format

- `POST /api/auth/login`
  - Input: `{ email, password }`
  - Output: `{ userId, token, refreshToken, user }`
  - Validation: Credentials verification

- `POST /api/auth/refresh`
  - Input: `{ refreshToken }`
  - Output: `{ token, refreshToken }`

- `POST /api/auth/logout`
  - Input: `{ userId }`
  - Output: `{ success: true }`

#### User Profile
- `GET /api/auth/profile`
  - Output: `{ id, email, firstName, lastName, phone, company, companyDetails, subscriptionStatus, createdAt }`
  - Headers: Bearer token required

- `PUT /api/auth/profile`
  - Input: `{ firstName, lastName, phone, company }`
  - Output: Updated user object
  - Headers: Bearer token required

- `PUT /api/auth/profile/business`
  - Input: `{ companyName, mcNumber, dotNumber, logo }`
  - Output: Updated business info
  - Headers: Bearer token required

---

## 2. Document Management (Phase 1)

### Required Endpoints

#### Document Vault
- `GET /api/documents`
  - Query params: `?category=&sortBy=&limit=&offset=`
  - Output: `{ documents: [], total, page, pageSize }`
  - Headers: Bearer token required

- `GET /api/documents/:id`
  - Output: Full document details with all metadata
  - Headers: Bearer token required

- `POST /api/documents`
  - Input: `{ docType, uploadedAt, expiryDate, metadata }`
  - Output: Created document with ID
  - Headers: Bearer token required
  - File handling: Support for image and PDF uploads

- `PUT /api/documents/:id`
  - Input: `{ docType, expiryDate, metadata }`
  - Output: Updated document
  - Headers: Bearer token required

- `DELETE /api/documents/:id`
  - Output: `{ success: true, id }`
  - Headers: Bearer token required

#### Document Categories
- `GET /api/documents/categories`
  - Output: `{ categories: ['License', 'Insurance', 'Inspection', ...] }`

---

## 3. Scanner Endpoints (Phase 1)

### Rate Confirmation Scanner
- `POST /api/driver-mobile/rate-con/parse`
  - Input: File upload (image/PDF)
  - Output: `{ vehicle, rate, date, carrier, confirmationNumber }`
  - Error codes: 415 (unsupported), 413 (too large), 503 (not configured), 422 (unreadable)

### Receipt Scanner
- `POST /api/driver-mobile/receipt/parse`
  - Input: File upload (image/PDF)
  - Output: `{ vendor, amount, date, description, category }`
  - Error codes: Same as above

### Smart Scan (Document Identification)
- `POST /api/driver-mobile/scan/identify`
  - Input: File upload (image/PDF)
  - Output: `{ documentType, confidence, extractedData, expiryDate }`
  - Error codes: Same as above

### File Upload Requirements
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, PDF, WebP
- Processing: OCR/ML model for data extraction
- Error handling: Return descriptive error messages

---

## 4. Expense Records (Phase 2A)

### Required Endpoints

#### Expense Management
- `GET /api/driver-mobile/expenses`
  - Query params: `?startDate=&endDate=&category=&limit=&offset=`
  - Output: `{ expenses: [], stats: { totalSpent, byCategory, expenseCount }, total }`
  - Headers: Bearer token required

- `POST /api/driver-mobile/expenses`
  - Input: `{ category, vendor, description, amount, date, receiptImage, notes }`
  - Output: Created expense with ID
  - Headers: Bearer token required

- `PUT /api/driver-mobile/expenses/:id`
  - Input: `{ category, vendor, description, amount, date, notes }`
  - Output: Updated expense
  - Headers: Bearer token required

- `DELETE /api/driver-mobile/expenses/:id`
  - Output: `{ success: true, id }`
  - Headers: Bearer token required

#### Expense Categories
- `GET /api/driver-mobile/expenses/categories`
  - Output: `{ categories: ['fuel', 'tolls', 'meals', 'accommodation', 'maintenance', 'parking', 'other'] }`

### Expense Data Model
```
Expense {
  id: string,
  userId: string,
  category: string,
  vendor?: string,
  description: string,
  amount: number (decimal),
  date: ISO date,
  receiptImage?: string (file URL),
  notes?: string,
  createdAt: ISO timestamp,
  updatedAt: ISO timestamp
}
```

---

## 5. Load Management (Phase 2A)

### Required Endpoints

#### Load/Trip Tracking
- `GET /api/driver-mobile/loads`
  - Query params: `?status=&limit=&offset=`
  - Output: `{ loads: [], total }`
  - Headers: Bearer token required

- `POST /api/driver-mobile/loads`
  - Input: `{ startLocation, endLocation, date, rateAmount, carrier, status }`
  - Output: Created load with ID
  - Headers: Bearer token required

- `PUT /api/driver-mobile/loads/:id`
  - Input: `{ status, actualCompletionDate, notes }`
  - Output: Updated load
  - Headers: Bearer token required

- `GET /api/driver-mobile/loads/:id`
  - Output: Full load details with associated documents/expenses
  - Headers: Bearer token required

### Load Data Model
```
Load {
  id: string,
  userId: string,
  startLocation: string,
  endLocation: string,
  date: ISO date,
  rateAmount: number,
  carrier: string,
  status: 'pending' | 'completed' | 'cancelled',
  rateConfirmation?: string (document ID),
  expenses: string[] (expense IDs),
  createdAt: ISO timestamp,
  updatedAt: ISO timestamp
}
```

---

## 6. Notifications (Phase 1)

### Required Functionality

#### Expiry Notifications
- Trigger expiry reminders at: 60 days, 30 days, 15 days, 7 days, 1 day before expiration
- Store notification preferences in user profile
- Support both push notifications and in-app alerts

#### Endpoints Needed
- `POST /api/notifications`
  - Input: `{ userId, type, docId, daysUntilExpiry, sentAt }`
  - Store notification history

- `GET /api/notifications`
  - Output: List of notifications for user
  - Headers: Bearer token required

- `PUT /api/notifications/:id/read`
  - Mark notification as read
  - Headers: Bearer token required

### Notification Push Service
- Support for both iOS and Android push notifications
- FCM (Firebase Cloud Messaging) or similar service
- Store device tokens for push delivery

---

## 7. Environment & Configuration

### Required Variables

#### Staging Environment (https://api.staging.integratedtech.ca)
- Database connection string
- JWT secret key
- File upload storage (S3, GCS, or local)
- Push notification service credentials
- Email service configuration
- OCR/Scanner API credentials

#### Production Environment
- Separate database
- Separate storage buckets
- Production-level security

### Configuration Endpoints
- `GET /api/config`
  - Output: `{ appVersion, features, maintenanceMode }`
  - Public endpoint (no auth required)

---

## 8. File Handling

### Requirements

#### File Upload (Phase 2A)
- `POST /api/upload` (temporary file upload)
  - Input: Multipart form data with file
  - Output: `{ fileUrl, fileId, expiresIn }`
  - Support: Images (JPEG, PNG, WebP), PDFs
  - Size limit: 10MB per file
  - Storage: Cloud storage (S3, GCS, Azure Blob)

#### File Deletion
- `DELETE /api/upload/:fileId`
  - Remove temporary files after use

### Storage Requirements
- Fast retrieval for mobile clients
- CDN support for images
- Compression for large files
- Backup strategy for critical files

---

## 9. Search & Filtering

### Document Search
- `GET /api/documents/search?q=query`
  - Full-text search across document types, dates, expiry status
  - Output: Matching documents

### Expense Search
- `GET /api/driver-mobile/expenses/search?q=query`
  - Search by vendor, category, date range
  - Output: Matching expenses

---

## 10. Analytics & Reporting (Phase 2B)

### Required Endpoints

#### P&L View
- `GET /api/driver-mobile/analytics/profit-loss?period=month`
  - Output: `{ collected, expenses, invoiced, outstanding, netProfit, margin }`
  - Support periods: week, month, year, custom range

#### Expense Analytics
- `GET /api/driver-mobile/analytics/expenses?period=month`
  - Output: Breakdown by category, trends, charts data

#### Load Analytics
- `GET /api/driver-mobile/analytics/loads?period=month`
  - Output: Number of loads, average rate, total miles

---

## 11. Data Validation & Error Handling

### Required Error Responses

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Field validation failed",
  "details": {
    "email": "Invalid email format",
    "amount": "Amount must be positive"
  }
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 413: Payload Too Large
- 415: Unsupported Media Type
- 422: Unprocessable Entity (OCR failed, etc.)
- 429: Too Many Requests (rate limiting)
- 500: Internal Server Error
- 503: Service Unavailable

---

## 12. Security Requirements

### Required Security Measures

#### Authentication
- JWT tokens with 1-hour expiration
- Refresh tokens with 7-day expiration
- Secure password hashing (bcrypt or similar)
- Password reset flow with email verification

#### Authorization
- Role-based access control (User, Admin)
- Users can only access their own data
- Admin endpoints for support team

#### Data Protection
- HTTPS only (SSL/TLS)
- CORS configuration for mobile app domain
- Request rate limiting (prevent abuse)
- SQL injection prevention (prepared statements)
- OWASP compliance

#### File Security
- Virus scanning for uploaded files
- Secure file storage with restricted access
- Expiring signed URLs for file downloads

---

## 13. Database Schema Requirements

### Core Tables Needed

#### Users
- id, email, password (hashed), firstName, lastName, phone
- companyName, mcNumber, dotNumber, logo
- subscriptionStatus, createdAt, updatedAt

#### Documents
- id, userId, docType, expiryDate, uploadedAt
- fileUrl, metadata, createdAt, updatedAt

#### Expenses
- id, userId, category, vendor, description, amount, date
- receiptImage, notes, createdAt, updatedAt

#### Loads
- id, userId, startLocation, endLocation, date, rateAmount
- carrier, status, rateConfirmationId, createdAt, updatedAt

#### Notifications
- id, userId, type, docId, daysUntilExpiry, sentAt, readAt

---

## 14. Testing Requirements

### Staging Environment Checklist
- [ ] All endpoints return correct status codes
- [ ] Validation errors return proper error messages
- [ ] File uploads work with images and PDFs
- [ ] Date filtering works correctly
- [ ] Authentication tokens expire properly
- [ ] CORS headers are set correctly
- [ ] Rate limiting is enforced

### Load Testing
- [ ] Handle 1000+ concurrent users
- [ ] Handle file uploads up to 10MB
- [ ] Response time < 2 seconds for most endpoints

---

## 15. API Documentation

### Required for Frontend Team
- OpenAPI/Swagger spec
- Authentication flow diagram
- Example request/response payloads
- Error code documentation
- Rate limiting details
- Pagination format
- Field validation rules

---

## 16. Staging vs Production Checklist

### Before Production Release
- [ ] All Phase 2A features tested in staging
- [ ] Performance benchmarks passed
- [ ] Security audit completed
- [ ] Database backups configured
- [ ] Monitoring/logging setup
- [ ] Error tracking (Sentry or similar)
- [ ] Rate limiting configured
- [ ] CDN configured for file delivery
- [ ] Email/SMS service working
- [ ] Push notification service working

---

## 17. Priority Implementation Order

Based on app features:

### Phase 1 (Required for MVP)
1. ✅ User authentication
2. ✅ Document upload & vault
3. ✅ Scanner endpoints (rate, receipt, identify)
4. ✅ Document CRUD operations
5. ✅ Expiry notifications

### Phase 2A (Required for feature parity)
6. 🔄 Document editing (PUT endpoint for documents)
7. 🔄 Expense tracking (CRUD endpoints)
8. ⏳ Load management (CRUD endpoints)
9. ⏳ Advanced file picker (multi-file upload)

### Phase 2B (Post-launch)
10. Analytics endpoints (P&L, reports)
11. Offline data sync
12. Advanced search

---

## 18. API Base URLs

### Staging (Current)
- Base URL: `https://api.staging.integratedtech.ca`
- Auth header: `Authorization: Bearer {token}`
- Content-Type: `application/json`

### Production (Future)
- Base URL: TBD (configure in app deployment)
- Same auth headers

---

## 19. Questions for Backend Team

1. **Database**: What's the planned database? (PostgreSQL, MongoDB, etc.)
2. **Storage**: Where will files be stored? (S3, GCS, Azure, local?)
3. **Notifications**: Which push service? (FCM, APNs, custom?)
4. **OCR**: Which OCR service for scanner? (Google Cloud Vision, AWS Textract, local?)
5. **Scale**: What's the expected user count? (Affects rate limiting, caching)
6. **Monitoring**: Logging service? (ELK, Datadog, CloudWatch?)
7. **Email**: Email service for password resets? (SendGrid, AWS SES?)
8. **Timeline**: When will each endpoint be ready?
9. **Staging Data**: Can you provide sample/test data for QA?
10. **Webhook Support**: Do you need webhooks for real-time events?

---

## 20. Sign-Off Checklist

Before frontend can launch:

- [ ] All endpoints documented and tested
- [ ] Staging environment is stable
- [ ] Sample data provided for testing
- [ ] Authentication flow works end-to-end
- [ ] File uploads working reliably
- [ ] Notifications triggering correctly
- [ ] Error handling is consistent
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] API documentation delivered
- [ ] Rate limiting configured
- [ ] Monitoring/logging setup

---

**Prepared by:** Frontend Development Team  
**For:** Backend Development Team  
**Coordination:** Sync weekly on progress & blockers
