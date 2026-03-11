# Bookkeeper Web (modern app)

This folder contains the modernized Electronic Book Keeper: a web app that runs locally with PostgreSQL in Docker. It does not modify any of the original VB6 project files in the parent directory.

## Structure

- **`docker-compose.yml`** – PostgreSQL 16 (run from `web` folder).
- **`backend/`** – Node.js + Express + TypeScript + Prisma API.
- **`frontend/`** – React + Vite + TypeScript UI.

## Run locally

### 1. Start PostgreSQL

From the **`web`** folder:

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd web/backend
cp .env.example .env
# Edit .env if needed (default DATABASE_URL is for the Docker Postgres above)
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Default admin login: **admin** / **admin**. Change via `ADMIN_USERNAME` and `ADMIN_PASSWORD` when running the seed, or in `.env` for the seed script.

### 3. Frontend

In another terminal:

```bash
cd web/frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server proxies `/api` to the backend.

## Summary

- All new files live under **`web/`**; your original VB6 files (e.g. `bk.vbp`, `bk.Frm`, `login.Frm`, etc.) are unchanged.
- Database: PostgreSQL in Docker; connection string in `web/backend/.env`.
- First user: create an admin via seed (`npm run db:seed` in `web/backend`), then log in and use “User admin” to add more users.
