# 🚀 Production Deployment Guide

This guide provides step-by-step instructions for deploying the **College Voting System** to production.

---

## 🏗️ Architecture Overview

The system consists of:
1. **Frontend**: React 19 + Vite + Tailwind CSS.
2. **Backend**: Node.js + Express 5 REST API.
3. **Database**: MySQL 8.0+ (14 relational tables).
4. **Email Service**: Brevo (Sendinblue) transactional email API.

You can deploy the system using either:
- **Option A (Recommended & Simplest)**: Single Full-Stack Web Service on [Render](https://render.com) or [Railway](https://railway.app). The Express backend serves both the API and the compiled React frontend.
- **Option B (Decoupled)**: Frontend on [Vercel](https://vercel.com) / [Netlify](https://netlify.com) + Backend on [Render](https://render.com) / [Railway](https://railway.app).

---

## 🗄️ Step 1: Set Up Cloud MySQL Database

Your application requires a hosted MySQL database. Free and affordable cloud options:
- [Aiven for MySQL](https://aiven.io) (Free tier available)
- [Railway MySQL](https://railway.app) (Free trial credits available)
- [TiDB Cloud Serverless](https://tidbcloud.com) (Generous free tier, 100% MySQL compatible)

### Importing the Database Schema
Once your cloud database is provisioned:
1. Locate the connection details (Host, Port, User, Password, Database Name, or connection URL).
2. Import the schema file located at [`database/schema.sql`](./database/schema.sql):
   - **Using MySQL CLI**:
     ```bash
     mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> < database/schema.sql
     ```
   - **Using Aiven / Railway / Cloud Web Console**:
     Open the cloud provider's SQL query runner or web terminal, paste the contents of [`database/schema.sql`](./database/schema.sql), and execute.
   - **Using GUI tools (DBeaver, TablePlus, MySQL Workbench)**:
     Connect to your remote database, open `database/schema.sql`, and execute script.

---

## 📦 Option A: Single Web Service Deployment (Render)

This deploys the backend and frontend together on a single Render Web Service.

1. **Push your code to GitHub**:
   Ensure all changes are pushed to your GitHub repository.
2. **Create a New Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Web Service**.
   - Connect your GitHub repository.
3. **Configure the Service**:
   - **Name**: `college-voting-system`
   - **Region**: Choose closest to your users.
   - **Branch**: `main` (or `devlopment`)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
     ```
   - **Start Command**:
     ```bash
     node backend/server.js
     ```
4. **Configure Environment Variables**:
   Add the following in the **Environment** tab:
   | Variable | Value / Description |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (or leave default, Render sets this automatically) |
   | `DATABASE_URL` | *Your cloud MySQL connection URL* (or use individual `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | *Strong random string (e.g. 64 characters)* |
   | `JWT_EXPIRES_IN` | `1d` |
   | `BREVO_API_KEY` | *Your Brevo API Key* |
   | `BREVO_SENDER_EMAIL` | *Your verified sender email in Brevo* |
   | `BREVO_SENDER_NAME` | `College Voting System` |
5. Click **Create Web Service**.
6. When the build completes, visit your Render URL (e.g., `https://college-voting-system.onrender.com`).

---

## 🌐 Option B: Decoupled Deployment

### 1. Backend on Render / Railway
1. Create a Web Service pointing to the root of the repository.
2. Set:
   - **Build Command**: `npm install --prefix backend`
   - **Start Command**: `node backend/server.js`
3. Set the Environment Variables:
   - All database, JWT, and Brevo variables (same as in Option A).
   - `CLIENT_URL`: `https://your-frontend.vercel.app` (your Vercel/Netlify frontend URL).
   - `NODE_ENV`: `production`.

### 2. Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Select your repository.
3. In project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api` (URL of your deployed backend + `/api`).
5. Click **Deploy**. SPA routing rewrite is automatically handled by [`frontend/vercel.json`](./frontend/vercel.json).

### 2b. Frontend on Netlify (Alternative)
1. Go to [netlify.com](https://netlify.com) and click **Add new site** -> **Import an existing project**.
2. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Environment variables:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
4. Click **Deploy**. Netlify SPA redirects are pre-configured in [`frontend/public/_redirects`](./frontend/public/_redirects).

---

## 👑 Step 4: Initialize Super Admin

After deploying the database and backend, initialize the initial Super Admin account:

### Method 1: Run Remotely via Node
From your local terminal with production database environment variables set:
```bash
# In your local backend folder with production DB configured in .env:
node backend/createSuperAdmin.js
```

### Method 2: Run via Render Shell / Railway CLI
Open the Web Shell / Terminal in your cloud provider dashboard:
```bash
node backend/createSuperAdmin.js
```
Default initial credentials:
- **Email**: `superadmin@college.com`
- **Password**: `Admin@123`
*(Change the password immediately upon first login!)*

---

## 🩺 Step 5: Verification & Health Checks

Once deployed, verify:
1. **API Health Endpoint**:
   ```
   GET https://your-backend-domain.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "service": "college-voting-api",
     "timestamp": "2026-09-23T...",
     "uptime": 12.34
   }
   ```
2. **Database Connectivity Endpoint**:
   ```
   GET https://your-backend-domain.com/api/test-db
   ```
   Expected response:
   ```json
   {
     "message": "Database connected successfully",
     "result": [{ "result": 1 }]
   }
   ```
3. **Frontend Application**:
   Navigate to your frontend URL, test login with `superadmin@college.com`, and test page reloads across different routes (verifying SPA routing doesn't throw 404).

---

## 🔒 Security Checklist for Production

- [ ] Change default `JWT_SECRET` to a long, unpredictable random secret.
- [ ] Change the default `superadmin@college.com` password after initial login.
- [ ] Ensure `backend/.env` is never committed to GitHub (verified via `.gitignore`).
- [ ] Configure `BREVO_SENDER_EMAIL` using an authenticated domain in Brevo to prevent emails going to spam.
- [ ] Set `DB_SSL=true` on all production database connections.
