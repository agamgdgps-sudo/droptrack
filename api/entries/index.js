const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const DB_PATH = path.join(__dirname, '..', 'server', 'data', 'db.json');

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch (e) { return { entries: [] }; }
}

function writeDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8'); }

function authenticate(req) {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts.length !==2 || parts[0] !== 'Bearer') return false;
  try { jwt.verify(parts[1], process.env.JWT_SECRET || 'dev-secret'); return true; } catch(e) { return false; }
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    if (!authenticate(req)) return res.status(401).json({ error: 'unauthorized' });
    const db = readDB();
    return res.json(db.entries || []);
  }

  if (req.method === 'POST') {
    if (!authenticate(req)) return res.status(401).json({ error: 'unauthorized' });
    const body = req.body || (await new Promise(r=>{let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(JSON.parse(d||'{}'))); }));
    if (!body || !body.date) return res.status(400).json({ error: 'invalid entry' });
    const db = readDB();
    const existing = db.entries.findIndex(e => e.date === body.date);
    if (existing >= 0) db.entries[existing] = body; else db.entries.push(body);
    writeDB(db);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'method' });
}
