import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { fileId, password } = req.body || {};
  
  if (!fileId || !password) {
    return res.status(400).json({ ok: false, error: 'FILE_ID and PASSWORD required' });
  }

  try {
    // Get secure portal files from KV
    let portalData = { files: {} };
    try {
      const existing = await kv.get('secure-portal-files');
      if (existing && existing.files) {
        portalData = existing;
      }
    } catch (err) {
      console.error('Error reading from KV:', err);
      // If KV is empty, try to load from example data
      // This would need to be initialized manually or via a setup script
    }

    const file = portalData.files[String(fileId).trim()];
    
    if (!file) {
      return res.status(404).json({ ok: false, error: 'File not found' });
    }

    if (file.password !== String(password)) {
      return res.status(401).json({ ok: false, error: 'Invalid password' });
    }

    // Check expiration
    if (file.expireAt && new Date(file.expireAt) < new Date()) {
      return res.status(410).json({ ok: false, error: 'File has expired' });
    }

    // Check view limit
    const limit = file.limitViews;
    const viewCount = (file.viewCount || 0) + 1;
    if (limit != null && viewCount > limit) {
      return res.status(410).json({ ok: false, error: 'View limit reached' });
    }

    // Update view count
    file.viewCount = viewCount;
    portalData.files[String(fileId).trim()] = file;
    await kv.set('secure-portal-files', portalData);

    // Determine file type
    const ext = (file.path || '').split('.').pop().toLowerCase();
    const fileType = /^(pdf)$/.test(ext) ? 'pdf' : /^(png|jpe?g|gif|webp)$/.test(ext) ? 'image' : 'other';

    // Get file size (for files in public directory, we can't easily get size in serverless)
    // File size will need to be stored in KV or calculated client-side
    const fileSize = file.fileSize || 'Unknown';

    return res.status(200).json({
      ok: true,
      path: file.path,
      name: file.name || fileId,
      fileName: file.fileName || (file.path ? file.path.split('/').pop() : fileId),
      fileSize: fileSize,
      dateUploaded: file.dateUploaded || file.createdAt || 'Not specified',
      accessCount: viewCount,
      limitViews: file.limitViews,
      prohibitDownload: !!file.prohibitDownload,
      expireAt: file.expireAt,
      fileType
    });
  } catch (error) {
    console.error('Error accessing secure portal:', error);
    return res.status(500).json({ ok: false, error: 'Failed to access file' });
  }
}
