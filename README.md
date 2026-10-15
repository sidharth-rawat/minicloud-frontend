# MiniCloud — Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

Developer-tool style dashboard for **MiniCloud** (a mini Heroku/Railway-style
deployment platform). Vite + React 18 + TypeScript, plain CSS.

**🔌 Backend:** [minicloud-backend](https://github.com/sidharth-rawat/minicloud-backend) · [System Design](https://github.com/sidharth-rawat/minicloud-backend/blob/main/SYSTEM_DESIGN.md) · [Deploy guide](https://github.com/sidharth-rawat/minicloud-backend/blob/main/DEPLOY.md)

## Features

Auth (JWT) · projects dashboard · deployment history · terminal-style log
viewer · live polling while `DEPLOYING` · retry / rollback · color-coded status
badges · responsive dark UI.

## Quick start

```bash
npm install
cp .env.example .env          # VITE_API_URL (default http://localhost:4000)
npm run dev                   # http://localhost:5173
```

Scripts: `dev` · `build` (type-check + production build) · `preview`.
