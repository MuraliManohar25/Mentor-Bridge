# Mentor Bridge Production Checklist

Use this checklist to move from demo mode to a real deployment.

## Required environment

Backend:

```env
APP_NAME=Mentor Bridge
DEBUG=False
AUTO_CREATE_TABLES=False
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/DB_NAME
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://your-frontend-domain.com
```

Frontend:

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_WS_URL=your-backend-domain.com
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
