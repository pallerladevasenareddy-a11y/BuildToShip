# DocuSense AI — Deployment Specification (DEPLOYMENT_SPEC.md)

## 1. Hosting Architecture
- **Frontend**: Vercel / Netlify (Static SPA built with Vite)
- **Backend**: Render / Railway / Fly.io (Containerized Node.js Express service)
- **Database, Auth & Storage**: Supabase (PostgreSQL with Row-Level Security, Supabase Auth for Google OAuth, and Private Storage Bucket)

## 2. Environment Variables

### Client Environment Variables (Vercel):
- `VITE_API_BASE_URL`: Base API route (e.g., `http://localhost:5000/api` for local or `https://docusense-server.onrender.com/api` for production)
- `VITE_SUPABASE_URL`: Supabase project URL (`https://<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Supabase anon/publishable public key

> **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, or `JWT_SECRET` in client environment variables. Only public `VITE_*` variables belong in frontend hosting.

### Server Environment Variables (Render):
- `PORT`: Port number (default: `5000`)
- `NODE_ENV`: `development` | `production` | `test`
- `FRONTEND_URL`: CORS origin (e.g., `http://localhost:5173` or `https://<your-vercel-domain>.vercel.app`)
- `GEMINI_API_KEY`: Google AI Studio API Key for `@google/genai`
- `GEMINI_MODEL`: Gemini model identifier (default: `gemini-2.5-flash`)
- `JWT_SECRET`: High-entropy string for session/fallback verification
- `SUPABASE_URL`: Supabase project URL (`https://<project-ref>.supabase.co`)
- `SUPABASE_ANON_KEY`: Supabase public publishable anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase secret service-role key for backend administrative operations
- `SUPABASE_STORAGE_BUCKET`: Storage bucket name (`invoice-documents`)
- `MAX_UPLOAD_SIZE_MB`: Max file upload limit in megabytes (default: `10`)

## 3. Google OAuth & Supabase Configuration

### A. Google Cloud Console:
1. Navigate to **Google Cloud Console > APIs & Services > Credentials**.
2. Configure **OAuth Consent Screen**:
   - User Type: **External**
   - App Name: `DocuSense AI`
   - User Support Email: Your email
   - Developer Contact: Your email
   - Scopes: `openid`, `email`, `profile`
3. Create **OAuth 2.0 Client ID**:
   - Application Type: **Web application**
   - Name: `DocuSense Supabase Auth`
   - Authorized JavaScript origins:
     - `https://<project-ref>.supabase.co`
     - `http://localhost:5173`
     - `https://<your-app>.vercel.app`
   - Authorized redirect URIs:
     - `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copy the generated **Client ID** and **Client Secret**.

### B. Supabase Dashboard:
1. Navigate to **Authentication > Providers > Google**:
   - Toggle **Enable Google provider** to ON.
   - Paste **Client ID** and **Client Secret** from Google Cloud Console.
   - Save changes.
2. Navigate to **Authentication > URL Configuration**:
   - **Site URL**: `http://localhost:5173` (or production Vercel domain `https://<your-app>.vercel.app`)
   - **Redirect URLs** (Add permitted redirect URLs):
     - `http://localhost:5173/auth/callback`
     - `http://localhost:5173`
     - `https://<your-app>.vercel.app/auth/callback`
     - `https://<your-app>.vercel.app`

## 4. Production Verification Checklist
- [ ] Database schema executed in Supabase SQL editor (including `profiles` table with `avatar_url` and Supabase Auth trigger).
- [ ] Google OAuth provider enabled in Supabase with Google Client ID and Secret.
- [ ] Permitted Redirect URLs added to Supabase Authentication URL Configuration.
- [ ] Private bucket `invoice-documents` created in Supabase Storage.
- [ ] Backend deployed on Render with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`.
- [ ] Backend health check `/api/health` passing with both `supabase` and `gemini` configured.
- [ ] Frontend deployed on Vercel with `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- [ ] Google Sign-In completes callback and navigates to the dashboard with profile avatar and scoped data.

