# DocuSense AI — Intelligent Invoice Auditor

> Secure, AI-powered intelligent document processing (IDP) and invoice auditing SaaS MVP that combines Google Gemini extraction with deterministic financial validation, duplicate collision detection, and human-in-the-loop review.

---

## 1. Project Title
**DocuSense AI — Intelligent Invoice Auditor**

---

## 2. Problem Statement
Organizations lose millions of dollars and countless manual hours to fragmented accounts payable workflows:
- **Duplicate Payments**: Vendors re-submitting previously settled invoices with modified dates or altered headers.
- **Arithmetic Mismatches**: Invoices where stated totals do not add up to line item sums, discounts, and tax components.
- **Data-Entry Errors**: Manual copy-pasting from PDFs into ERP spreadsheets causing miscalculations.
- **Lack of Transparency**: Inability to quickly detect duplicate candidates or trace who approved field modifications.

---

## 3. Solution Description
DocuSense AI provides an end-to-end, audited invoice ingestion pipeline:
1. Ingests PDF, PNG, JPEG, and WebP invoices.
2. Validates file signatures (magic bytes) and calculates cryptographic SHA-256 hashes.
3. Extracts structured headers, line items, and totals using Google Gemini via the official `@google/genai` SDK.
4. Validates extraction structures with Zod schemas.
5. Executes deterministic financial arithmetic (`subtotal - discount + tax + charges = total`) in JavaScript with decimal-safe precision.
6. Evaluates duplicate candidates against tenant history using document hashes and normalized supplier/invoice identifiers.
7. Routes uncertain or discrepancy-flagged records into an interactive Human Review Queue.
8. Enforces append-only immutable audit logging for all corrections, approvals, and rejections.
9. Displays procurement spend insights and duplicate risk exposure derived strictly from persisted records with default INR (₹) representation.

---

## 4. Key Features
- **Prompt-Injection Resilient Gemini Extraction**: Strict system instructions treating documents as untrusted data, validated by Zod schemas.
- **Deterministic Math Engine**: Financial arithmetic is computed deterministically in code—never delegated to an LLM.
- **Duplicate Detection Engine**: Cryptographic document hash match and normalized supplier & invoice number collisions.
- **Human-in-the-Loop Review Queue**: Actionable review interface with side-by-side calculated vs stated total breakdown.
- **Field Corrections & Automatic Re-validation**: Edit fields with mandatory audit rationale, instantly triggering re-validation.
- **Append-Only Audit History**: Database-enforced immutable history recording every upload, edit, approval, and rejection.
- **Database-Backed Insights**: Real procurement analytics (spend by vendor, category breakdown, monthly trends, duplicate exposure).
- **Dual Mode (Live Gemini & Synthetic Benchmark Demo)**: Instant one-click testing of Clean, Duplicate, and Math Mismatch scenarios.

---

## 5. Technology Stack
- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS, Axios, Lucide React, Recharts.
- **Backend**: Node.js (ES Modules), Express.js, Multer, Zod, bcryptjs, jsonwebtoken, helmet, cookie-parser.
- **AI SDK**: Official Google GenAI SDK (`@google/genai` v2.29.0).
- **Database & Storage**: Supabase PostgreSQL with Row Level Security (RLS) & Private Storage Bucket (`invoice-documents`).
- **Testing**: Vitest & Supertest.

---

## 6. Architecture Overview
```
┌────────────────────────────────────────────────────────┐
│             React + Vite Frontend (SPA)                │
│ (Overview, Upload, All Invoices, Review Queue, Insights)│
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (JWT / Cookie)
┌───────────────────────────▼────────────────────────────┐
│              Node.js Express Backend API               │
│  - Multer & Magic Byte Signature Validator             │
│  - Multi-Tenant Authentication & Ownership Middleware  │
│  - Deterministic Financial Validation Engine           │
│  - Duplicate Ingestion & Hash Engine                   │
└──────────────┬────────────────────────────┬────────────┘
               │                            │
┌──────────────▼────────────┐ ┌─────────────▼────────────┐
│   Google Gemini 2.5 Flash │ │   Supabase PostgreSQL    │
│  (@google/genai v2.29.0)  │ │  - Profiles, Invoices    │
│  - Structured Extraction  │ │  - Findings, Line Items  │
│  - Prompt-Injection Guard │ │  - Append-Only Audit Logs│
└───────────────────────────┘ └──────────────────────────┘
```

---

## 7. Folder Structure
```text
BuildToShip/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Layout & UI components (Sidebar, Topbar, StatCard, Badges)
│   │   ├── context/            # AuthContext (JWT, Login, Register, Logout)
│   │   ├── pages/              # 5 Core Views: Overview, Upload, Invoices, Review, Insights
│   │   ├── services/           # Axios API instance with interceptor
│   │   ├── App.jsx             # Route definitions & PrivateRoute guards
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind & midnight navy design tokens
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
├── server/                     # Node.js Express Backend
│   ├── src/
│   │   ├── config/             # Environment validation (Zod) & Supabase client
│   │   ├── controllers/        # Auth, Invoice, Review, Insights controllers
│   │   ├── middleware/         # Auth, Multer, Magic-byte validator, Error handler
│   │   ├── routes/             # Health, Auth, Invoice, Review, Insights routes
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Gemini, Deterministic Validation, Storage, DB
│   │   ├── app.js              # Express app assembly
│   │   └── server.js           # HTTP listener
│   ├── tests/                  # Vitest & Supertest suites
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema.sql              # Supabase DDL schema with RLS & audit trigger
│   ├── seed.sql                # Seed data for demo user and benchmark invoices
│   └── README.md               # Supabase step-by-step setup guide
├── sample-invoices/            # Sample A, B, C fixtures & generated PDFs
│   ├── sample_a_clean.pdf
│   ├── sample_b_duplicate.pdf
│   ├── sample_c_arithmetic_mismatch.pdf
│   └── README.md
├── docs/
│   ├── API.md                  # REST endpoint contracts
│   ├── SECURITY.md             # Security architecture & defenses
│   └── DEMO_SCRIPT.md          # 3-minute evaluation walkthrough
├── MASTER.md                   # Core product requirements & architecture
├── UI_SPEC.md                  # Design system & color tokens
├── TESTING_SPEC.md             # Verification protocols
├── DEPLOYMENT_SPEC.md          # Cloud hosting instructions
├── STRETCH.md                  # Post-MVP roadmap
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 8. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node.js v24.20.0)
- **npm**: v9.0.0 or higher
- Optional: Supabase account for production database; Google AI Studio key for live Gemini OCR.

---

## 9. Local Setup Instructions
Clone or open the repository workspace:
```bash
git clone <repo-url>
cd BuildToShip
```

---

## 10. Dependency Installation
Install all dependencies across root, server, and client:
```bash
npm run install:all
```
*(Alternatively, run `npm install` in root, `cd server && npm install`, and `cd client && npm install`)*

---

## 11. Environment Configuration
Copy `.env.example` templates to `.env`:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Server Configuration (`server/.env`):
```dotenv
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=docusense_dev_jwt_secret_change_in_production_key_2026_xyz
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=invoice-documents
MAX_UPLOAD_SIZE_MB=10
```

### Client Configuration (`client/.env`):
```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 12. Supabase Database Setup
1. In the [Supabase Dashboard](https://supabase.com), navigate to **SQL Editor**.
2. Run `database/schema.sql` to generate tables (`profiles`, `invoices`, `invoice_line_items`, `invoice_findings`, `audit_logs`), indexes, and the immutable audit trigger.
3. (Optional) Run `database/seed.sql` to pre-seed the benchmark demo records.

---

## 13. Private Storage Setup
1. In Supabase Dashboard, open **Storage**.
2. Create a bucket named `invoice-documents`.
3. Set bucket access to **Private** (Public: OFF).

---

## 14. Frontend and Backend Start Commands
Start both backend and frontend concurrently:
```bash
npm run dev
```

Or start them individually in separate terminals:
- **Backend**:
  ```bash
  npm run dev:server
  ```
  *Server starts at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*
- **Frontend**:
  ```bash
  npm run dev:client
  ```
  *Client starts at `http://localhost:5173`*

---

## 15. Test Commands
Execute the automated test suites using Vitest and Supertest:
```bash
npm test
```
To run tests with watch mode:
```bash
npm --prefix server run test:watch
```

---

## 16. Demo-Mode Instructions
DocuSense AI includes built-in synthetic benchmark scenarios:
1. Navigate to `http://localhost:5173/login`.
2. Click **"Auto-fill Pre-seeded Demo Credentials"** to log in as **Arjun Mehta** (`demo@docusense.ai` / `DemoPass123!`).
3. In **Upload Invoices**, toggle **Synthetic Benchmark Demo** and pick:
   - **Sample A: Clean** — Demonstrates clean invoice extraction with verified math.
   - **Sample B: Duplicate** — Demonstrates duplicate collision flagging.
   - **Sample C: Math Mismatch** — Demonstrates arithmetic calculation discrepancy detection.
4. Correct fields directly and watch the engine automatically re-validate!

---

## 17. Gemini Configuration
To enable live AI extraction:
1. Generate an API Key at [Google AI Studio](https://aistudio.google.com).
2. Set `GEMINI_API_KEY=your_key_here` in `server/.env`.
3. Set `GEMINI_MODEL=gemini-2.5-flash` in `server/.env`.
4. Restart the server. Live file uploads will now be processed directly by Gemini 2.5 Flash.

---

## 18. Deployment Instructions
- **Frontend**: Deploy `client` to Vercel or Netlify (`npm run build`, publish directory `dist`).
- **Backend**: Deploy `server` to Render, Railway, or Fly.io (Environment variables: `PORT`, `FRONTEND_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`).
- **Database & Storage**: Managed Supabase PostgreSQL instance.

---

## 19. Security Notes
- Multi-tenant data isolation strictly enforced on every route.
- Magic-byte validation rejects spoofed MIME types.
- Storage files are private; previews use temporary signed URLs.
- Audit logs are protected by a PostgreSQL trigger preventing modification or deletion.
- Prompt injection defense instructions isolate document contents from system prompts.

---

## 20. Known Limitations
- MVP performs single-tenant file ownership; multi-user organizational workspaces with RBAC are tracked in `STRETCH.md`.
- Multi-currency conversion uses invoice stated currencies with INR default aggregate display; live foreign exchange API caching is tracked in `STRETCH.md`.
