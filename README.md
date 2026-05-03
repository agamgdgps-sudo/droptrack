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
