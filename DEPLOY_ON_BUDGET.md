# MediBrief Low-Cost Production Launch Guide

This guide is for a small-scale launch with minimal recurring cost.

## Recommended stack

- Frontend hosting: Vercel Hobby
- Backend/auth/database/functions: Supabase free tier or lowest paid tier when needed
- Domain: a single low-cost custom domain
- Monitoring: optional in phase 1, add later if budget allows

## Before you deploy

1. Buy or choose your domain.
2. Decide your public support email.
3. Make sure all Supabase migrations are applied.
4. Make sure your edge function secrets are set.
5. Confirm Google OAuth redirect URLs if you use Google login.

## Environment variables

Set these in Vercel for Production and Preview:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SITE_URL=https://your-domain.com
VITE_SUPPORT_EMAIL=support@your-domain.com
```

Set these in Supabase secrets:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BREVO_API_KEY=your-email-provider-key
RESEND_API_KEY=your-resend-key-if-used
GOOGLE_GEMINI_API_KEY=your-ai-key
MEDICATION_REMINDER_CRON_SECRET=your-long-random-secret
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=...
```

## Vercel deployment

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Use the default Vite build settings.
4. Add the environment variables above.
5. Attach your custom domain.

`vercel.json` is already included for SPA rewrites and basic security headers.

## Supabase production setup

1. Set the Auth Site URL to your production domain.
2. Add redirect URLs for:
   - production domain
   - preview domain
   - password reset route
3. Deploy all edge functions.
4. Add your secrets in Supabase.
5. Apply all migrations with `supabase db push`.

## Auth URLs to verify

At minimum, verify these work on the deployed domain:

- `/login`
- `/signup`
- `/reset-password`
- `/update-password`
- Google sign-in callback

## Reminder scheduler

If you want medication reminders in production:

1. Schedule the `send-medication-reminders` function.
2. Send the header `x-reminder-cron-secret`.
3. Use the same value as `MEDICATION_REMINDER_CRON_SECRET`.

Without this, scheduled reminder delivery will be rejected.

## Launch checklist

- Home page loads on your real domain
- Signup and login work
- Password reset works
- Google OAuth works if enabled
- Symptom analysis works
- Report analysis works
- Chatbot works
- Admin panel works
- Privacy, terms, disclaimer, and contact pages are reachable
- Footer links work
- Support email is configured
- Edge function secrets are present
- Database policies and migrations are applied

## Cost-saving advice

- Start on Vercel Hobby and Supabase free tier
- Avoid heavy background jobs until real usage appears
- Keep analytics optional in phase 1
- Add paid monitoring only after first public users
- Upgrade Supabase only when storage, bandwidth, or auth usage requires it

## Not included in this repo-only launch

These still need manual dashboard setup outside the codebase:

- domain purchase and DNS
- Vercel project creation
- Supabase Auth redirect URLs
- edge function secrets
- scheduled reminder trigger
- email provider verification
