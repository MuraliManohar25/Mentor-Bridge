from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
from app.db.session import engine
from app.db.init_db import init_db
from app.api.routes import router
from app.api.auth import router as auth_router
from app.api.alumni import router as alumni_router
from app.api.mentorship import router as mentorship_router
from app.api.admin import router as admin_router


# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    
    Startup:
    - Initialize database connection
    - Create tables if they don't exist
    
    Shutdown:
    - Close database connections gracefully
    """
    # Startup
    print(f"🚀 Starting {settings.APP_NAME}...")
    await init_db(engine)
    print(f"✅ {settings.APP_NAME} is ready!")
    
    yield
    
    # Shutdown
    print(f"🛑 Shutting down {settings.APP_NAME}...")
    await engine.dispose()
    print(f"✅ {settings.APP_NAME} shutdown complete")


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Alumni Management Platform - Connecting students, alumni, and administrators",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 Not Found errors."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "detail": "Resource not found",
            "path": str(request.url.path)
        }
    )


@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc):
    """Handle 500 Internal Server errors."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred. Please try again later."
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )


# Include API routes
app.include_router(router, prefix="/api", tags=["api"])
app.include_router(auth_router, prefix="/api", tags=["authentication"])
app.include_router(alumni_router, prefix="/api", tags=["alumni"])
app.include_router(mentorship_router, prefix="/api", tags=["mentorship"])
app.include_router(admin_router, prefix="/api", tags=["admin"])


@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

