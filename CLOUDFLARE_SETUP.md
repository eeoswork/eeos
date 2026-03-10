# Cloudflare Setup Guide (Beginner-Friendly)

This guide assumes you have never used Cloudflare before.

## 1. Create a Cloudflare account

1. Go to https://dash.cloudflare.com/sign-up.
2. Create an account and verify your email.
3. Log in to the Cloudflare dashboard.

## 2. Add your domain (`eeos.work`) to Cloudflare

1. In dashboard, click `Add a domain`.
2. Enter `eeos.work`.
3. Pick a plan (Free is fine for now).
4. Cloudflare will show current DNS records it found.
5. Continue to nameserver update.
6. Go to your domain registrar (where you bought `eeos.work`).
7. Replace existing nameservers with the two Cloudflare nameservers shown.
8. Wait until Cloudflare dashboard shows the zone as `Active`.

## 3. Create the D1 database

1. In Cloudflare dashboard, open `Workers & Pages`.
2. Go to `D1 SQL Database`.
3. Click `Create database`.
4. Name it `eeos`.
5. After creation, open the database details page.
6. Copy the `Database ID`.
7. If needed from terminal, you can also create/list with:

```bash
npx wrangler d1 create eeos
npx wrangler d1 list
```

## 4. Configure the project locally

1. Open `wrangler.toml`.
2. Replace `REPLACE_WITH_D1_DATABASE_ID` with your real D1 database ID.
3. Optional: if you need browser testing from a different origin, add in `wrangler.toml` under `[vars]`:
   `CORS_ALLOW_ORIGIN = "https://eeos.work,https://revelrylabs.eeos.work,http://localhost:5173"`
4. Save the file before running any deploy commands.

## 5. Install dependencies

Run in terminal from project root:

```bash
npm install
```

## 6. Create tables and seed launch data

1. Apply schema:

```bash
npm run cf:d1:apply
```

2. Seed launch data:

```bash
npm run cf:d1:seed
```

This creates:
- required tables
- launch event catalog
- Revelry Labs magic link row

These scripts target the remote D1 database by default.
If you explicitly want local D1 only, run:

```bash
npm run cf:d1:apply:local
npm run cf:d1:seed:local
```

## 7. Authenticate Wrangler CLI

Run:

```bash
npx wrangler login
```

A browser window opens. Approve access to your Cloudflare account.

## 8. Run the Worker locally

Run:

```bash
npm run cf:dev
```

Check health endpoint in browser:
- http://127.0.0.1:8787/api/health

Expected response:
- `{ "ok": true, "data": { "status": "ok", ... } }`

## 9. Deploy Worker to Cloudflare

Run:

```bash
npm run cf:deploy
```

After deploy, Wrangler outputs a workers.dev URL.

## 10. Add Worker routes for your real domains

1. In Cloudflare dashboard: `Workers & Pages` -> your worker -> `Settings` -> `Triggers`.
2. Add route: `eeos.work/api/*`.
3. Add route: `revelrylabs.eeos.work/api/*`.
4. Save triggers.

These routes send API traffic to your worker on both hosts.

## 11. Create DNS for subdomain

1. Go to `DNS` for `eeos.work`.
2. Add record:
   - Type: `CNAME`
   - Name: `revelrylabs`
   - Target: `eeos.work` (or your apex target)
   - Proxy status: `Proxied` (orange cloud ON)
3. Save.

## 12. Confirm app config

Open `config.js` and ensure:

- `apiBaseUrl` points to your API root (recommended: `https://eeos.work/api` in production).
- `magicLinks.hostDefaults` contains `revelrylabs.eeos.work` with company defaults.

## 13. Test full flow

1. Open generic landing:
- `https://eeos.work`

2. Open Revelry magic link:
- `https://revelrylabs.eeos.work/rlabs2026a1b2c3d4`

3. Verify:
- company/admin prefill appears (editable)
- complete setup before signup
- sign up creates account and migrates draft
- recommendations are generated and shown

## 14. Operations checklist after launch

- Rotate/disable old magic links by updating `magic_links.active` or `expires_at`.
- Monitor worker logs in Cloudflare dashboard for API errors.
- Back up D1 periodically.
