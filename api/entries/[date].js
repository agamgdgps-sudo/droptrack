const jwt = require('jsonwebtoken');
const db = require('../db');

function authenticate(req) { const auth = req.headers.authorization || ''; const parts = auth.split(' '); if (parts.length !==2 || parts[0] !== 'Bearer') return false; try { jwt.verify(parts[1], process.env.JWT_SECRET || 'dev-secret'); return true; } catch(e) { return false; } }

module.exports = async (req, res) => {
  const date = decodeURIComponent(req.query.date || req.url.split('/').pop());
  if (!authenticate(req)) return res.status(401).json({ error: 'unauthorized' });

  if (req.method === 'PUT') {
    const body = req.body || (await new Promise(r=>{let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(JSON.parse(d||'{}'))); }));
    // upsert via adapter
    await db.upsert(body);
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    await db.deleteByDate(date);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'method' });
}
