// Usage: MONGODB_URI="..." node scripts/migrate-to-mongo.js

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('Set MONGODB_URI env var'); process.exit(1); }
  const DB_PATH = path.join(__dirname, '..', 'server', 'data', 'db.json');
  let db;
  try { db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch (e) { console.error('no local db.json found'); process.exit(1); }
  const entries = db.entries || [];
  if (entries.length === 0) { console.log('No entries to migrate.'); return; }

  const client = new MongoClient(uri);
  await client.connect();
  try {
    const database = client.db();
    const col = database.collection('entries');
    for (const entry of entries) {
      await col.updateOne({ date: entry.date }, { $set: entry }, { upsert: true });
      console.log('Upserted', entry.date);
    }
    console.log('Migration complete.');
  } finally {
    await client.close();
  }
}

migrate().catch(e=>{ console.error(e); process.exit(1); });
