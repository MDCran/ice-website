import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { name, company, phone } = req.body || {};
  
  if (!name || !company || !phone) {
    return res.status(400).json({ ok: false, error: 'Name, company, and phone required' });
  }

  try {
    // Get existing submissions from KV
    let submissions = [];
    try {
      const existing = await kv.get('ice-updates-submissions');
      if (Array.isArray(existing)) {
        submissions = existing;
      }
    } catch (err) {
      console.error('Error reading from KV:', err);
    }

    // Add new submission
    submissions.push({
      name: String(name).trim(),
      company: String(company).trim(),
      phone: String(phone).trim(),
      at: new Date().toISOString()
    });

    // Save back to KV
    await kv.set('ice-updates-submissions', submissions);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error saving submission:', error);
    return res.status(500).json({ ok: false, error: 'Failed to save submission' });
  }
}
