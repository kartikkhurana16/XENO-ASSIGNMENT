# Free Temporary Deployment (10–20 days)

Deploy both frontend and backend on **Render** (free tier) with auto-generated URLs like:

- Frontend: `https://xeno-frontend-xxxx.onrender.com`
- Backend: `https://xeno-backend-xxxx.onrender.com`

No credit card required for the free tier.

---

## Before you deploy

1. Push this repo to GitHub (if not already).
2. The repo includes `render.yaml`, which wires frontend ↔ backend URLs automatically.

---

## Deploy on Render (~10 minutes)

1. Go to [dashboard.render.com](https://dashboard.render.com) and sign up (GitHub login works).
2. Click **New** → **Blueprint**.
3. Connect the `XENO-ASSIGNMENT` GitHub repo.
4. Render detects `render.yaml` and shows two services:
   - `xeno-backend` (Node.js API + WebSockets)
   - `xeno-frontend` (Vite/React static site)
5. Click **Apply** and wait for both builds to finish (~5–8 min first time).
6. Open the **xeno-frontend** service → copy its **URL**. That is your app link.

### If the first deploy fails (circular env vars)

Render sometimes needs a second deploy after both services exist:

1. Open **xeno-backend** → **Environment** → confirm `CLIENT_URL` points to the frontend URL.
2. Open **xeno-frontend** → **Environment** → confirm `VITE_API_URL` points to the backend URL.
3. If either is empty, set manually:
   - Backend `CLIENT_URL` = `https://<your-frontend>.onrender.com`
   - Frontend `VITE_API_URL` = `https://<your-backend>.onrender.com`
4. **Manual Deploy** → **Deploy latest commit** on both services.

---

## Free tier limits (fine for a demo)

| Limit | Impact |
|-------|--------|
| Spins down after ~15 min idle | First request after idle takes ~30–60 s to wake up |
| ~750 instance-hours/month | Enough for ~15–20 days with both services running |
| Ephemeral disk | Uploaded/processed files are lost on restart (OK for demos) |
| Auto URL only | Custom domain is optional/paid |

---

## Alternative: Vercel (frontend) + Render (backend)

Use this if you prefer a faster frontend CDN.

### 1. Backend on Render

1. **New** → **Web Service** → connect repo.
2. **Root directory:** `backend`
3. **Build command:** `npm ci`
4. **Start command:** `npm start`
5. **Environment variables:**
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = *(set after frontend deploy)* `https://your-app.vercel.app`
6. Deploy and copy the backend URL.

### 2. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import repo.
2. **Root directory:** `verifier`
3. **Environment variable:**
   - `VITE_API_URL` = `https://<your-backend>.onrender.com`
4. Deploy → copy the Vercel URL.
5. Go back to Render backend → set `CLIENT_URL` to the Vercel URL → redeploy backend.

---

## Verify it works

1. Open the frontend URL.
2. Upload one of the sample CSVs from `backend/sample-orders.csv`.
3. Watch job status update (WebSocket).
4. Download the cleaned output file.

Backend health check: `https://<backend-url>/` should return `{"success":true,"message":"Server Running"}`.

---

## Tear down when done

Render dashboard → each service → **Settings** → **Delete Web Service**.

This stops billing risk and frees the free-tier hours.
