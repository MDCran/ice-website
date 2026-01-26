import { kv } from '@vercel/kv';

/**
 * Admin API for viewing form submissions
 * 
 * GET /api/ice-updates/admin - Get all submissions
 * 
 * Add authentication in production!
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // TODO: Add authentication check
  // const authHeader = req.headers.authorization;
  // if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
  //   return res.status(401).json({ ok: false, error: 'Unauthorized' });
  // }

  try {
    const submissions = await kv.get('ice-updates-submissions') || [];
    return res.status(200).json({ ok: true, submissions });
  } catch (error) {
    console.error('Error reading submissions:', error);
    return res.status(500).json({ ok: false, error: 'Failed to read submissions' });
  }
}
