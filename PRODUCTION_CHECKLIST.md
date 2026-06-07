# Mentor Bridge Production Checklist

Use this checklist to move from demo mode to a real deployment.

## Supabase database setup

1. Go to [supabase.com](https://supabase.com) → **New project** (pick a region close to your Render API).
2. Open **Project Settings → Database**.
3. Under **Connection string**, choose **URI** and **Session pooler** (port **5432**).
4. Copy the URI and replace `[YOUR-PASSWORD]` with your database password.
5. Ensure the URL uses the async driver prefix:
   - If it starts with `postgresql://`, the app auto-converts it to `postgresql+asyncpg://`.
6. Run migrations once (from your machine or let Render build do it):

```bash
cd backend
# paste your Supabase URI into .env as DATABASE_URL, then:
alembic upgrade head
```

7. In **Render Dashboard → mentor-bridge-api → Environment**, set:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

8. **Save** and trigger a **Manual Deploy** on the API service.

Tables created by migrations: `users`, `profiles`, `mentorship_requests`, `jobs`, `events`, `announcements`, and related indexes.

## Required environment

Backend:

```env
APP_NAME=Mentor Bridge
DEBUG=False
AUTO_CREATE_TABLES=False
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://your-frontend-domain.onrender.com
```

Frontend (set in Render static site env or `frontend/.env` for local builds):

```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
VITE_WS_URL=your-backend-domain.onrender.com
```

## Local PostgreSQL stack

```bash
docker compose up --build
```

Frontend: http://localhost:5173

Backend: http://localhost:8000

API docs: http://localhost:8000/docs

## Database migrations

Run migrations before starting production when `AUTO_CREATE_TABLES=False`:

```bash
cd backend
alembic upgrade head
```

Create a new migration after changing SQLAlchemy models:

```bash
cd backend
alembic revision --autogenerate -m "describe change"
```

## Launch blockers to finish next

- Email verification and password reset provider.
- File/avatar storage through S3, Cloudinary, or Supabase Storage.
- Admin seed command for creating the first verified admin.
- Audit logs for admin verification decisions.
- Deployment-specific secrets, backups, monitoring, and HTTPS.
