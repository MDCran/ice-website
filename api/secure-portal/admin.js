import { kv } from '@vercel/kv';

/**
 * Admin API for managing secure portal files
 * 
 * GET /api/secure-portal/admin - List all files
 * POST /api/secure-portal/admin - Add/update a file
 * DELETE /api/secure-portal/admin?fileId=xxx - Delete a file
 * 
 * Add authentication in production!
 */

export default async function handler(req, res) {
  // TODO: Add authentication check
  // const authHeader = req.headers.authorization;
  // if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
  //   return res.status(401).json({ ok: false, error: 'Unauthorized' });
  // }

  try {
    let portalData = { files: {} };
    try {
      const existing = await kv.get('secure-portal-files');
      if (existing && existing.files) {
        portalData = existing;
      }
    } catch (err) {
      console.error('Error reading from KV:', err);
    }

    if (req.method === 'GET') {
      // List all files (without passwords)
      const files = {};
      for (const [id, file] of Object.entries(portalData.files || {})) {
        files[id] = {
          ...file,
          password: undefined // Don't expose passwords
        };
      }
      return res.status(200).json({ ok: true, files });
    }

    if (req.method === 'POST') {
      // Add or update a file
      const { fileId, fileData } = req.body || {};
      if (!fileId || !fileData) {
        return res.status(400).json({ ok: false, error: 'fileId and fileData required' });
      }

      portalData.files[String(fileId)] = {
        ...fileData,
        viewCount: fileData.viewCount || 0,
        createdAt: fileData.createdAt || new Date().toISOString(),
        dateUploaded: fileData.dateUploaded || fileData.createdAt || new Date().toISOString()
      };

      await kv.set('secure-portal-files', portalData);
      return res.status(200).json({ ok: true, message: 'File saved' });
    }

    if (req.method === 'DELETE') {
      // Delete a file
      const { fileId } = req.query || {};
      if (!fileId) {
        return res.status(400).json({ ok: false, error: 'fileId required' });
      }

      delete portalData.files[String(fileId)];
      await kv.set('secure-portal-files', portalData);
      return res.status(200).json({ ok: true, message: 'File deleted' });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin API:', error);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
