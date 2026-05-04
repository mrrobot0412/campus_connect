# Campus Connect: Backend Deployment Guide (Render)

Follow these steps to deploy your backend from "ground zero" to Render and connect it to your Vercel frontend.

---

## 🏗 Phase 1: External Infrastructure (Prerequisites)

You need these two services live before you can start the backend.

### 1. MongoDB Atlas (Database)
- **Create Cluster:** Use the free "M0" tier.
- **Network Access:** Go to "Network Access" and click **"Allow Access from Anywhere"** (IP `0.0.0.0/0`).
- **Database User:** Create a user (e.g., `admin`) and save the password.
- **Connection String:** Click "Connect" -> "Drivers". Copy the string:


### 2. Upstash Redis (OTP Queue)
- **Create DB:** Create a new database on [Upstash](https://upstash.com/).
- **Copy URL:** Copy the **Redis Connect String** (starts with `rediss://...`).

---

## 🚀 Phase 2: Render Configuration

1. **New Web Service:** Connect your GitHub repo.
2. **Root Directory:** `backend` (⚠️ **CRITICAL**)
3. **Runtime:** `Node`
4. **Build Command:** `npm install`
5. **Start Command:** `node index.js`

---

## 🔑 Phase 3: Environment Variables (Render Dashboard)

Add these keys in the **Environment Variables** tab of your Render service:

| Key | Value |
| :--- | :--- |
| `MONGOURI` | Your MongoDB Atlas connection string |
| `REDIS_URL` | Your Upstash Redis URL |
| `JWT_SECRET` | Any long random string |
| `gmail_key` | Your 16-character Google App Password |
| `FRONTEND_URLS` | Your deployed frontend URL, comma-separated if needed |
| `NODE_ENV` | `production` |
| `PORT` | Leave unset unless your host requires a manual value |

---

## 🔗 Phase 4: Connecting to Vercel (The Handshake)

Once Render shows your service as **"Live"**:

1. **Copy Render URL:** (e.g., `https://campus-connect-api.onrender.com`).
2. **Update Vercel:**
   - Go to your Vercel Project -> **Settings** -> **Environment Variables**.
   - Find `VITE_API_URL`.
   - Change the value from `http://localhost:8000` to your **Render URL**.
   - *Note: Do NOT add a trailing slash `/` at the end.*
3. **Redeploy:**
   - Go to the **Deployments** tab in Vercel.
   - Click the three dots `...` on your latest deployment and select **"Redeploy"**.
   - This ensures the frontend "bakes in" the new production backend URL.

---

## ✅ Final Check
- Visit your Vercel URL.
- Try to register or search.
- If it works, your full-stack application is officially live!
