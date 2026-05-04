// Usage: set SUPABASE_URL and SUPABASE_KEY then run
// node scripts/migrate-to-supabase.js

const fs = require('fs');
const path = require('path');

async function migrate() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_KEY in env');
    process.exit(1);
  }

  const DB_PATH = path.join(__dirname, '..', 'server', 'data', 'db.json');
  let db;
  try { db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch (e) { console.error('no local db.json found'); process.exit(1); }
  const entries = db.entries || [];
  console.log('Migrating', entries.length, 'entries to Supabase...');

  for (const entry of entries) {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/entries?on_conflict=date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}`, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(entry)
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to insert', entry.date, res.status, text);
    } else {
      console.log('Inserted', entry.date);
    }
  }
  console.log('Done.');
}

migrate().catch(e => { console.error(e); process.exit(1); });
