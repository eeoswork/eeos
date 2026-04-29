# Email Capture Setup - Beginner's Guide

## What This Does

When someone enters their email on your landing page and clicks "Send me next week's event", it:
1. Stores their email in your database (Cloudflare D1)
2. (Optional) Sends you an email notification so you know they signed up

## Step-by-Step Setup

### STEP 1: Run the Database Migration (5 minutes)

This creates a table in your database to store emails.

**What to do:**
1. Open https://dash.cloudflare.com in your browser
2. Click your account name (top right) → select your website
3. Look for **"Workers & Pages"** on the left sidebar (or search for it)
4. Click **"Workers & Pages"**
5. Look for **"D1"** on the left sidebar
6. Click **"D1 SQL Database"** (or just **"D1"**)
7. You should see a database called **"eeos"** — click on it

**Now you're in your database dashboard. Next:**

8. Look for a **"Console"** tab or button at the top
9. You should see a big text box where you can type SQL commands
10. Copy and paste this entire code block into that text box:

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

11. Click **"Execute"** or press Enter/Return
12. You should see a green checkmark or success message

**Done with Step 1!** Your database is ready.

---

### STEP 2: Deploy Your Code (5 minutes)

This uploads all the code changes I made to Cloudflare.

**What to do:**

1. Open your terminal/command line
2. Navigate to your project folder:
   ```bash
   cd /Users/avery/jolly-hr
   ```

3. Deploy to Cloudflare:
   ```bash
   wrangler deploy
   ```

4. Wait for it to finish (should say "✓ Uploaded" or similar)

**That's it!** Your email capture system is now live.

---

### STEP 3: Test It Works (3 minutes)

Let's make sure everything is actually working.

**What to do:**

1. Go to your landing page: https://eeos.work/landing-page.html (or wherever you have it)
2. Scroll down to the email form
3. Enter a test email (e.g., `test@example.com`)
4. Click "Send me next week's event"
5. The button should say "Sending..." for a moment
6. Then you should see the success message

**Verify it actually stored:**

1. Go back to your Cloudflare D1 console (Steps 1-9 from STEP 1)
2. Run this command:
   ```sql
   SELECT * FROM email_captures ORDER BY created_at DESC LIMIT 10;
   ```
3. Click "Execute"
4. You should see your test email in the results

**If you see it → everything works!**

---

### STEP 4 (Optional): Set Up Email Notifications

This is optional. If you want to get an email every time someone signs up, follow this section. Otherwise, skip it.

#### 4a: Create a Resend Account

Resend is a service that sends emails.

1. Go to https://resend.com
2. Click **"Sign up"**
3. Create an account (use your email)
4. Click the link in the verification email they send you

#### 4b: Add Your Domain

Now you need to tell Resend that you own eeos.work.

1. After signing up, look for **"Domains"** in the left sidebar
2. Click **"Domains"** or **"Add Domain"**
3. Enter: `eeos.work`
4. Click **"Add"** or **"Continue"**
5. Resend will show you DNS records to add

**Now go to Cloudflare to add those records:**

1. Go to https://dash.cloudflare.com
2. Select your domain (`eeos.work`)
3. Look for **"DNS"** on the left sidebar
4. Click **"DNS"**
5. Click **"Add record"** or **"+ Add"**
6. Copy each record Resend showed you and add it to Cloudflare
   - Record type: (Resend will show you - usually "TXT" or "CNAME")
   - Name: (Resend shows this)
   - Content: (Resend shows this)
7. Click "Save" after each one

Wait about 5-10 minutes for DNS to update.

#### 4c: Get Your Resend API Key

1. Go back to Resend (https://resend.com)
2. Look for **"API Keys"** or **"Settings"** in the left sidebar
3. Click **"API Keys"**
4. Click **"Create API Key"** or **"+ Add"**
5. Copy the key (it will look like: `re_xxxxxxxxxxxxxxxxxxx`)
6. **Save this somewhere safe** (don't share it!)

#### 4d: Add the Keys to Your Project

Now you tell your code these keys.

1. Open the file: `/Users/avery/jolly-hr/wrangler.toml`
2. Find the section that looks like:
   ```toml
   [vars]
   POLL_UPSTREAM_BASE = "https://esos-polls.ajolly2.workers.dev/api"

   [[d1_databases]]
   ```

3. Add these lines right after `[vars]`:
   ```toml
   RESEND_API_KEY = "re_PASTE_YOUR_KEY_HERE"
   NOTIFY_EMAIL = "your-email@example.com"
   FROM_EMAIL = "no-reply@eeos.work"
   ```

4. Replace:
   - `re_PASTE_YOUR_KEY_HERE` with the API key you copied
   - `your-email@example.com` with YOUR actual email address

5. Save the file

6. Go back to terminal and run:
   ```bash
   wrangler deploy
   ```

**Test it:**

1. Go to your landing page again
2. Enter an email
3. Submit it
4. Check your email inbox (check spam folder too!) for a notification email

**Done!**

---

## Troubleshooting

### "Email form won't submit"
- Check browser console (right-click → Inspect → Console tab)
- Look for any red error messages
- Try refreshing the page
- Make sure you did `wrangler deploy`

### "I see an error like 'DB not found'"
- Your D1 database might not be set up correctly
- Go back to STEP 1 and verify the table was created
- Run: `SELECT * FROM email_captures;` to check

### "Email notification not arriving"
- Check your spam folder
- Wait 10+ minutes for DNS changes if you just set up Resend
- Verify your Resend API key is correct (Step 4c)
- Verify your domain records were added to Cloudflare correctly (Step 4b)

### "I don't see Domains or API Keys in Resend"
- You might not be logged in
- Try clicking your profile icon (top right)
- Make sure you're on the main Resend dashboard, not a workspace

---

## What Happens Now

✅ Your landing page is collecting emails
✅ Emails are stored in your Cloudflare D1 database
✅ (Optional) You get notified when people sign up

Next things you might want to do:
- Create a dashboard to view all captured emails
- Export emails to a CSV
- Send a welcome email to new signups
- Track which events people are interested in

---

## Quick Reference

**Database Query:**
```sql
SELECT * FROM email_captures ORDER BY created_at DESC LIMIT 50;
```

**Deployed endpoint:**
```
POST https://api.eeos.work/api/eeos-email-capture
```

**Landing page test:**
```
https://eeos.work/landing-page.html
```

---

**Stuck?** Come back and let me know which step and what error message you see, and I'll help debug.
