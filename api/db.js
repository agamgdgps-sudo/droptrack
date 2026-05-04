const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const DB_PATH = path.join(__dirname, '..', 'server', 'data', 'db.json');

function readFileDB() { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch (e) { return { entries: [] }; } }
function writeFileDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8'); }

let _mongoClient = null;
async function getMongoClient() {
  if (!_mongoClient) {
    if (!process.env.MONGODB_URI) return null;
    _mongoClient = new MongoClient(process.env.MONGODB_URI);
    await _mongoClient.connect();
  }
  return _mongoClient;
}

function useMongo() { return !!process.env.MONGODB_URI; }
function useSupabase() { return !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY); }

async function mongoGetAll() {
  const client = await getMongoClient();
  if (!client) throw new Error('mongo not configured');
  const db = client.db();
  const col = db.collection('entries');
  const docs = await col.find({}).toArray();
  return docs.map(d => { delete d._id; return d; });
}

async function mongoUpsert(entry) {
  const client = await getMongoClient();
  if (!client) throw new Error('mongo not configured');
  const db = client.db();
  const col = db.collection('entries');
  await col.updateOne({ date: entry.date }, { $set: entry }, { upsert: true });
  return { ok: true };
}

async function mongoDelete(date) {
  const client = await getMongoClient();
  if (!client) throw new Error('mongo not configured');
  const db = client.db();
  const col = db.collection('entries');
  await col.deleteOne({ date });
  return { ok: true };
}

async function supabaseGetAll() {
  const url = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/entries?select=*`;
  const res = await fetch(url, { headers: { apikey: process.env.SUPABASE_KEY, Authorization: `Bearer ${process.env.SUPABASE_KEY}` } });
  if (!res.ok) throw new Error('supabase get failed');
  return res.json();
}

async function supabaseUpsert(entry) {
  const url = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/entries?on_conflict=date`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.SUPABASE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(entry)
  });
  if (!res.ok) throw new Error('supabase upsert failed');
  return res.json();
}

async function supabaseDelete(date) {
  const url = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/entries?date=eq.${encodeURIComponent(date)}`;
  const res = await fetch(url, { method: 'DELETE', headers: { apikey: process.env.SUPABASE_KEY, Authorization: `Bearer ${process.env.SUPABASE_KEY}` } });
  if (!res.ok) throw new Error('supabase delete failed');
  return true;
}

module.exports = {
  async getAll() {
    if (useMongo()) return mongoGetAll();
    if (useSupabase()) return supabaseGetAll();
    const db = readFileDB();
    return db.entries || [];
  },

  async upsert(entry) {
    if (useMongo()) return mongoUpsert(entry);
    if (useSupabase()) return supabaseUpsert(entry);
    const db = readFileDB();
    const idx = db.entries.findIndex(e => e.date === entry.date);
    if (idx >= 0) db.entries[idx] = entry; else db.entries.push(entry);
    writeFileDB(db);
    return { ok: true };
  },

  async deleteByDate(date) {
    if (useMongo()) return mongoDelete(date);
    if (useSupabase()) return supabaseDelete(date);
    const db = readFileDB();
    db.entries = db.entries.filter(e => e.date !== date);
    writeFileDB(db);
    return { ok: true };
  }
};
