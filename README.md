# Veritas - Local Run

## Start backend (from `veritas/`)

```bash
docker compose -f docker-compose.dev.yml up --build
```

## Start frontend (from `webexpo_stalkili/`)

```bash
npm install
npm run dev
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:8000`

## Stop backend

```bash
docker compose -f docker-compose.dev.yml down
```
