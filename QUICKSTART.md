# GradConnect - Quick Start Commands

## 🚀 Getting Started

### Option 1: Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

### Option 2: Local Development

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🧪 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:8000/api/health
```

### 2. WebSocket Test (Browser Console)
```javascript
const ws = new WebSocket('ws://localhost:8000/api/ws/123e4567-e89b-12d3-a456-426614174000');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (event) => console.log('Message:', JSON.parse(event.data));
ws.send('Hello from client!');
```

### 3. Database Access
```bash
docker-compose exec db psql -U gradconnect -d gradconnect_db
```

---

## 📦 Useful Commands

### Docker
```bash
# Rebuild containers
docker-compose up --build

# Remove volumes (fresh start)
docker-compose down -v

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec db psql -U gradconnect -d gradconnect_db
```

### Backend
```bash
# Format code
black app/

# Run linter
flake8 app/

# Type checking
mypy app/
```

### Frontend
```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎯 Next Development Steps

1. **Authentication System**
   - JWT token generation
   - Login/Register endpoints
   - Password hashing with bcrypt

2. **User Management**
   - CRUD operations for users
   - Profile management
   - Role-based permissions

3. **Real-time Features**
   - Notification system
   - Live updates
   - Chat functionality

4. **Database Migrations**
   ```bash
   cd backend
   alembic init alembic
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Docker Issues
```bash
# Clean up Docker
docker system prune -a

# Reset volumes
docker-compose down -v
docker volume prune
```

### Frontend Dependencies
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation Links

- FastAPI Docs: https://fastapi.tiangolo.com/
- SQLAlchemy Async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- React Router: https://reactrouter.com/
- Vite: https://vitejs.dev/
- TanStack Query: https://tanstack.com/query/latest
