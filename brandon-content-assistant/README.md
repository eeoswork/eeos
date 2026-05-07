# Brandon Real Estate Content Assistant

Private review-and-copy dashboard for turning Los Angeles / California real estate news into ready-to-edit Instagram drafts.

This MVP does not auto-post. Brandon reviews the draft, copies the caption, and posts manually.

## Local development

1. Create a local env file:

```bash
cp .env.example .env.local
```

2. Add the OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. Install dependencies if needed:

```bash
npm install
```

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## What it does

- Fetches the latest Google News RSS stories for Los Angeles real estate
- Enriches stories with thumbnail metadata when available
- Generates an Instagram draft server-side with OpenAI
- Lets Brandon copy the final post and open Instagram manually

## API routes

- `GET /api/articles`
- `POST /api/generate-post`

## Deployment note for brandon.eeos.work

This app should be deployed as its own Next.js service. The current root Cloudflare worker in the main repo serves static HTML pages and is not the runtime for this app.

Recommended path:

1. Deploy this subfolder as a standalone Next.js app on Vercel or another Node-compatible host.
2. Set the production domain to `brandon.eeos.work`.
3. In Cloudflare DNS, create a proxied `CNAME` for `brandon` pointing to the deployment target provided by the host.

## Optional later

- Basic auth using `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD`
- Richer article extraction beyond headline/snippet metadata
