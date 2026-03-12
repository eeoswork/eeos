# Jolly HR — Culture OS Landing

Single static landing page that supports:
- Generic inbound mode at /index.html
- Magic-link personalization mode at revelrylabs.eeos.work/<randomized_id>
- Backward-compatible query mode at /index.html?company=...&admin=...&token=...

## Run locally

Option 1: VS Code Live Server
1. Open the project folder in VS Code.
2. Right-click index.html and choose Open with Live Server.

Option 2: Python static server
1. In this folder run:
   python3 -m http.server 5173
2. Open:
   http://localhost:5173/index.html

## Cloudflare API setup

The app now expects Cloudflare-backed API endpoints under `/api`.

Beginner walkthrough: `CLOUDFLARE_SETUP.md`

1. Install dependencies:
   npm install
2. Create D1 database in Cloudflare and copy the database id.
3. Update `wrangler.toml` with your real `database_id`.
4. Apply schema:
   npm run cf:d1:apply
5. Seed launch data (Revelry Labs + magic link + events):
   npm run cf:d1:seed
6. Run worker locally:
   npm run cf:dev
7. Deploy worker:
   npm run cf:deploy

### Implemented API endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/state`
- `POST /api/state`
- `POST /api/magic-links/resolve`
- `POST /api/onboarding/migrate-draft`
- `POST /api/recommendations/generate`

For any unrecognized `/api/*` path, the worker proxies requests to the existing poll backend (`https://esos-polls.ajolly2.workers.dev/api`) so existing poll/RSVP flows continue to work.

## Magic link examples

Primary format (production)
https://revelrylabs.eeos.work/abc123xyz

Launch seed link (current seed.sql)
https://revelrylabs.eeos.work/rlabs2026a1b2c3d4

Testing clone link (isolated workspace)
https://testing.eeos.work/rlabs2026testa1b2c3d4

Use your local host and port, then append query params.

Example 1
http://localhost:5173/index.html?company=Acme%20Corp&admin=Sarah%20Chen&token=abc123

Example 2
http://localhost:5173/index.html?company=Northwind&admin=Alex%20Lopez

Local production-like testing profile (same current Revelry stage defaults)
http://localhost:5173/index.html?magicProfile=revelry-test

Local testing profile + clear local testing state before load
http://localhost:5173/index.html?magicProfile=revelry-test&resetTestingData=1

## Testing Workspace Reset

In-app option:
- In the test profile context, use the `Reset Test Data` button in the left sidebar (next to `Edit`).
- This always clears local testing data.
- If you are signed in to the testing workspace account, it also resets backend testing state.

Reset only the isolated Revelry testing workspace data in D1:

```bash
npm run cf:d1:reset:revelry-test
```

Local D1 equivalent:

```bash
npm run cf:d1:reset:revelry-test:local
```

This reset does not touch production Revelry data.

## What to verify

1. Generic mode:
- Open /index.html
- Enter Company and Admin
- Click Save
- Refresh page
- Values remain from localStorage

2. Magic-link mode:
- Open with company/admin query params
- Inputs prefill from URL
- Preview shows Personalized badge and Magic Link mode
- Click Edit to unlock inputs
- Save updated values

3. Priority behavior:
- If URL includes company/admin, URL values are applied on load
- If URL does not include them, localStorage values are used

4. Copy link behavior:
- Click Copy personalized link
- App copies current URL with company, admin, and token
- If token is empty, app generates one before copying

## Backend stubs

The following stubs are in app.js and currently only log payloads:
- upsertProspectWorkspace({ workspaceId, company, admin, token })
- linkEmailToWorkspace({ workspaceId, email })

upsertProspectWorkspace is called on Save.
