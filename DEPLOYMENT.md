# Vercel Deployment Guide

## Pre-Deployment Setup

### 1. Run Setup Script

**Windows:**
```powershell
.\setup-vercel.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-vercel.sh
./setup-vercel.sh
```

This will:
- Create `public/` directory
- Move all `.html` files to `public/`
- Move `assets/` folder to `public/assets/`

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `@vercel/kv` - For KV storage access
- `vercel` - For local development

## Vercel Dashboard Setup

### 1. Create KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create new)
3. Go to **Storage** tab
4. Click **Create Database** → **KV**
5. Name it (e.g., "ice-kv")
6. Vercel will auto-create environment variables

### 2. Deploy Project

1. Push your code to GitHub
2. In Vercel: **Add New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (default)
   - **Build Command:** (leave empty)
   - **Output Directory:** `public`
   - **Install Command:** `npm install`
5. Click **Deploy**

### 3. Initialize Secure Portal Data

After first deployment, initialize the data:

**Option A: Using curl**
```bash
curl -X POST https://your-domain.vercel.app/api/secure-portal/init
```

**Option B: Using browser**
- Open: `https://your-domain.vercel.app/api/secure-portal/init`
- Or use a tool like Postman to send POST request

**Option C: Using Vercel CLI**
```bash
vercel env pull  # Get env vars
vercel dev       # Test locally first
```

## Post-Deployment

### Viewing Data

**Form Submissions:**
- Vercel Dashboard → Storage → KV → View `ice-updates-submissions` key
- Or call: `GET /api/ice-updates/admin` (add auth in production!)

**Secure Portal Files:**
- Vercel Dashboard → Storage → KV → View `secure-portal-files` key
- Or call: `GET /api/secure-portal/admin` (add auth in production!)

### Managing Secure Portal Files

**Add/Edit File:**
```bash
POST /api/secure-portal/admin
{
  "fileId": "newfile",
  "fileData": {
    "password": "password123",
    "path": "assets/images/file.pdf",
    "name": "My File",
    "prohibitDownload": false,
    "limitViews": null,
    "expireAt": null
  }
}
```

**Delete File:**
```bash
DELETE /api/secure-portal/admin?fileId=newfile
```

## File Structure After Setup

```
/
├── public/                    # Static files (served by Vercel)
│   ├── index.html
│   ├── solutions.html
│   ├── partners.html
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── ...
├── api/                       # Serverless functions
│   ├── ice-updates.js         # Form submissions
│   ├── ice-updates/
│   │   └── admin.js          # View submissions
│   └── secure-portal/
│       ├── access.js          # File access
│       ├── init.js            # Initialize data
│       └── admin.js          # Manage files
├── package.json
├── vercel.json
├── .vercelignore
├── setup-vercel.ps1
├── setup-vercel.sh
└── README-VERCEL.md
```

## Environment Variables (Auto-set by Vercel)

When you create KV storage, Vercel automatically sets:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

These are available in your API functions automatically.

## Local Development

```bash
# Install dependencies
npm install

# Link to Vercel project (first time)
vercel link

# Pull environment variables
vercel env pull

# Run local dev server
vercel dev
```

This will:
- Serve files from `public/` at `http://localhost:3000`
- Run API functions locally
- Connect to your Vercel KV storage

## Troubleshooting

### API returns 500 error
- Check Vercel function logs in dashboard
- Ensure KV database is created and connected
- Verify environment variables are set

### Files not loading
- Ensure files are in `public/` directory
- Check `vercel.json` has correct `outputDirectory`

### KV storage empty
- Call `/api/secure-portal/init` endpoint
- Check KV connection in Vercel dashboard

## Security Notes

⚠️ **Important:** The admin endpoints (`/api/secure-portal/admin` and `/api/ice-updates/admin`) currently have NO authentication. 

**Before production:**
1. Add authentication to admin endpoints
2. Use Vercel environment variables for secrets
3. Consider using Vercel's built-in authentication

Example auth check (add to admin.js):
```javascript
const authHeader = req.headers.authorization;
if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
  return res.status(401).json({ ok: false, error: 'Unauthorized' });
}
```

Then set `ADMIN_TOKEN` in Vercel environment variables.
