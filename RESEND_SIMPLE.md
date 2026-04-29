# Resend Setup - Simple Version

## 5 Minutes to Email Notifications

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Click **Sign Up**
3. Enter your email, create password
4. Click verify link in your email
5. Done

### Step 2: Add Your Domain
1. In Resend, click **Domains** (left sidebar)
2. Click **+ Add Domain**
3. Type: `eeos.work`
4. Click **Add**
5. Resend shows you 3-4 DNS records

### Step 3: Add DNS Records to Cloudflare
1. Go to https://dash.cloudflare.com
2. Select **eeos.work**
3. Click **DNS** (left sidebar)
4. Click **+ Add Record**
5. For each record from Resend:
   - **Type**: Copy from Resend
   - **Name**: Copy from Resend
   - **Content**: Copy from Resend
   - Click **Save**
6. Wait 5 minutes, then go back to Resend and click **Verify**

### Step 4: Get API Key
1. In Resend, click **API Keys** (left sidebar)
2. Click **+ Create API Key**
3. Name it: `EEOS`
4. Click **Create**
5. Copy the key (looks like: `re_xxxxxxxxxxxxx`)

### Step 5: Add Key to Your Project
1. Open: `/Users/avery/jolly-hr/wrangler.toml`
2. Find this section:
   ```toml
   [vars]
   POLL_UPSTREAM_BASE = "https://esos-polls.ajolly2.workers.dev/api"
   RESEND_API_KEY = ""
   NOTIFY_EMAIL = ""
   FROM_EMAIL = "no-reply@eeos.work"
   ```

3. Replace the empty quotes:
   ```toml
   RESEND_API_KEY = "re_paste_your_key_here"
   NOTIFY_EMAIL = "your-email@example.com"
   FROM_EMAIL = "no-reply@eeos.work"
   ```

4. Save file

### Step 6: Deploy
```bash
cd /Users/avery/jolly-hr
npx wrangler deploy
```

Wait 1 minute for deployment.

### Step 7: Test
1. Go to https://eeos.work/landing-page.html
2. Enter an email
3. Click **Send me next week's event**
4. Check your email inbox (including spam folder)

**Done!** 🎉 You're now getting email notifications when people sign up.
