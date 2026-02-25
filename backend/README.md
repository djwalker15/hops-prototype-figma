# H.O.P.S. FastAPI Backend

Python 3.11+ FastAPI backend replacing the Supabase/Hono.js server.

## Setup

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set DATABASE_URL
```

### DATABASE_URL

**Existing Supabase DB** (direct connection, not the pooler):
```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```
Find this in Supabase → Project Settings → Database → "Direct connection".

**Local Postgres:**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hops_dev
```

## Database Migrations

### Against an existing Supabase database (tables already exist)
```bash
# Mark the current schema as revision 0001 — does NOT run any DDL
alembic stamp head
```

### Against a fresh local database
```bash
alembic upgrade head
```

## Running the server

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

## Seeding

On first start, the frontend calls `POST /seed` automatically (gated by localStorage).
You can also trigger it manually:

```bash
curl -X POST http://localhost:8000/seed
# Force clear + reseed:
curl -X POST http://localhost:8000/reseed
```
