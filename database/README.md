# Database Setup Guide — Supabase PostgreSQL

## 1. Quick Setup in Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create or open your project.
2. In the left navigation, click on **SQL Editor**.
3. Open `database/schema.sql`, copy all contents, paste into the SQL Editor, and click **Run**.
4. (Optional) Run `database/seed.sql` to populate sample data for Arjun Mehta (`demo@docusense.ai` / `DemoPass123!`).

## 2. Storage Bucket Setup
1. In the Supabase Dashboard, click on **Storage**.
2. Click **New Bucket**.
3. Name the bucket exactly: `invoice-documents`.
4. Ensure **Public bucket** is toggled **OFF** (Private bucket).
5. Click **Save bucket**.

## 3. Environment Variables
Obtain your project URL and service role key:
1. Navigate to **Project Settings** -> **API**.
2. Copy `Project URL` -> `SUPABASE_URL`.
3. Copy `service_role` secret key -> `SUPABASE_SERVICE_ROLE_KEY`.

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
SUPABASE_STORAGE_BUCKET=invoice-documents
```
