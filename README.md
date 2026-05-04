# DropTrack

Personal JEE study tracker. This repo was refactored to separate CSS/JS and includes a minimal Express server for optional remote persistence.

Quick start (install dependencies):

```bash
# install frontend dev deps
npm install

# install server deps
cd server && npm install
cd ..

# run dev frontend server
npm run dev

# run server in separate terminal
node server/index.js
```

Notes:
- Frontend served by Vite. The app will try to sync with `http://localhost:4000` when you login using the passcode defined in `server/.env.example` (set `PASSCODE` and `JWT_SECRET` in a `.env`).
- Default single-user passcode for this project: `0101`. Change it in `server/.env` if you want a different passcode.

Vercel deployment notes
- This repo now includes serverless API routes under `/api/*` so you can deploy frontend + API together on Vercel. The frontend calls `/api` by default.
- IMPORTANT: Serverless functions have ephemeral filesystem — the current implementation stores data in `server/data/db.json`, which will not persist reliably on Vercel. For production you should configure an external database (Postgres, MySQL, Redis, or a hosted document DB) and update the API handlers to use it.
- Set the following Environment Variables in your Vercel project settings:
	- `PASSCODE` (default `0101`)
	- `JWT_SECRET` (a secure random string)

Deploy steps:
1. Commit and push your branch to the Git provider connected to Vercel.
2. In Vercel, import the project and set the Environment Variables.
3. Vercel will build and deploy the site. The site will be available at your Vercel URL and will call `/api` for auth and entries.

If you want me to convert the API to use a hosted DB (and wire up migrations), tell me which provider you prefer and I’ll implement it.
- To enable server auth use the Login / Sync button in the UI and enter the passcode.

Supabase integration (prepared)
 - This repo includes a Supabase-ready adapter and a migration script.
 - The API will use Supabase when the following env vars are set in Vercel or locally:
	 - `SUPABASE_URL`
	 - `SUPABASE_KEY` (service role or anon key depending on your table policies)
 - To migrate existing local data to Supabase:
	 1. Create a table named `entries` in Supabase with a `date` primary key and a JSONB column for the rest of the entry, or mirror the shape used in `server/data/db.json`.
	 2. Set `SUPABASE_URL` and `SUPABASE_KEY` in your environment (locally or in Vercel project settings).
	 3. Run: `node scripts/migrate-to-supabase.js`
 - Note: you must create the `entries` table and set appropriate Row Level Security policies (or use a service key) before migration will succeed.
# set env locally or in CI then:
