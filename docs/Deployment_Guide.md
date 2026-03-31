# CodeCash Deployment Guide & Troubleshooting

You encountered two specific errors while attempting to host CodeCash on Netlify. Here is a breakdown of why they happened and the exact steps to fix them so your application is fully live and functional.

---

## Issue 1: "Login Failed" on the Live Site

The core of this problem is that **Netlify only hosts your frontend (React)**. 

When you test the app on your computer, your React app successfully communicates with your local Node.js Express server running on `http://localhost:5000`. However, when you host the React app on Netlify, it's still trying to "talk" to `localhost:5000` inside your phone or computer, which doesn't exist out there, or the browser blocks it due to strict Mixed Content & CORS security policies. The `fetch` crashes, the Firebase OTP trigger fails, and the UI vaguely falls back to saying `"Login failed"`.

### The Fix

You must deploy your Node.js `backend` folder to a platform that supports persistent servers. Netlify does not support this native Node setup; it exclusively serves the `dist/` folder.

1. **Deploy the Backend (e.g., Render or Railway)**
   - Create an account on [Render.com](https://render.com/).
   - Create a new "Web Service" and link your GitHub repository.
   - For the **Root Directory**, set it to `backend`.
   - For the **Build Command**, set it to `npm install`.
   - For the **Start Command**, set it to `npm start`.
   - Copy all of your backend environment variables from your local `backend/.env` file into Render's Environment Variables panel.
   
2. **Link Frontend to Backend**
   - Once Render finishes building, it will give you a live URL (e.g., `https://codecash-backend.onrender.com`).
   - Go to your CodeCash setup on **Netlify**.
   - Navigate to **Site configuration > Environment variables**.
   - Add a new variable named `VITE_BACKEND_URL` and set its value to your new Render URL: `https://codecash-backend.onrender.com`.
   - Trigger a re-deploy in Netlify. Your login functionality will be restored instantly!

---

## Issue 2: Netlify Build Failing on `"Reading and parsing configuration files"`

This error typically implies that Netlify attempted to load a configuration file that was either malformed, misdirected, or had syntactic issues. Netlify looks for a `netlify.toml` file to understand how to build and route a website. 

### The Fix

I have automatically resolved this for you by creating a pristine `netlify.toml` file in your root CodeCash directory with the following contents:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
This file enforces standard Vite build rules (`npm run build`) and correctly points the output folder (`dist`). Most importantly, it institutes a React Router fallback (`/*` mapping to `/index.html`), preventing subsequent "404 Not Found" errors on Netlify when users try to refresh their browser on nested pages like `/dashboard`. 

#### Next Steps:
1. Stage, commit, and push this new `netlify.toml` file to GitHub using your terminal. This will resolve the configuration crashing issue on Netlify:
```bash
git add netlify.toml
git commit -m "chore: adding Netlify explicit routing configs"
git push
```
2. Proceed with hosting the backend!
