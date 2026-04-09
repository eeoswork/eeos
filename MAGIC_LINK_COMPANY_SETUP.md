# Magic Link Company Setup Runbook (Repeatable)

Use this every time you launch a new company subdomain magic link.

Goal:
- Company link format: https://<slug>.eeos.work/<token>
- Full generic landing flow, scoped to that company

Default behavior (important):
- Magic links now mirror the generic landing page behavior by default.
- Any future generic landing UI/copy change should automatically appear on magic links too.
- Two intentional overrides remain per magic link:
  - Q1 city input can be prefilled via token defaults.
  - Home CTA text is branded as: Build <Company>'s People Plan ->

---

## 0) Fill in launch variables

Replace these values once at the top, then use them in each step.

- SLUG: subdomain before eeos.work (lowercase, no spaces)
  - Example: susco
- COMPANY_NAME: display name
  - Example: Susco
- TOKEN_ID: unique token in URL path (8-128 chars, letters/numbers/_/-)
  - Example: susco2026a7d4k9m2
- COMPANY_ID: internal company key (safe default: same as slug)
  - Example: susco
- ADMIN_NAME_DEFAULT: optional default admin name (can be blank)
  - Example: (blank)
- SEED_EMAIL: placeholder account email for seeded row
  - Example: admin@susco.example

Recommended token generator (macOS):

```bash
openssl rand -hex 8
```

Fast path (automated D1 + deploy):

```bash
./scripts/setup_magic_link_company.sh
```

This script prompts for values, inserts account + magic link rows in remote D1, and runs deploy.
You still must do DNS manually (Step 1), and your codebase must already include host routing/defaults if needed.

---

## 1) Add DNS record (Cloudflare dashboard)

This is required. Without it, you get NXDOMAIN.

1. Cloudflare Dashboard -> eeos.work -> DNS -> Add record
2. Type: CNAME
3. Name: <SLUG>
4. Target: eeos.work
5. Proxy status: Proxied (orange cloud ON)
6. Save

Validation:

```bash
dig +short <SLUG>.eeos.work
```

Expected: non-empty output.

---

## 2) Add Worker routes for the new subdomain

Edit wrangler.toml routes and add both entries:

- <SLUG>.eeos.work/api/*
- <SLUG>.eeos.work/*

Example entries:

```toml
{ pattern = "susco.eeos.work/api/*", zone_name = "eeos.work" },
{ pattern = "susco.eeos.work/*", zone_name = "eeos.work" }
```

---

## 3) Allow static host handling in the Worker

Edit cloudflare/worker.js and add host to MAGIC_LINK_HOSTS set.

Example:

```js
const MAGIC_LINK_HOSTS = new Set([
  "susco.eeos.work",
  "testing.eeos.work"
]);
```

---

## 4) Optional host defaults (recommended)

Edit config.js -> magicLinks.hostDefaults and add:

```js
"susco.eeos.work": {
  companyName: "Susco",
  adminName: ""
}
```

This improves fallback identity defaults if API resolve is unavailable.

---

## 5) Create account + magic link rows in D1 (remote)

You can do this without editing seed files.

Run from repo root:

```bash
npx wrangler d1 execute eeos --remote --command "
INSERT OR IGNORE INTO accounts (
  company_id, email, password_hash, company_name, admin_name, state_blob, state_version, created_at, updated_at
) VALUES (
  '<COMPANY_ID>',
  '<SEED_EMAIL>',
  'seed:replace-this-after-real-signup',
  '<COMPANY_NAME>',
  '<ADMIN_NAME_DEFAULT>',
  '{\"companyName\":\"<COMPANY_NAME>\",\"adminName\":\"<ADMIN_NAME_DEFAULT>\"}',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
"
```

```bash
npx wrangler d1 execute eeos --remote --command "
INSERT OR IGNORE INTO magic_links (
  id, host, token_id, company_id, company_name_default, admin_name_default, active, expires_at, created_at
) VALUES (
  'magic-<COMPANY_ID>-1',
  '<SLUG>.eeos.work',
  '<TOKEN_ID>',
  '<COMPANY_ID>',
  '<COMPANY_NAME>',
  '<ADMIN_NAME_DEFAULT>',
  1,
  NULL,
  CURRENT_TIMESTAMP
);
"
```

---

## 6) Deploy Worker

```bash
npm run cf:deploy
```

---

## 7) Verify resolve API

```bash
curl -s https://api.eeos.work/api/magic-links/resolve \
  -H "content-type: application/json" \
  -d '{"host":"<SLUG>.eeos.work","tokenId":"<TOKEN_ID>"}'
```

Expected:
- ok: true
- workspace.companyNameDefault = your company

---

## 8) Verify live URL

Open:

- https://<SLUG>.eeos.work/<TOKEN_ID>

If it fails:

1. DNS still missing or not propagated (dig is empty)
2. Route missing in wrangler.toml deploy
3. Host missing from MAGIC_LINK_HOSTS
4. D1 row missing or token mismatch

---

## 9) Optional per-link custom behavior

Only if needed (example: custom city prefill, custom header text).

Add by host/token key in app.js constants:

- MAGIC_LINK_SETUP_DEFAULTS
- MAGIC_LINK_PAGE_TITLES
- MAGIC_LINK_AUTH_DEFAULTS

Pattern:

- "<SLUG>.eeos.work/<TOKEN_ID>": { ... }

---

## Quick Checklist

- DNS CNAME added (<SLUG> -> eeos.work, proxied)
- wrangler routes added for host and host/api
- worker MAGIC_LINK_HOSTS includes host
- D1 accounts row exists
- D1 magic_links row exists
- worker deployed
- resolve API returns ok
- live URL loads
