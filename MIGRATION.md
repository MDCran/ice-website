# Migration to Vercel - File Structure

## Current Structure → Vercel Structure

### Step 1: Create Directory Structure

You need to move files to match Vercel's expected structure:

```
Current:
/
├── index.html
├── assets/
├── server/
└── data/

Vercel:
/
├── public/          # All static files go here
│   ├── index.html
│   ├── assets/
│   └── ...
├── api/             # Serverless functions
│   ├── ice-updates.js
│   └── secure-portal/
│       ├── access.js
│       ├── init.js
│       └── admin.js
├── package.json
├── vercel.json
└── .vercelignore
```

### Step 2: Move Files to Public Directory

**Option A: Manual (Recommended for first time)**
1. Create a `public` folder in your project root
2. Move all HTML files to `public/`
3. Move `assets/` folder to `public/assets/`
4. Keep `api/` folder at root level

**Option B: Use this script (run in project root):**

```bash
# Windows PowerShell
New-Item -ItemType Directory -Path "public" -Force
Move-Item -Path "*.html" -Destination "public\" -Force
Move-Item -Path "assets" -Destination "public\" -Force
```

### Step 3: Update vercel.json

The `vercel.json` is already configured, but verify:
- `outputDirectory: "public"` - tells Vercel where your static files are
- `rewrites` - ensures API routes work correctly

### Step 4: Environment Variables

Vercel will auto-create these when you connect KV storage:
- `KV_URL`
- `KV_REST_API_URL`  
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### Step 5: Initialize Data

After first deployment, call:
```
POST https://your-domain.vercel.app/api/secure-portal/init
```

This sets up the initial secure portal files in KV.

## What Changed

1. **No more Express server** - Replaced with serverless functions
2. **No more JSON files** - Using Vercel KV instead
3. **API endpoints** - Now in `/api` folder as serverless functions
4. **Static files** - Moved to `/public` directory

## Testing Locally

```bash
npm install
vercel dev
```

This will:
- Serve files from `public/`
- Run API functions locally
- Connect to your Vercel KV (if env vars are set)

## Deployment Checklist

- [ ] Move HTML files to `public/`
- [ ] Move `assets/` to `public/assets/`
- [ ] Create KV database in Vercel dashboard
- [ ] Deploy to Vercel
- [ ] Call `/api/secure-portal/init` endpoint once
- [ ] Test form submission
- [ ] Test secure portal access
