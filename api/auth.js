const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const body = req.body || (await new Promise(r=>{let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(JSON.parse(d||'{}'))); }));
  const passcode = body.passcode;
  const expected = process.env.PASSCODE || '0101';
  if (!passcode || passcode !== expected) return res.status(401).json({ error: 'invalid passcode' });
  const token = jwt.sign({ user: 'owner' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  res.json({ token });
}
