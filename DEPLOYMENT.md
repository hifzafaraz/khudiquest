# Khudi Quest - Vercel Deployment & Testing Guide

This project is configured so that **Backend** and **Frontend** can be deployed independently as **two separate projects on Vercel**.

---

## Architecture Overview

```
khudi-quest/
├── backend/                  --> Deployed to Vercel as Standalone API Project
│   ├── api/index.js          --> Vercel Serverless Function entry point
│   ├── vercel.json           --> Serverless rewrite rules
│   ├── server.js             --> Express server & route definitions
│   ├── db.js                 --> Hybrid datastore (works locally & in Vercel /tmp)
│   ├── test-api.js           --> Automated integration test suite
│   └── routes/               --> /api/auth and /api/tasks
│
└── frontend/                 --> Deployed to Vercel as Standalone Vite SPA Project
    ├── vercel.json           --> SPA fallback rewrites (/index.html)
    ├── src/config/api.js     --> Dynamic API configuration (uses VITE_API_URL)
    └── vite.config.js        --> Production build setup
```

---

## Step 1: Deploy the Backend on Vercel

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Select your Git repository containing Khudi Quest.
4. In the project setup screen:
   - **Project Name**: `khudi-quest-backend` (or your choice)
   - **Root Directory**: Click **Edit** and choose **`backend`**
   - **Framework Preset**: Choose **Other**
   - **Build & Output Settings**: Leave defaults (no build command needed)
5. Expand **Environment Variables** and add:
   - `JWT_SECRET`: A secure random string (e.g. `khudi_quest_secure_jwt_secret_key_2026`)
   - `FRONTEND_URL`: `https://your-frontend-project.vercel.app` (you can update this after Step 2)
   - *(Optional)* `EMAIL_USER`: Your Gmail address for password reset emails
   - *(Optional)* `EMAIL_PASS`: Your Gmail App Password
   - *(Optional)* `MONGODB_URI`: If you want remote MongoDB Atlas database storage
6. Click **Deploy**.
7. Once deployed, copy your backend URL:
   `https://khudi-quest-backend.vercel.app`
8. Verify it works by opening in your browser:
   `https://khudi-quest-backend.vercel.app/api/health`
   You should see:
   ```json
   {
     "status": "operational",
     "service": "Khudi Quest Backend API"
   }
   ```

---

## Step 2: Deploy the Frontend on Vercel

1. In your [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** -> **Project**.
2. Select the same Git repository.
3. In the project setup screen:
   - **Project Name**: `khudi-quest-frontend` (or your choice)
   - **Root Directory**: Click **Edit** and choose **`frontend`**
   - **Framework Preset**: Vercel will auto-detect **Vite**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your deployed backend URL from Step 1 (e.g. `https://khudi-quest-backend.vercel.app`)
5. Click **Deploy**.
6. When deployment finishes, your frontend will be live at:
   `https://khudi-quest-frontend.vercel.app`

---

## Step 3: Link the Two Deployments

1. Go back to your **Backend Project** in Vercel.
2. Go to **Settings** -> **Environment Variables**.
3. Set or update `FRONTEND_URL` to your actual frontend Vercel URL (e.g. `https://khudi-quest-frontend.vercel.app`).
4. Click **Redeploy** on the latest backend deployment so the environment variable takes effect.

Now, both frontend and backend are running independently on Vercel and communicating seamlessly with full CORS support!

---

## Local Development & Testing

### Run Backend Locally:
```bash
cd backend
npm install
npm test       # Runs the automated 9-point integration test suite
npm run dev    # Starts API on http://localhost:5000
```

### Run Frontend Locally:
```bash
cd frontend
npm install
npm run dev    # Starts Vite dev server on http://localhost:5173
```
