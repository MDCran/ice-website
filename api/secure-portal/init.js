import { kv } from '@vercel/kv';

/**
 * Initialize script to set up secure portal files in KV
 * Run this once to migrate data from secure-portal.json to KV
 * 
 * Usage: Call this API endpoint once after setting up KV
 * POST /api/secure-portal/init
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Optional: Add authentication check here
  // const authHeader = req.headers.authorization;
  // if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
  //   return res.status(401).json({ ok: false, error: 'Unauthorized' });
  // }

  try {
    // Initial data structure - matches secure-portal.json
    const exampleData = {
      files: {
        "demo": {
          "password": "demo123",
          "path": "assets/images/white_papers/covers/data_centers.png",
          "name": "Demo File",
          "prohibitDownload": true,
          "limitViews": null,
          "viewCount": 0,
          "expireAt": null,
          "dateUploaded": "2025-01-20T10:00:00Z",
          "createdAt": "2025-01-20T10:00:00Z",
          "fileSize": "Unknown"
        },
        "datacenters": {
          "password": "datacenters2025",
          "path": "assets/images/resources/ICE_High-Security_Data_Centers.pdf",
          "name": "ICE High-Security Data Centers",
          "prohibitDownload": false,
          "limitViews": null,
          "viewCount": 0,
          "expireAt": null,
          "dateUploaded": "2025-01-25T10:00:00Z",
          "createdAt": "2025-01-25T10:00:00Z",
          "fileSize": "3.4 MB"
        }
      }
    };

    // Check if data already exists
    const existing = await kv.get('secure-portal-files');
    if (existing && Object.keys(existing.files || {}).length > 0) {
      return res.status(200).json({ 
        ok: true, 
        message: 'Data already initialized',
        data: existing 
      });
    }

    // Initialize with example data
    await kv.set('secure-portal-files', exampleData);

    return res.status(200).json({ 
      ok: true, 
      message: 'Secure portal files initialized in KV',
      data: exampleData 
    });
  } catch (error) {
    console.error('Error initializing secure portal:', error);
    return res.status(500).json({ ok: false, error: 'Failed to initialize' });
  }
}
