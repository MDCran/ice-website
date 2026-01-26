# International Computer Exchange - Vercel Deployment

This project is configured to deploy on Vercel.

## Quick Start

### Step 1: Move Files to Public Directory

**Windows (PowerShell):**
```powershell
.\setup-vercel.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x setup-vercel.sh
./setup-vercel.sh
```

**Manual:**
1. Create a `public` folder
2. Move all `.html` files to `public/`
3. Move `assets/` folder to `public/assets/`

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Vercel KV Storage Setup

1. Go to your Vercel dashboard
2. Navigate to **Storage** → **KV** → **Create**
3. Create a new KV database (it will auto-create environment variables)

### 2. Initialize Secure Portal Data

After deploying, you need to initialize the secure portal files in KV:

1. Call the init endpoint once:
   ```
   POST https://your-domain.vercel.app/api/secure-portal/init
   ```

   Or use curl:
   ```bash
   curl -X POST https://your-domain.vercel.app/api/secure-portal/init
   ```

2. This will set up the default files (demo and datacenters)

### 3. Managing Secure Portal Files

To add/edit/delete files in the secure portal, you'll need to:

**Option A: Use Vercel KV Dashboard**
- Go to Vercel Dashboard → Storage → KV
- Manually edit the `secure-portal-files` key

**Option B: Create Admin API Endpoints**
- Create `/api/secure-portal/admin.js` with authentication
- Use it to manage files programmatically

**Option C: Use Vercel CLI**
```bash
vercel kv set secure-portal-files '{"files": {...}}'
```

### 4. Viewing Submissions

To view form submissions:

**Option A: Vercel KV Dashboard**
- Go to Vercel Dashboard → Storage → KV
- View the `ice-updates-submissions` key

**Option B: Create Admin API Endpoint**
- Create `/api/ice-updates/admin.js` to retrieve submissions

### 5. Local Development

For local development with Vercel:

```bash
npm install
vercel dev
```

This will:
- Serve your site at `http://localhost:3000`
- Run API functions locally
- Connect to your Vercel KV (if env vars are set)

### 6. Environment Variables

Vercel will automatically set these when you connect KV:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 7. File Structure

```
/
├── public/              # Your website files (HTML, CSS, JS, images)
│   ├── index.html
│   ├── assets/
│   └── ...
├── api/                 # Serverless functions
│   ├── ice-updates.js
│   └── secure-portal/
│       ├── access.js
│       └── init.js
├── package.json
├── vercel.json
└── README-VERCEL.md
```

### 8. Deployment

1. Push to GitHub
2. In Vercel: **New Project** → Import your repo
3. Framework: **Other**
4. Build Command: (leave empty)
5. Output Directory: `public`
6. Deploy!

## Notes

- All API calls use relative paths (`/api/...`) so they work both locally and on Vercel
- KV storage replaces the JSON file system
- The `init.js` endpoint should be called once after first deployment to set up initial data
- For production, consider adding authentication to the init endpoint
