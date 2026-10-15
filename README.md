# MiniCloud — Frontend

A developer-tool style frontend for **MiniCloud**, a mini Heroku/Railway-style
deployment platform. Built with Vite + React 18 + TypeScript and plain CSS.

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
