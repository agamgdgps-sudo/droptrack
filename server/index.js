require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const PASSCODE = process.env.PASSCODE || 'change-me';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { entries: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

app.post('/auth', (req, res) => {
  const { passcode } = req.body;
  if (!passcode) return res.status(400).json({ error: 'passcode required' });
  if (passcode !== PASSCODE) return res.status(401).json({ error: 'invalid passcode' });
  const token = jwt.sign({ user: 'owner' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing authorization' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid authorization' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

app.get('/entries', authenticate, (req, res) => {
  const db = readDB();
  res.json(db.entries || []);
});

app.post('/entries', authenticate, (req, res) => {
  const db = readDB();
  const entry = req.body;
  if (!entry || !entry.date) return res.status(400).json({ error: 'invalid entry' });
  const existing = db.entries.findIndex(e => e.date === entry.date);
  if (existing >= 0) db.entries[existing] = entry; else db.entries.push(entry);
  writeDB(db);
  res.json({ ok: true });
});

app.put('/entries/:date', authenticate, (req, res) => {
  const db = readDB();
  const date = req.params.date;
  const index = db.entries.findIndex(e => e.date === date);
  if (index === -1) return res.status(404).json({ error: 'not found' });
  db.entries[index] = req.body;
  writeDB(db);
  res.json({ ok: true });
});

app.delete('/entries/:date', authenticate, (req, res) => {
  const db = readDB();
  const date = req.params.date;
  db.entries = db.entries.filter(e => e.date !== date);
  writeDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`DropTrack server listening on http://localhost:${PORT}`);
});
