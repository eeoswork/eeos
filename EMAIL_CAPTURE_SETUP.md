wrangler --version# Email Capture System Setup Guide

## Overview

The email capture system has been integrated into your EEOS landing page. It stores lead emails in Cloudflare D1 and can send you notifications via Resend.

## Current Status

✅ **Completed:**
- D1 database schema with `email_captures` table
- Cloudflare Workers handler function at `POST /api/eeos-email-capture`
- Frontend form with proper error handling and loading states
- Landing page integration

## Setup Steps

### Step 1: Run Database Migration

Run this SQL in your Cloudflare D1 dashboard to create the `email_captures` table:

```sql
CREATE TABLE IF NOT EXISTS email_captures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'landing_page',
  event_id TEXT,
  event_name TEXT,
  capture_reason TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_created_at ON email_captures(created_at);
CREATE INDEX IF NOT EXISTS idx_email_captures_event_id ON email_captures(event_id);
```

**How to run:**
1. Go to Cloudflare Dashboard → Workers & Pages → D1
2. Select your `eeos` database
3. Click "Console" tab
4. Paste the SQL above and execute

### Step 2: Environment Variables (Optional - For Email Notifications)

If you want to receive email notifications when someone signs up, add these to your Cloudflare Pages/Workers environment:

**In `wrangler.toml`:**
```toml
[env.production]
vars = { RESEND_API_KEY = "re_...", NOTIFY_EMAIL = "your-email@example.com", FROM_EMAIL = "no-reply@eeos.work" }
```

Or add them in Cloudflare Dashboard:
- Settings → Environment variables
- Add for both "Production" and "Preview"

**Required Variables:**
- `RESEND_API_KEY`: Your Resend API key (get from https://resend.com)
- `NOTIFY_EMAIL`: Your email address to receive notifications
- `FROM_EMAIL`: Sender email (e.g., `no-reply@eeos.work`)

### Step 3: Setup Resend (Optional)

If you want email notifications:

1. Create account at https://resend.com
2. Add your domain (`eeos.work`) and verify DNS records
3. Create an API key
4. Add the key to environment variables (Step 2)

## How It Works

### Frontend Flow
1. User fills email in the landing page form
2. Clicks "Send me next week's event"
3. Button shows "Sending..." state
4. Form POSTs to `/api/eeos-email-capture` with:
   - `email` (required)
   - `source` (default: "eeos_landing_page")
   - `event_id` (default: "workspace-show-and-tell")
   - `event_name` (default: "Workspace Show & Tell")
   - `capture_reason` (default: "next_week_event")

### Backend Flow
1. Validates email format
2. Stores in D1 `email_captures` table
3. (Optional) Sends notification email via Resend API
4. Returns `{ ok: true }` on success

### Error Handling
- Invalid email: Shows "Enter a valid email."
- Server error: Shows "Something went wrong. Please try again."
- Button reverts to normal state on error (allows retry)

## Testing

### Test 1: Invalid Email
```
Input: "not-an-email"
Expected: "Enter a valid email." error, form stays visible
```

### Test 2: Valid Email (No Resend)
```
Input: "user@example.com"
Expected: 
- Button shows "Sending..."
- Form hides, success message shows
- Record appears in D1
```

### Test 3: Valid Email (With Resend)
```
Input: "user@example.com"
Expected:
- All of Test 2
- You receive email notification at NOTIFY_EMAIL
```

## Database Queries

### View all captures
```sql
SELECT * FROM email_captures ORDER BY created_at DESC LIMIT 50;
```

### View today's captures
```sql
SELECT * FROM email_captures 
WHERE created_at >= datetime('now', 'start of day')
ORDER BY created_at DESC;
```

### Deduplicate (get unique emails)
```sql
SELECT DISTINCT email, COUNT(*) as count 
FROM email_captures 
GROUP BY email 
ORDER BY count DESC;
```

## Deployment

1. Commit changes:
   ```bash
   git add cloudflare/worker.js cloudflare/schema.sql landing-page.html
   git commit -m "Add email capture system"
   ```

2. Deploy to Cloudflare:
   ```bash
   npm run deploy
   # or
   wrangler deploy
   ```

3. Verify route is live:
   ```bash
   curl -X POST https://api.eeos.work/api/eeos-email-capture \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

   Expected response:
   ```json
   { "ok": true, "data": {} }
   ```

## Troubleshooting

### Email notification not sending
- Check `RESEND_API_KEY` is valid and active
- Verify `FROM_EMAIL` domain is verified in Resend
- Check Cloudflare worker logs for API errors

### Database errors
- Confirm D1 database has `email_captures` table
- Verify `DB` binding is configured in wrangler.toml
- Check D1 database ID matches your project

### Form not submitting
- Check browser Network tab for `/api/eeos-email-capture` response
- Verify response is `{ "ok": true }`
- Check browser Console for error messages

## API Response Format

### Success (200)
```json
{ "ok": true, "data": {} }
```

### Error (400/500)
```json
{ "ok": false, "error": { "code": "INVALID_EMAIL", "message": "Enter a valid email." } }
```

## Next Steps

Optional enhancements:
- Add email frequency preferences
- Create admin dashboard to view leads
- Add lead scoring
- Integrate with your CRM
- Add phone number capture
- Create landing page templates for different events
