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

---

## Log #5: Document Upload Endpoint Update
**Date:** 2026-06-18  
**Feature:** Document Vault File Uploads & Invoicing Integration  

### Frontend Implementation
The document upload mechanism has transitioned from a JSON form payload to direct file upload handling. The frontend now converts document uploads (including PDF invoices generated using the Invoice Generator tool or captured images) into Base64 data strings for upload.

### Required Backend Changes
1. **API Endpoint Base URL Change:**
   - **Old Endpoint:** `POST /api/driver-mobile/documents`
   - **New Endpoint:** `POST /api/documents`

2. **Payload Schema Update:**
   The backend must accept the new specification payload format (Base64 file data injection):
   - **`docType`**: string (e.g., `"Invoice"`, `"BOL"`, `"License"`, etc.)
   - **`fileName`**: string (e.g., `"Invoice_IV-2948-TX.pdf"`)
   - **`description`**: string (e.g., `"Invoice: #IV-2948-TX • Broker: CH Robinson • Total: $4,200"`)
   - **`fileData`**: string (Data URI scheme with MIME type prefix and base64 string, e.g. `"data:application/pdf;base64,JVBERi..."` or `"data:image/jpeg;base64,...`")

3. **Base64 Processing:**
   - The backend must parse the incoming `fileData` Base64 stream, decode it, and persist it to the secure document vault storage (S3/Cloud Storage).
   - Ensure the server validates and rejects files exceeding size limit constraints or containing unsupported MIME types.

---

## Log #6: Driver Onboarding Invite Redirection to Vault App
**Date:** 2026-06-19  
**Feature:** Redirection of Driver Account Setups from Driver-PWA to Vault App

### Frontend Implementation
The new Vault Mobile App has configured native deep links (Universal Links on iOS and App Links on Android) to capture `/invite/{token}` routes. A custom onboarding registration screen `OnboardingInviteScreen` validates tokens and activates driver accounts directly inside the mobile/web Vault app container.

### Required Backend Changes
1. **Redirect URL Base Environment Variable (`DRIVER_PWA_URL`):**
   - The environment variable name remains `DRIVER_PWA_URL` to prevent breaking legacy API paths or third-party hooks.
   - **Staging value:** Update `DRIVER_PWA_URL` in Staging to `https://vault.staging.integratedtech.ca`.
   - **Production value:** Update `DRIVER_PWA_URL` in Production to `https://vault.integratedtech.ca`.
   - When a dispatcher generates a driver account or manually requests an invite link, the backend must use this updated variable to format the SMS/email onboarding invitation links (e.g. `https://vault.staging.integratedtech.ca/invite/{token}`).

2. **GitHub CI/CD Deployment Workflows:**
   - Default fallbacks for `DRIVER_PWA_URL` have been updated inside `staging-ci.yml` and `production-ci.yml` to use `https://vault.staging.integratedtech.ca` and `https://vault.integratedtech.ca` respectively.
   - If overriding values in GitHub Actions secrets, fleet admins/developers should ensure `DRIVER_PWA_URL_STAGING` and `DRIVER_PWA_URL` secrets point to the new Vault domains.

---

## Log #7: Web Deployment, Hosting & CI/CD
**Date:** 2026-06-21  
**Feature:** Web Hosting & GitHub Actions Deployments  

### Staging & Production Domains
The frontend Expo/React Native Web app is hosted on the EC2 server (`44.197.191.154`) and mapped to:
- **Staging**: `https://vault.staging.integratedtech.ca` (served from `/var/www/vault-app/dist`)
- **Production**: `https://vault.integratedtech.ca` (served from `/var/www/vault-app-prod/dist`)

### Completed Configurations
1. **DNS**: CNAME records for `vault` and `vault.staging` point to the EC2 server.
2. **Nginx Server Blocks**: Configured with Let's Encrypt SSL and HTTP-to-HTTPS redirects at:
   - `/etc/nginx/sites-available/vault-staging`
   - `/etc/nginx/sites-available/vault-prod`
3. **CI/CD Workflow**: [deploy-web.yml](file:///c:/Users/Magic/OneDrive/Documents/Integra%20AI/Vault-Mobile-App/.github/workflows/deploy-web.yml) triggers on:
   - Push to `staging` or `develop` branch (builds staging bundle with staging API variables, deploys to `/var/www/vault-app/dist`).
   - Push to `main` branch (builds production bundle with production API variables, deploys to `/var/www/vault-app-prod/dist`).
4. **Local Keys Verification**: Confirmed that the private key `aminder_key` (ED25519) successfully authenticates with the server when run from our local console.

### Troubleshooting and Action Required for Backend Developer
The automated CI/CD runs (e.g., Run #8) have failed during the deployment phase (`Copy bundle to EC2` or `Deploy and unpack on server`). Please verify:
1. **GitHub Secrets Verification**:
   - Double-check that `EC2_HOST`, `EC2_USER`, `EC2_PORT`, and `EC2_SSH_KEY` are correctly saved in GitHub Repository Settings -> Secrets and variables -> Actions.
   - Make sure `EC2_SSH_KEY` is pasted exactly as the raw private key, including the headers and footers.
2. **Security Groups / AWS Firewall**:
   - Confirm if the AWS Security Group for the EC2 server allows inbound SSH traffic (port 22) from all IPs (`0.0.0.0/0`), as GitHub Actions runner IPs are dynamic. If port 22 access is restricted to specific IP lists, either open it up or configure a security step in the workflow to dynamically whitelist the GitHub runner IP before the connection.
3. **Native SSH vs. Actions**:
   - We modified [deploy-web.yml](file:///c:/Users/Magic/OneDrive/Documents/Integra%20AI/Vault-Mobile-App/.github/workflows/deploy-web.yml) to use native `ssh` and `scp` commands with `-o StrictHostKeyChecking=no` and `-o UserKnownHostsFile=/dev/null` to prevent interactive prompts and bypass older Go-based SSH action key limitations.




