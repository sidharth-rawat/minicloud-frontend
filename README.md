# MiniCloud — Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

A developer-tool style frontend for **MiniCloud**, a mini Heroku/Railway-style
deployment platform. Built with Vite + React 18 + TypeScript and plain CSS.

**🔗 Live demo:** https://app.3.110.222.63.sslip.io · login `demo@minicloud.local` / `password123`
_(demo box — may be offline to save cost.)_

**🔌 Backend (API + worker):** [minicloud-backend](https://github.com/sidharth-rawat/minicloud-backend) — see its [System Design](https://github.com/sidharth-rawat/minicloud-backend/blob/main/SYSTEM_DESIGN.md).

## Features

- JWT auth (register / login / logout) with a React auth context
- Projects dashboard (create, list, delete)
- Project detail with a "New deployment" form and a live deployment history table
- Deployment detail with a terminal-style log viewer
- Auto-refresh polling while a deployment is `DEPLOYING`
  (project table every 4s, logs every 3s)
- Color-coded status badges (SUCCESS / ERROR / DEPLOYING / IDLE)
- Responsive, dark, mobile-friendly layout

## Requirements

- Node 20+ (Node 24 recommended)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure the API base URL
cp .env.example .env
# edit .env if your backend is not on http://localhost:4000

# 3. Run the dev server (http://localhost:5173)
npm run dev
```

## Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the Vite dev server                |
| `npm run build`   | Type-check and build for production      |
| `npm run preview` | Preview the production build locally      |

## Environment variables

| Variable       | Default                 | Description               |
| -------------- | ----------------------- | ------------------------- |
| `VITE_API_URL` | `http://localhost:4000` | Base URL of the backend API |

## Auth model

- On login, the API returns `{ ...user, token }`. The token is stored in
  `localStorage` and sent as `Authorization: Bearer <token>` on every
  authenticated request.
- Any `401`/`403` response clears the token and redirects to `/login`.
- Registration does **not** return a token; after registering you are sent to
  the login page.

## Project structure

```
src/
  api.ts                 # fetch wrapper + typed API client
  auth.tsx               # AuthProvider / useAuth
  types.ts               # shared TypeScript types
  utils.ts               # formatting + validation helpers
  App.tsx                # routes
  main.tsx               # entry point
  styles.css             # single global stylesheet
  components/
    Nav.tsx
    ProtectedRoute.tsx
    StatusBadge.tsx
  pages/
    Login.tsx
    Register.tsx
    Dashboard.tsx
    ProjectDetail.tsx
    DeploymentDetail.tsx
```
