# Backend Deployment Guide

Your backend is a **Go Fiber** application that uses a **local BoltDB database** (`data/app.db`) and **local file uploads** (`uploads/`).

### ⚠️ Why NOT Vercel?
Vercel is designed for "Serverless" functions. It does not have a permanent file system. If you deploy this backend to Vercel:
1.  Your **database will be wiped** every time you deploy or the server sleeps.
2.  Your **uploaded files will be lost**.
3.  Vercel requires rewriting Go code into specific "Functions".

### ✅ Recommended: Render.com (or Railway/Fly.io)
These platforms support Docker and Persistent Disks.

## Step 1: Push to GitHub
1.  Create a new repository on GitHub.
2.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## Step 2: Deploy to Render
1.  Sign up at [render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Render will automatically detect the `Dockerfile` in the `backend` folder.
    *   **Root Directory:** `backend` (Important!)
5.  **Plan:** Free (or Starter if you need the disk).

## Step 3: Add Persistence (Crucial!)
To keep your database and uploaded files safe:
1.  In Render Dashboard, go to **Disks**.
2.  Add a new Disk.
    *   **Mount Path:** `/root/data` (matches your Dockerfile)
    *   **Size:** 1GB (or more)
3.  Attach this disk to your Web Service.

## Step 4: Connect Frontend
Once Backend is deployed, copy its URL (e.g., `https://neon-voice-backend.onrender.com`).
1.  Update your Frontend environment variable or `api.ts` to point to this new URL.
2.  Redeploy Frontend to Vercel.
