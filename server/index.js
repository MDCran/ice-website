const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'submissions.json');
const SECURE_PORTAL_FILE = path.join(ROOT, 'data', 'secure-portal.json');
const SECURE_PORTAL_EXAMPLE = path.join(ROOT, 'data', 'secure-portal.example.json');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/data', (req, res) => { res.status(404).end(); });
app.use(express.static(ROOT));

function loadSecurePortal() {
  const p = fs.existsSync(SECURE_PORTAL_FILE) ? SECURE_PORTAL_FILE : SECURE_PORTAL_EXAMPLE;
  if (!fs.existsSync(p)) return { files: {} };
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) { return { files: {} }; }
}

function saveSecurePortal(data) {
  const dir = path.dirname(SECURE_PORTAL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SECURE_PORTAL_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.post('/api/ice-updates', (req, res) => {
  const { name, company, phone } = req.body || {};
  if (!name || !company || !phone) {
    return res.status(400).json({ ok: false, error: 'Name, company, and phone required' });
  }
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let list = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      list = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (_) {}
  }
  list.push({
    name: String(name).trim(),
    company: String(company).trim(),
    phone: String(phone).trim(),
    at: new Date().toISOString()
  });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  res.json({ ok: true });
});

app.post('/api/secure-portal/access', (req, res) => {
  const { fileId, password } = req.body || {};
  if (!fileId || !password) {
    return res.status(400).json({ ok: false, error: 'FILE_ID and PASSWORD required' });
  }
  const data = loadSecurePortal();
  const file = data.files[String(fileId).trim()];
  if (!file) {
    return res.status(404).json({ ok: false, error: 'File not found' });
  }
  if (file.password !== String(password)) {
    return res.status(401).json({ ok: false, error: 'Invalid password' });
  }
  if (file.expireAt && new Date(file.expireAt) < new Date()) {
    return res.status(410).json({ ok: false, error: 'File has expired' });
  }
  const limit = file.limitViews;
  const viewCount = (file.viewCount || 0) + 1;
  if (limit != null && viewCount > limit) {
    return res.status(410).json({ ok: false, error: 'View limit reached' });
  }
  file.viewCount = viewCount;
  if (fs.existsSync(SECURE_PORTAL_FILE)) saveSecurePortal(data);
  const ext = (file.path || '').split('.').pop().toLowerCase();
  const fileType = /^(pdf)$/.test(ext) ? 'pdf' : /^(png|jpe?g|gif|webp)$/.test(ext) ? 'image' : 'other';
  const filePath = path.join(ROOT, file.path);
  let fileSize = 'Unknown';
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const bytes = stats.size;
      fileSize = bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB';
    }
  } catch (_) {}
  res.json({
    ok: true,
    path: file.path,
    name: file.name || fileId,
    fileName: path.basename(file.path),
    fileSize: fileSize,
    dateUploaded: file.dateUploaded || file.createdAt || 'Not specified',
    accessCount: viewCount,
    limitViews: file.limitViews,
    prohibitDownload: !!file.prohibitDownload,
    expireAt: file.expireAt,
    fileType
  });
});

const server = app.listen(PORT, () => {
  console.log(`ICE local server: http://localhost:${PORT}`);
  console.log(`Get Updates form logs to: data/submissions.json`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error('Options:');
    console.error(`  1. Kill the process using port ${PORT}:`);
    console.error(`     Windows: netstat -ano | findstr :${PORT}  (then taskkill /F /PID <PID>)`);
    console.error(`     Mac/Linux: lsof -ti:${PORT} | xargs kill`);
    console.error(`  2. Use a different port: PORT=3001 npm start`);
    process.exit(1);
  } else {
    throw err;
  }
});
