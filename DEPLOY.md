# Deploying Crewo (Vercel + Neon)

Crewo is a single Next.js app. Production needs a hosted Postgres (Neon) and a few env vars.
You run these steps — Claude never deploys or commits for you.

## 1. Database — Neon (free)
1. Create a project at https://neon.tech and copy the **pooled** connection string.
2. Apply the schema to it (from your machine, with that URL):
   ```bash
   DATABASE_URL="<neon-url>" npx prisma migrate deploy
   ```
   (Optional) seed demo data: `DATABASE_URL="<neon-url>" npm run db:seed`

## 2. GitHub OAuth app
1. https://github.com/settings/developers → New OAuth App.
2. Homepage URL: `https://<your-app>.vercel.app`
   Authorization callback URL: `https://<your-app>.vercel.app/api/auth/callback/github`
3. Copy the Client ID and generate a Client Secret.

## 3. Resend (email, optional)
1. https://resend.com → API key. Verify a sending domain, or use `onboarding@resend.dev` for tests.

## 4. Vercel
1. Push the repo to GitHub, import it at https://vercel.com/new.
2. Set **Environment Variables** (Production):
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Neon pooled URL |
   | `AUTH_SECRET` | `npx auth secret` output |
   | `APP_URL` | `https://<your-app>.vercel.app` |
   | `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | from step 2 |
   | `RESEND_API_KEY` / `EMAIL_FROM` | from step 3 (optional) |
   | `ALLOWED_EMAIL_DOMAINS` | e.g. `college.edu` to gate to your campus (optional) |
   | `GITHUB_TOKEN` | optional, raises enrichment rate limit |
3. Deploy. Prisma Client generates on build (`postinstall`/`prisma generate` runs via the build).

## Notes
- The dev login (seeded-user picker) is **disabled in production** automatically; GitHub OAuth is used.
- In production with no `ALLOWED_EMAIL_DOMAINS`, anyone can sign in. Set it to lock to a campus.
- North-star metrics are at `/stats`.
