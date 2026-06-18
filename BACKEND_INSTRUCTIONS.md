# Backend Developer Integration Instructions (System Memory)

This document is a living log of backend requirements for new features added to the Integra Vault Mobile App. **Any time a new frontend feature is introduced, update this file with database schema, API integration, and payload requirements for the backend team.**

---

## Log #1: Load Status Redesign & History Screen Transitions
**Date:** 2026-06-15  
**Feature:** Active & History Load Status Selection  

### Frontend Implementation
Drivers can now manage and change statuses of loads from both the **Active** tab (via `MANAGE LOAD` button) and the **History** tab (via `ACTIONS -> Update Status` menu item). This allows drivers to manually update status metrics and log gate times for historical records.

### Required Backend Changes
1. **Load Status Field:** The database schema for `Load` status must support the following 9 granular enum values:
   - `Accepted`
   - `En Route to Pick-up`
   - `Loaded`
   - `En Route to Delivery`
   - `At Delivery`
   - `Delivered`
   - `Invoiced`
   - `Payment Overdue`
   - `Paid`
   
2. **API Endpoint (`PUT /api/driver-mobile/loads/:id`):**
   - Ensure the server validates that incoming `status` requests match one of the 9 values listed above.
   - Legacy statuses (`pending`, `in-progress`, `completed`, `cancelled`) should map gracefully inside the DB layer or return compatibility wrappers.
   - **Gate Times Logging:** When a driver changes the load status, the app automatically stamps the device's current date and time into the respective gate log fields (e.g. `En Route to Pick-up` check-in, `Loaded` check-out, `At Delivery` check-in, `Delivered` check-out). The backend should accept these timestamps alongside status updates and store them (e.g., in a `gate_times` table or appended to notes).

---

## Log #2: Dynamic Line Items (Invoice Generator)
**Date:** 2026-06-15  
**Feature:** Invoice Generator Under Tools  

### Frontend Implementation
Drivers can add, delete, and edit dynamic invoice line items (description and amount) using the Invoice Generator tool. Generated invoices can be saved directly to the Doc Vault as document records.

### Required Backend Changes
1. **Document Storage (`POST /api/documents`):**
   - When the user generates and saves an invoice, the client saves it as a `docType: "Invoice"`.
   - The payload format includes a composite description string containing the line items (e.g. `description: "Invoice: L-94029-TX • Broker: CH Robinson • Freight / Base Rate: $3,700 • Fuel Surcharge: $500 • Total: $4,200"`).
   - Ensure the database supports storing this descriptive text and indexable metadata fields.

---

## Log #3: Load Response Transformer
**Date:** 2026-06-15  
**Feature:** TMS Load Mapping & Schema Compliance  

### Frontend Implementation
All load responses must use exact matching properties and mapped status types to ensure they display properly in the mobile and web load boards.

### Required Backend Changes
1. **Applied Endpoints:**
   - `GET /api/driver-mobile/my-loads`
   - `GET /api/driver-mobile/my-loads/history`
   - `POST /api/driver-mobile/my-loads`
   - `PATCH /api/driver-mobile/my-loads/{id}`

2. **Field Mapping Compliance Table:**
   - **`id`**: string
   - **`startLocation`**: string
   - **`endLocation`**: string
   - **`date`**: string (`YYYY-MM-DD`)
   - **`rateAmount`**: number
   - **`carrier`**: string
   - **`status`**: string (mapped as below)
   - **`rateConfirmationId`**: string OR null (must return null if missing, never estimated values)
   - **`expenseCount`**: number (must return 0 if missing)
   - **`expenseIds`**: array (must return `[]` if missing)

3. **Status Mapping Transformations:**
   The backend must transform core system statuses into frontend-compliant categories:
   - `upcoming` → `pending`
   - `in_transit` → `in-progress`
   - `delivered` → `completed`
   - `invoiced` → `completed`
   - `cancelled` → `cancelled`

---

## Log #4: Home Screen Performance Metrics Summary
**Date:** 2026-06-16  
**Feature:** Fleet Optimization & Driver Dashboard Stats  

### Frontend Implementation
The home screen bento stats dashboard has been expanded to display 7 core KPIs for the fleet driver: Active Loads, Completed Loads, RPM Average, Fuel Consumption, Total Miles, Loaded Miles, and Empty Miles.

### Required Backend Changes
1. **API Endpoint (`GET /api/driver-mobile/analytics/summary`):**
   - Provide a new analytics summary endpoint returning aggregate metrics for the logged-in driver.
   
2. **Response Payload Format (JSON):**
   ```json
   {
     "activeLoadsCount": 8,
     "completedLoadsCount": 12,
     "rpmAverage": 3.22,
     "fuelConsumptionMpg": 6.2,
     "totalMiles": 14820,
     "loadedMiles": 12400,
     "emptyMiles": 2420
   }
   ```

