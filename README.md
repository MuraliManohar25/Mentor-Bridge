# 🎓 GradConnect - Alumni Management Platform

A comprehensive Alumni Management Platform built with **FastAPI** (async backend), **React** (TypeScript frontend), and **PostgreSQL**. Designed for educational institutions to manage alumni networks, mentorship programs, events, jobs, donations, and community engagement.

## 🏗️ Architecture

### Technology Stack

- **Backend**: FastAPI with async/await, SQLAlchemy 2.0 (async), asyncpg driver
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: PostgreSQL 15 with UUID primary keys
- **WebSocket**: Real-time notifications with ConnectionManager
- **Infrastructure**: Docker Compose for local development

### Project Structure

```
GradConnect/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Configuration
│   │   ├── db/           # Database setup
│   │   ├── models/       # SQLAlchemy models
│   │   ├── services/     # Business logic
│   │   ├── websockets/   # WebSocket manager
│   │   └── main.py       # FastAPI application
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # Context providers
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed
- Git

### Running with Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aswithadari/GradConnect.git
   cd GradConnect
   ```

2. **Start all services**
   ```bash
   docker-compose up
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Running Locally (Without Docker)

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run the server
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 👥 User Roles

The platform supports three stakeholder roles:

- **Admin**: Platform administrators with full access
- **Alumni**: Graduated students who can mentor and engage
- **Student**: Current students seeking mentorship and opportunities

## 🔌 WebSocket Features

Real-time notifications powered by FastAPI WebSocket:

- User-specific message broadcasting
- Multiple simultaneous connections per user
- Auto-reconnect on connection loss
- System-wide announcements

### WebSocket Connection Example

```javascript
const ws = new WebSocket('ws://localhost:8000/api/ws/USER_UUID');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Notification:', data);
};
```

## 📡 API Endpoints

### Health Check
```bash
GET /api/health
```

### WebSocket
```bash
WS /api/ws/{user_id}
```

## 🗄️ Database Schema

### User Model

- **id**: UUID (primary key)
- **email**: String (unique)
- **hashed_password**: String
- **role**: Enum (admin, alumni, student)
- **full_name**: String
- **phone**: String (optional)
- **is_active**: Boolean
- **is_verified**: Boolean
- **created_at**: DateTime
- **updated_at**: DateTime

## 🛠️ Development

### Backend Development

```bash
# Run tests
pytest

# Format code
black app/

# Type checking
mypy app/
```

### Frontend Development

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec db psql -U gradconnect -d gradconnect_db
```

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql+asyncpg://user:password@db:5432/gradconnect_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173
DEBUG=True
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=localhost:8000
```

## 📚 Future Enhancements

- [ ] Authentication & JWT tokens
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] File upload support
- [ ] Advanced search and filtering
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Smart India Hackathon (SIH) initiative.

## 🙏 Acknowledgments

- FastAPI for the amazing async framework
- React team for the powerful UI library
- PostgreSQL for reliable data storage
