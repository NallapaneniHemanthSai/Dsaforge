# DSAForge ⚡

"Forge your DSA skills. One problem at a time."

A complete, production-grade full-stack web application built exclusively for KL University students to track, practice, and master Data Structures and Algorithms.

## Features
- **Integrated DSA Sheets**: Striver A2Z, NeetCode 150, Blind 75, Love Babbar.
- **Built-in Editor**: Write and run Java code directly in the browser via Monaco and Judge0 (RapidAPI).
- **Progress Tracking**: Heatmaps, streaks, topic breakdowns, and weekly goals.
- **Secure Auth**: OTP-based email verification (only for `@kluniversity.in` / `@klu.ac.in`), JWT access & refresh tokens, password strength validation.
- **Leaderboard**: Compete with peers globally, weekly, or monthly.
- **Notes System**: Built-in rich text auto-saving notes.
- **UI/UX**: Vercel/Linear inspired design with Tailwind, Glassmorphism, and seamless Light/Dark mode.

## Tech Stack
**Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Monaco Editor, Lucide React, Axios.  
**Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose, Nodemailer (HTML Templates), JWT, express-rate-limit, Helmet.  

---

## Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI
- Gmail account with an App Password generated for sending emails
- RapidAPI Judge0 CE API Key (for the code editor)

### 2. Backend Setup
1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   **Required .env variables**:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`: Random secure strings
   - `GMAIL_USER`: Your KL email
   - `GMAIL_APP_PASSWORD`: Your 16-character Google app password
   - `FRONTEND_URL`: `http://localhost:5173`

4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open another terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

### 4. Application Configuration
- Go to `http://localhost:5173` in your browser.
- Sign up using a `.kluniversity.in` or `.klu.ac.in` email.
- Enter the OTP sent to your email.
- Once inside, navigate to **Settings** and add your RapidAPI Judge0 key to enable code execution.

---

## Deployment (Production)
- **Frontend**: Deploy `frontend/` to **Vercel**. Set the Build Command to `npm run build` and Output to `dist`. Add `VITE_API_URL` to env vars.
- **Backend**: Deploy `backend/` to **Render** or Railway. Add all `.env` variables to the platform settings. Set `NODE_ENV=production`. Make sure to configure CORS allowed origins correctly.

