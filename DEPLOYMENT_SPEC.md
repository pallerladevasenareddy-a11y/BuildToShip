# DocuSense AI — Deployment Specification (DEPLOYMENT_SPEC.md)

## 1. Hosting Architecture
- **Frontend**: Vercel / Netlify (Static SPA built with Vite)
- **Backend**: Render / Railway / Fly.io (Containerized Node.js Express service)
- **Database & Storage**: Supabase (PostgreSQL with Row-Level Security and Private Storage Bucket)

## 2. Environment Variables
### Server Environment Variables:
- `PORT`: Port number (default: `5000`)
- `NODE_ENV`: `development` | `production` | `test`
- `FRONTEND_URL`: CORS origin (e.g., `http://localhost:5173` or production domain)
- `GEMINI_API_KEY`: Google AI Studio API Key for `@google/genai`
- `GEMINI_MODEL`: Gemini model identifier (default: `gemini-2.5-flash` or `gemini-1.5-flash`)
- `JWT_SECRET`: High-entropy string for HMAC SHA-256 JWT signing
- `SUPABASE_URL`: Supabase project URL (`https://<project>.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase secret service role key for server operations
- `SUPABASE_STORAGE_BUCKET`: Storage bucket name (`invoice-documents`)
- `MAX_UPLOAD_SIZE_MB`: Max file upload limit in megabytes (default: `10`)

### Client Environment Variables:
- `VITE_API_BASE_URL`: Base API route (default: `http://localhost:5000/api`)

## 3. Production Verification Checklist
- [ ] Database schema executed in Supabase SQL editor.
- [ ] Private bucket `invoice-documents` created.
- [ ] Backend deployed and passing `/api/health`.
- [ ] Frontend environment pointing to production backend URL.
- [ ] HTTPS enforced on both client and server domains.
