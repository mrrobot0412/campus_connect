# Campus Connect - Deployment Guide

## Overview

This guide deploys Campus Connect to:
- **Backend**: Render (Node.js web service)
- **Frontend**: Vercel (React/Vite static site)

---

## Step 1: Prepare Repository

### 1.1 Create `.env` file for backend
Copy `.env.example` to `.env` and fill in your actual values:
```bash
cd backend
cp .env.example .env
# Edit .env with your actual MongoDB URI, JWT secret, Gmail credentials
```

### 1.2 Create `.env` file for frontend
```bash
cd testauto-main
cp .env.example .env
# For production, set VITE_API_URL to your Render backend URL
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### 2.3 Add Environment Variables
In Render dashboard, add these environment variables:
| Name | Value |
|------|-------|
| `MONGOURI` | Your MongoDB connection string |
| `PORT` | `8000` |
| `JWT_SECRET` | Your secret key |
| `gmail_user` | Your Gmail address |
| `gmail_key` | Your Gmail app password |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` (after frontend deploy) |

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (~2-3 minutes)
3. Your backend will be live at: `https://your-app.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository
3. Configure:
   - **Root Directory**: `testauto-main`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variable
Add:
| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` |

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment (~1 minute)
3. Your frontend will be live at: `https://your-project.vercel.app`

---

## Step 4: Update Backend CORS (Important!)

After frontend is deployed, update backend CORS to allow your frontend domain.

In `backend/index.js`, modify the CORS configuration:
```javascript
const cors = require("cors");

app.use(cors({
  origin: ["https://your-frontend.vercel.app", "http://localhost:5173"],
  credentials: true
}));
```

Then redeploy backend on Render.

---

## Step 5: Update Frontend API URL

In frontend `.env`, update:
```
VITE_API_URL=https://your-backend.onrender.com
```

Push to trigger auto-deploy on Vercel.

---

## Step 6: Verify Deployment

### Test Backend
```bash
curl https://your-backend.onrender.com/test
# Should return: {"message":"server is running"}
```

### Test Frontend
1. Open https://your-frontend.vercel.app
2. Try logging in
3. Check browser console for any API errors

---

## GitHub Actions CI/CD (After Initial Deployment)

Once manual deployment works, we'll add GitHub Actions to:
1. Run lint/tests on every push
2. Auto-deploy backend to Render on main branch push
3. Auto-deploy frontend to Vercel on main branch push

See `.github/workflows/` directory for workflow files.

---

## Troubleshooting

### Backend not responding
- Check Render logs for errors
- Verify environment variables are set correctly
- Check MongoDB URI is whitelisted (Atlas IP whitelist if using Atlas)

### Frontend API calls failing
- Verify `VITE_API_URL` points to correct backend URL
- Check browser network tab for CORS errors
- Ensure backend CORS allows your Vercel domain

### Email not sending
- Verify Gmail app password is correct (not regular password)
- Check Gmail security settings (allow less secure apps or use App Password)
- Gmail may block if too many emails sent quickly

---

## Free Tier Limits

### Render
- 750 hours/month free
- Sleeps after 15 min inactivity (cold start ~30s)
- OK for low-traffic student project

### Vercel
- Unlimited requests on free tier
- 100GB bandwidth/month
- Excellent for React apps

---

## Estimated Cost (Free Tier Usage)

| Service | Cost |
|---------|------|
| Backend (Render) | $0 |
| Frontend (Vercel) | $0 |
| MongoDB Atlas | $0 (free tier) |
| Email (Gmail) | $0 |
| **Total** | **$0/month** |

For a student project, this setup works great. When you scale, consider paid tiers.