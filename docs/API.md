# DocuSense AI — API Specification (docs/API.md)

All endpoints operate under the base path `/api`.

## 1. System Health
### `GET /api/health`
Returns system status, environment, and external integration readiness without exposing secrets.
- **Auth**: None
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "DocuSense AI API",
    "version": "1.0.0",
    "environment": "development",
    "timestamp": "2026-10-13T06:00:00.000Z",
    "integrations": {
      "gemini": {
        "configured": true,
        "model": "gemini-2.5-flash"
      },
      "supabase": {
        "configured": true,
        "bucket": "invoice-documents"
      }
    }
  }
  ```

---

## 2. Authentication
### `POST /api/auth/register`
Creates a new tenant user account.
- **Auth**: None
- **Body**:
  ```json
  {
    "fullName": "Arjun Mehta",
    "email": "arjun@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }
  ```
- **Response**: `201 Created` with JWT token and user profile object.

### `POST /api/auth/login`
Authenticates user and returns JWT token & HttpOnly session cookie.
- **Auth**: None
- **Body**:
  ```json
  {
    "email": "demo@docusense.ai",
    "password": "DemoPass123!"
  }
  ```
- **Response**: `200 OK` with JWT token and user profile object.

### `POST /api/auth/logout`
Clears session token cookie.
- **Auth**: None
- **Response**: `200 OK`

### `GET /api/auth/me`
Returns current authenticated tenant profile.
- **Auth**: Required (`Bearer <token>` or cookie)
- **Response**: `200 OK` with user details.

---

## 3. Invoices
### `POST /api/invoices/upload`
Uploads an invoice document (PDF, PNG, JPEG, WebP) up to 10MB, verifies magic bytes, extracts data, and runs deterministic financial validation.
- **Auth**: Required
- **Form Data**:
  - `file`: Binary file
  - `isDemoMode`: `"true"` | `"false"`
  - `scenarioKey`: `"CLEAN"` | `"DUPLICATE"` | `"MISMATCH"` (Optional, for demo mode)
- **Response**: `201 Created` with invoice and validation outcome:
  ```json
  {
    "success": true,
    "data": {
      "invoice": {
        "id": "uuid",
        "supplier_name": "Apex Cloud Solutions Pvt Ltd",
        "invoice_number": "INV-2026-9042",
        "total_amount": 53100.00,
        "validation_status": "Verified",
        "review_status": "Pending"
      },
      "validation": {
        "validation_status": "Verified",
        "checks": [...],
        "findings": [],
        "isClean": true
      }
    }
  }
  ```

### `GET /api/invoices`
Lists paginated invoices scoped to authenticated tenant.
- **Auth**: Required
- **Query Params**: `search`, `status`, `supplier`, `category`, `limit`, `offset`
- **Response**: `200 OK` with invoice array and pagination count.

### `GET /api/invoices/:id`
Retrieves invoice details, line items, open/resolved findings, and immutable audit logs.
- **Auth**: Required
- **Response**: `200 OK`

### `GET /api/invoices/:id/document`
Streams stored invoice file or redirects to private storage signed URL.
- **Auth**: Required
- **Response**: Document stream or `302 Redirect`.

### `PATCH /api/invoices/:id`
Corrects invoice fields, reruns deterministic validation, updates findings, and writes append-only audit log.
- **Auth**: Required
- **Body**: Corrected invoice fields and `correctionNote`.
- **Response**: `200 OK` with updated invoice and re-validation result.

---

## 4. Review Queue
### `GET /api/review`
Fetches all open findings requiring auditor verification.
- **Auth**: Required
- **Query Params**: `status` (default: `OPEN`)
- **Response**: `200 OK` with findings list.

### `POST /api/review/:id`
Executes human review action (Approve, Reject, or Resolve Finding) and records immutable audit log.
- **Auth**: Required
- **Body**:
  ```json
  {
    "action": "APPROVE" | "REJECT" | "RESOLVE_FINDING",
    "findingId": "uuid",
    "note": "Auditor rationale note"
  }
  ```
- **Response**: `200 OK`

---

## 5. Insights
### `GET /api/insights/summary`
Calculates real aggregates derived from persisted database records.
- **Auth**: Required
- **Response**: `200 OK`
  - Total Spend (INR ₹)
  - Duplicate Exposure
  - Review Backlog
  - Top Vendors Breakdown
  - Category Breakdown
  - Monthly Spend Trajectory
  - Automated Recommendations
