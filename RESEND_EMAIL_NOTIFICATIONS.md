# Email Notifications Setup - Step 3

## What This Does

When someone enters their email on your landing page, you'll automatically receive an email notification with their details.

## Step 1: Create a Resend Account

Resend is the service that sends you the notification emails.

1. Go to https://resend.com
2. Click **"Sign Up"**
3. Enter your email address (use your personal email)
4. Create a password
5. Click the verification link in the email they send you
6. You're done with this step!

---

## Step 2: Add Your Domain to Resend

This tells Resend that you own eeos.work.

**In Resend Dashboard:**

1. Look for **"Domains"** in the left sidebar
2. Click **"Domains"** or **"Add Domain"**
3. Type: `eeos.work`
4. Click **"Add"** or **"Continue"**
5. Resend will show you 3-4 DNS records that look like this:
   ```
   Type: TXT
   Name: default._domainkey
   Value: v=DKIM1; p=...
   ```

**Now add these records to Cloudflare:**

1. Go to https://dash.cloudflare.com
2. Select your domain (eeos.work)
3. Go to **"DNS"** on the left sidebar
4. Click **"+ Add record"** or **"Add record"**
5. For each DNS record from Resend:
   - **Type:** Copy from Resend (usually TXT or CNAME)
   - **Name:** Copy from Resend (e.g., `default._domainkey`)
   - **Content:** Copy the Value from Resend
   - Click **"Save"**
6. Repeat for all records Resend gave you

**Back in Resend:**

7. Click **"Verify"** after you've added all the records
8. Wait 5-10 minutes for DNS to verify
9. Once verified, you'll see a green checkmark

---

## Step 3: Get Your Resend API Key

**In Resend Dashboard:**

1. Look for **"API Keys"** or **"Settings"** in the left sidebar
2. Click **"API Keys"**
3. Click **"Create API Key"** or **"+ New"**
4. Give it a name like: `EEOS Landing Page`
5. Select **"Sending access"**
6. Copy the key (it will look like: `re_xxxxxxxxxxxxxxxx`)
7. **Save this somewhere safe** (don't share it!)

---

## Step 4: Add API Key to Your Project

**Edit your wrangler.toml file:**

1. Open `/Users/avery/jolly-hr/wrangler.toml`
2. Find this section:
   ```toml
   [vars]
   POLL_UPSTREAM_BASE = "https://esos-polls.ajolly2.workers.dev/api"
   ```

3. Add these three lines right after the `[vars]` line:
   ```toml
   RESEND_API_KEY = "re_PASTE_YOUR_KEY_HERE"
   NOTIFY_EMAIL = "YOUR_EMAIL_HERE"
   FROM_EMAIL = "no-reply@eeos.work"
   ```

4. Replace:
   - `re_PASTE_YOUR_KEY_HERE` → paste your Resend API key
   - `YOUR_EMAIL_HERE` → your actual email (e.g., avery@example.com)

5. **Save the file**

---

## Step 5: Deploy Updated Code

In your terminal:
```bash
cd /Users/avery/jolly-hr
npx wrangler deploy
```

Wait for it to finish (you should see "Deployed" message).

---

## Step 6: Test It Works

1. Go to https://eeos.work/landing-page.html
2. Enter an email and submit
3. Check your email inbox (check spam folder too!)
4. You should receive an email that looks like:

```
From: EEOS <no-reply@eeos.work>
Subject: New EEOS lead — next week's event

New EEOS email capture
Email: user@example.com
Source: eeos_landing_page
Event: Workspace Show & Tell
Capture reason: next_week_event
Submitted at: 2026-04-29T18:15:32.123Z
```

**If you see it → Success!** 🎉

---

## Troubleshooting

### "Email notification not arriving"
- Check your spam folder
- Wait 5+ minutes after deployment
- Verify your Resend API key is correct (copy/paste again from Resend)
- Make sure the `NOTIFY_EMAIL` in wrangler.toml is your actual email

### "DNS verification failing in Resend"
- Go back to Cloudflare
- Make sure you added ALL the records Resend gave you
- Double-check the values match exactly (copy/paste if possible)
- Wait 10-15 minutes for DNS propagation
- Try "Verify" again in Resend

### "I don't see Domains or API Keys in Resend"
- Make sure you're logged in
- You might be in a workspace—look for a dropdown menu to switch to your main account
- Try refreshing the page

### "Deploy failed after adding env vars"
- Check wrangler.toml syntax (make sure it looks exactly like the example)
- Make sure there are no extra spaces or missing colons
- Try running `npm run deploy` instead of `npx wrangler deploy`

---

## What Happens Now

✅ Your landing page collects emails
✅ Emails are stored in your D1 database
✅ **You get notified when people sign up**

---

## Optional: Test Email Notifications

1. Go to your landing page
2. Enter a test email like: `test@example.com`
3. In your D1 console, check:
   ```sql
   SELECT * FROM email_captures WHERE email = 'test@example.com';
   ```
4. You should see the record AND received an email notification

---

## Next Steps

Optional enhancements:
- Create an admin dashboard to view all leads
- Export leads as CSV
- Send a welcome email to new signups
- Track conversion rates
- A/B test landing page copy
