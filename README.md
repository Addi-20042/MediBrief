# Health Compass AI

Health Compass AI is a full-stack medical assistant web app that helps users:
- analyze symptoms with AI,
- analyze pasted/uploaded medical report text,
- chat with a medical AI assistant,
- track daily health metrics and medications,
- save and review analysis history.

The app includes authentication, protected user data, Supabase-backed PostgreSQL tables, and Supabase Edge Functions for AI workflows.

## Languages and Tech Stack

### Languages
- TypeScript (frontend and edge functions)
- SQL (database migrations)
- CSS (Tailwind utilities and custom styling)

### Frontend
- React 18 + Vite
- React Router
- TanStack Query
- Tailwind CSS + shadcn/ui (Radix UI)

### Backend / Platform
- Supabase (Auth, Postgres, Edge Functions)
- Supabase JS client (`@supabase/supabase-js`)
- Lovable AI Gateway (Gemini model via edge functions)
- Optional email sending with Resend (`send-report-email` function)

## Main Features

- Symptom analysis (`/symptoms`) with structured possible conditions and urgency.
- Medical report analysis (`/upload`) from pasted text or uploaded files.
- Streaming health chatbot (`/chatbot`).
- History of saved analyses (`/history`).
- Health dashboard (`/dashboard`) with summary cards and recent activity.
- Health tracking (`/health-tracking`) for daily metrics and medication reminders/logs.
- Learning section (`/learn`) with searchable disease library.
- Emergency and first-aid quick-access pages.

## Project Structure

```text
.
|-- src/                      # React frontend
|   |-- pages/                # Route pages
|   |-- components/           # UI and layout components
|   |-- contexts/             # Auth context
|   `-- integrations/
|       `-- supabase/         # Supabase client + generated DB types
|-- supabase/
|   |-- migrations/           # SQL schema migrations
|   `-- functions/            # Edge functions (AI + email)
`-- package.json
```

## Prerequisites

### System Requirements
- **Node.js** 18+ (recommended 20.x or higher)
- **npm** or **bun** (bun.lockb is present - bun is recommended)
- **Git** (for version control)

### Accounts & Services Required
- **Supabase Account** (free tier available at https://supabase.com)
- **Lovable API Key** (for AI functionality via Gemini model)
- *(Optional)* **Resend API Key** (for email sending feature)

## Complete Setup and Run Guide

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd health-compass-ai

# Install dependencies using npm
npm install

# OR install using bun (recommended)
bun install
```

### Step 2: Configure Supabase Backend

#### Option A: Use Existing Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use existing one
3. Navigate to **Project Settings** -> **API**
4. Copy the following values:
   - **Project URL** (VITE_SUPABASE_URL)
   - **Anon Public Key** (VITE_SUPABASE_PUBLISHABLE_KEY)

#### Option B: Run Supabase Locally (Advanced)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Initialize local Supabase (if not already done)
supabase init

# Start local Supabase instance
supabase start

# This starts:
# - PostgreSQL database (localhost:54322)
# - Vector DB (localhost:54323)
# - Auth (localhost:54321)
# - API Gateway (localhost:54321)
```

### Step 3: Setup Environment Variables

Create `.env.local` file in the project root with:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

# API Gateway Configuration (if using local backend)
# VITE_API_URL=http://localhost:54321

# Optional: Lovable gateway setup
# VITE_LOVABLE_API_URL=...
```

**Where to find these values:**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Click **Settings** -> **API**
- Copy the **Project URL** and **Anon Public Key**

### Step 4: Apply Database Migrations

The database schema is defined in `supabase/migrations/`. Apply migrations with:

#### Using Supabase Cloud:

```bash
# Link to your remote Supabase project
supabase link --project-id your-project-id

# Push migrations to remote database
supabase db push
```

#### Using Local Supabase:

```bash
# After 'supabase start', the migrations apply automatically
# Or manually reset the database:
supabase db reset
```

**What gets created:**
- `profiles` - User profile data
- `predictions` - Symptom/report analysis results
- `chat_history` - Chat session content
- `health_metrics` - Daily health tracking data
- `medication_reminders` - Medication schedules
- `medication_logs` - Medication usage history

### Step 5: Configure Supabase Edge Functions Secrets

Edge functions require API keys to work. Set these in Supabase Dashboard:

1. Go to **Project Settings** -> **Secrets**
2. Add the following secrets:

```
LOVABLE_API_KEY = your-lovable-api-key
RESEND_API_KEY = your-resend-api-key (optional)
SUPABASE_URL = your-supabase-project-url
SUPABASE_ANON_KEY = your-supabase-anon-key
```

**Get API Keys:**
- **Lovable API Key**: Contact Lovable team or check dashboard
- **Resend API Key**: [Resend Dashboard](https://resend.com) (free tier available)
- **Supabase credentials**: From Settings -> API (same as Step 3)

### Step 6: Deploy Edge Functions

```bash
# Link to your Supabase project (if not already linked)
supabase link --project-id your-project-id

# Deploy all edge functions
supabase functions deploy

# Deploy specific function
supabase functions deploy analyze-symptoms
supabase functions deploy analyze-report
supabase functions deploy chat
supabase functions deploy send-report-email
```

**Functions deployed:**
- `analyze-symptoms` - AI symptom analysis
- `analyze-report` - Medical report analysis
- `chat` - Streaming chatbot
- `send-report-email` - Email sending (uses Resend)

### Step 7: Run Frontend Development Server

```bash
# Using npm
npm run dev

# Using bun
bun run dev
```

The application will start at:
- **URL**: `http://localhost:5173` (or shown in terminal)
- **Frontend port**: 5173 by default unless changed by Vite
- **Hot reload**: Automatically enabled

### Step 8: Access the Application

Open your browser and navigate to `http://localhost:5173`

**Test the application:**
1. Sign up with email/password
2. Navigate to **Symptoms** page to test AI analysis
3. Try **Upload Report** to analyze medical documents
4. Visit **Chatbot** to test streaming chat
5. Use **Health Tracking** to log metrics

## Available npm Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:5173)

# Production
npm run build            # Build for production
npm run build:dev        # Build with dev settings
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint checks

# Testing
npm run test             # Run tests once with Vitest
npm run test:watch       # Run Vitest in watch mode

# Database (if using Supabase CLI)
supabase db push         # Push migrations
supabase db reset        # Reset database
supabase functions deploy  # Deploy edge functions
```

## Production Deployment

For a low-cost public launch, use:

- Vercel Hobby for the frontend
- Supabase free tier or the lowest paid tier when needed
- A single custom domain

The detailed launch checklist lives in [DEPLOY_ON_BUDGET.md](./DEPLOY_ON_BUDGET.md).

### Minimum Production Environment Variables

Frontend:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SITE_URL=https://your-domain.com
VITE_SUPPORT_EMAIL=support@your-domain.com
```

Supabase secrets:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_GEMINI_API_KEY=your-ai-key
MEDICATION_REMINDER_CRON_SECRET=your-long-random-secret
```

Add email and SMS provider secrets only if you plan to use those features in production.

### Production Checklist

1. Apply database migrations with `supabase db push`
2. Deploy edge functions with `supabase functions deploy`
3. Set Vercel environment variables
4. Set Supabase Auth Site URL and redirect URLs
5. Verify login, signup, password reset, symptom analysis, report analysis, chatbot, admin, and reminder flows

### Important Manual Steps Outside This Repo

- create the Vercel project
- attach your domain and DNS
- add Supabase dashboard secrets
- configure Google OAuth redirect URLs if you use Google login
- configure the scheduled trigger for medication reminders

## Troubleshooting & Common Issues

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -r node_modules package-lock.json

# Reinstall
npm install
```

### Issue: `.env.local` variables not loading

**Solution:**
1. Ensure `.env.local` is in the project root (same level as `package.json`)
2. Variables must start with `VITE_` to be accessible in frontend
3. Restart the dev server after creating/modifying `.env.local`

```bash
npm run dev
```

### Issue: "Supabase connection failed" or "Unauthorized" errors

**Solution:**
1. Verify `.env.local` has correct values (no extra spaces or quotes)
2. Check if Supabase project is active in dashboard
3. Ensure you're using the correct region's URL
4. Verify network connectivity to Supabase
5. Try logging out and back in

```bash
# Test Supabase connectivity with CLI
supabase status
```

### Issue: Edge Functions return 404 or errors

**Solution:**
```bash
# Check if functions are deployed
supabase functions list

# Redeploy functions
supabase functions deploy

# Check function logs
supabase functions list --verbose
```

### Issue: Database migrations fail

**Solution:**
```bash
# Reset database (local only - data will be lost)
supabase db reset

# For remote: manually run migrations from Supabase dashboard
# SQL Editor -> Click migration file -> Edit SQL -> Run
```

### Issue: Port 5173 already in use

**Solution:**
```bash
# Kill process on port 5173
# Windows (PowerShell):
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or specify different port
npm run dev -- --port 3000
```

### Issue: "Missing LOVABLE_API_KEY" in Edge Functions

**Solution:**
1. Go to Supabase Dashboard -> Project Settings -> Secrets
2. Add `LOVABLE_API_KEY` with your API key
3. Redeploy functions:
   ```bash
   supabase functions deploy
   ```

## Quick Start (Minimal Setup)

If you only want to run the frontend locally with cloud Supabase:

```bash
# 1. Install dependencies
npm install

# 2. Get Supabase credentials from https://app.supabase.com
# Create .env.local with:
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_key

# 3. Start development
npm run dev

# 4. Open http://localhost:5173
```

## Full Local Development Stack

If you want everything running locally:

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Start local Supabase
supabase start

# 3. Run migrations
supabase db reset

# 4. In new terminal, start frontend
npm install
npm run dev

# 5. Access at http://localhost:5173
# Database: postgresql://postgres:postgres@localhost:54322/postgres
```

## Database (Supabase Postgres)

Database schema is managed through SQL migrations in `supabase/migrations/`.

### Tables
- `profiles`: user profile data linked to `auth.users`
- `predictions`: stored outputs for symptom/report analyses
- `chat_history`: user chat session content
- `health_metrics`: daily health values (weight, BP, HR, sleep, water, steps, mood, notes)
- `medication_reminders`: medication schedule/reminder settings
- `medication_logs`: taken/skipped logs linked to reminders

### Security
- Row Level Security (RLS) is enabled on user tables.
- Policies restrict reads/writes to each authenticated user's own rows.
- Trigger creates profile automatically when a new auth user is created.

### Applying Migrations

If you use Supabase CLI:

```bash
supabase db push
```

or run reset for local dev:

```bash
supabase db reset
```

## Supabase Edge Functions

Implemented functions (in `supabase/functions/`):
- `analyze-symptoms`
- `analyze-report`
- `chat`
- `send-report-email`

### Required Function Secrets

Set in Supabase (project secrets):

- `LOVABLE_API_KEY` (required for AI functions)
- `RESEND_API_KEY` (optional, required only to actually send emails)

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are used in functions for token verification.

## Notes and Disclaimer

- This project provides educational health insights, not medical diagnosis.
- Always consult qualified healthcare professionals for clinical decisions.

## System Diagrams

- Full diagrams are available at `docs/system-diagrams.md`:
  - ERD
  - DFD Level 0 and Level 1
  - Class, Use Case, Activity, Sequence, Collaboration, State Chart, Package, and Deployment diagrams
