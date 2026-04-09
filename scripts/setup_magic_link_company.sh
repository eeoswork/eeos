#!/usr/bin/env bash
set -euo pipefail

# Magic-link company bootstrap helper
# What this automates:
# 1) Insert/ensure accounts row in remote D1
# 2) Insert/ensure magic_links row in remote D1
# 3) Deploy Cloudflare worker
#
# What this does NOT automate:
# - DNS (must add CNAME in Cloudflare dashboard)
# - Code edits for new host routing/defaults (if not already configured)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx is required but not found." >&2
  exit 1
fi

read -r -p "Subdomain slug (e.g., susco): " SLUG
read -r -p "Company name (e.g., Susco): " COMPANY_NAME
read -r -p "Token ID (8-128 chars, e.g., susco2026a7d4k9m2): " TOKEN_ID
read -r -p "Company ID [default: slug]: " COMPANY_ID
read -r -p "Admin name default (optional): " ADMIN_NAME_DEFAULT
read -r -p "Seed email [default: admin@<slug>.example]: " SEED_EMAIL

SLUG="${SLUG// /}"
SLUG="${SLUG,,}"
COMPANY_ID="${COMPANY_ID:-$SLUG}"
SEED_EMAIL="${SEED_EMAIL:-admin@${SLUG}.example}"

if [[ -z "$SLUG" ]]; then
  echo "Error: slug is required." >&2
  exit 1
fi

if [[ -z "$COMPANY_NAME" ]]; then
  echo "Error: company name is required." >&2
  exit 1
fi

if [[ ! "$TOKEN_ID" =~ ^[A-Za-z0-9_-]{8,128}$ ]]; then
  echo "Error: token must be 8-128 chars using A-Z a-z 0-9 _ -" >&2
  exit 1
fi

HOST="${SLUG}.eeos.work"
MAGIC_ID="magic-${COMPANY_ID}-1"

STATE_JSON=$(printf '{"companyName":"%s","adminName":"%s"}' "$COMPANY_NAME" "$ADMIN_NAME_DEFAULT")

echo
printf 'Using values:\n'
printf '  HOST: %s\n' "$HOST"
printf '  COMPANY_ID: %s\n' "$COMPANY_ID"
printf '  TOKEN_ID: %s\n' "$TOKEN_ID"
printf '  SEED_EMAIL: %s\n' "$SEED_EMAIL"
printf '  ADMIN_NAME_DEFAULT: %s\n' "${ADMIN_NAME_DEFAULT:-<blank>}"
echo

read -r -p "Proceed with D1 writes + deploy? [y/N]: " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

ACCOUNT_SQL=$(cat <<SQL
INSERT OR IGNORE INTO accounts (
  company_id,
  email,
  password_hash,
  company_name,
  admin_name,
  state_blob,
  state_version,
  created_at,
  updated_at
) VALUES (
  '$COMPANY_ID',
  '$SEED_EMAIL',
  'seed:replace-this-after-real-signup',
  '$COMPANY_NAME',
  '$ADMIN_NAME_DEFAULT',
  '$STATE_JSON',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
SQL
)

MAGIC_SQL=$(cat <<SQL
INSERT OR IGNORE INTO magic_links (
  id,
  host,
  token_id,
  company_id,
  company_name_default,
  admin_name_default,
  active,
  expires_at,
  created_at
) VALUES (
  '$MAGIC_ID',
  '$HOST',
  '$TOKEN_ID',
  '$COMPANY_ID',
  '$COMPANY_NAME',
  '$ADMIN_NAME_DEFAULT',
  1,
  NULL,
  CURRENT_TIMESTAMP
);
SQL
)

echo "-> Writing accounts row to remote D1..."
npx wrangler d1 execute eeos --remote --command "$ACCOUNT_SQL"

echo "-> Writing magic link row to remote D1..."
npx wrangler d1 execute eeos --remote --command "$MAGIC_SQL"

echo "-> Deploying worker..."
npm run cf:deploy

echo
echo "Done."
echo "Test URL: https://${HOST}/${TOKEN_ID}"
echo "If you get NXDOMAIN, add DNS CNAME in Cloudflare: ${SLUG} -> eeos.work (proxied)."
