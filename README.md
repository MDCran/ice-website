# International Computer Exchange

Static site + local Node server for form logging and ICE SecurePortal.

## Run locally

1. **Static only (no form log, no SecurePortal API):**  
   Open `index.html` in a browser or use any static server (e.g. `npx serve .`).  
   Footer “Get Updates” submit will show a message that the server is required.

2. **With form log + SecurePortal:**  
   ```bash
   cd server && npm install && npm start
   ```  
   Then open `http://localhost:3000`.

   **Port 3000 in use?**  
   - Kill the process: `netstat -ano | findstr :3000` then `taskkill /F /PID <PID>`  
   - Or use a different port: `PORT=3001 npm start` (then open `http://localhost:3001`)

   - **Get Updates form:** Submissions are appended to `data/submissions.json` (create `data/` if missing). Not deployed to Vercel; local only.
   - **ICE SecurePortal:** `POST /api/secure-portal/access` with `{ fileId, password }`. Files and config live in `data/secure-portal.json`.

## ICE SecurePortal

- **Config:** `data/secure-portal.json`. Copy from `data/secure-portal.example.json` if you don’t have it.
- **Demo:** FILE_ID `demo`, PASSWORD `demo123`.  
- **Add/edit files:** Edit `data/secure-portal.json`:

  ```json
  {
    "files": {
      "my-file-id": {
        "password": "secret",
        "path": "assets/path/to/file.pdf",
        "name": "My File",
        "prohibitDownload": false,
        "limitViews": 10,
        "viewCount": 0,
        "expireAt": "2026-12-31T23:59:59Z"
      }
    }
  }
  ```

- **Options:** `prohibitDownload`, `limitViews`, `expireAt` (ISO date).  
- **Manage:** Edit `data/secure-portal.json` (password, limits, expire, etc.) or delete an entry to remove a file.

## White papers

- **Data:** `assets/data/white-papers.js` → `window.WHITE_PAPERS`.
- **Add:** Push `{ id, name, year, cover, file, fileType }` (`fileType`: `"pdf"` or `"image"`).
- **Search:** White Papers page filters by `name`.

## Deploy to Vercel (static)

- Build: none. Publish the repo as static.
- Form log and SecurePortal **do not run on Vercel** unless you add serverless API routes and storage (e.g. Vercel Blob + KV).  
- For production form + SecurePortal, run the Node server elsewhere or implement serverless equivalents.

## Vercel free tier

- Static hosting; no `data/` write.  
- Use serverless functions + Blob/KV if you want form log or SecurePortal on Vercel.
