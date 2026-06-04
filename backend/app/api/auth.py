from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.db.session import get_db
from app.models.user import User, Profile
from app.schemas.user import (
    UserCreate,
    UserOut,
    UserWithProfile,
    LoginRequest,
    LoginResponse,
    Token
)
from app.core.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    decode_refresh_token
)
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Rate limiter for authentication endpoints
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    response: Response,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user and create their profile.
    
    Process:
    1. Check if email already exists
    2. Hash the password
    3. Create User record
    4. Create empty Profile record
    5. Return access and refresh tokens
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        LoginResponse with tokens and user data
        
    Raises:
        HTTPException 409: Email already registered
    """
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        # Generic error message for anti-enumeration
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Please check your information."
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role,
        phone=user_data.phone,
        is_active=True,
        is_verified=False
    )
    
    db.add(new_user)
    await db.flush()  # Flush to get the user ID
    
    # Create profile for the user with optional student fields
    new_profile = Profile(
        user_id=new_user.id,
        bio=None,
        avatar_url=None,
        graduation_year=user_data.graduation_year,  # Store graduation year if provided
        department=user_data.department,  # Store department if provided
        is_mentor=False,
        mentorship_expertise=[],
        interests=[]
    )
    
    db.add(new_profile)
    await db.commit()
    await db.refresh(new_user)
    await db.refresh(new_profile)
    
    # Load profile relationship
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(User.id == new_user.id)
    )
    user_with_profile = result.scalar_one()
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role.value})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    
    # Set refresh token as httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,  # Use secure only in production (HTTPS)
        samesite="strict",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserWithProfile.model_validate(user_with_profile)
    )


@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return JWT tokens.
    
    Process:
    1. Find user by email
    2. Verify password
    3. Check if user is active
    4. Generate and return tokens
    
    Args:
        credentials: Login credentials (email, password)
        db: Database session
        
    Returns:
        LoginResponse with tokens and user data
        
    Raises:
        HTTPException 401: Invalid credentials
        HTTPException 403: Inactive account
    """
    # Find user by email
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    # Verify user exists and password is correct - Generic error for anti-enumeration
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify role matches the selected role
    if user.role != credentials.role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials for the selected role",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support."
        )
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Set refresh token as httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,  # Use secure only in production (HTTPS)
        samesite="strict",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserWithProfile.model_validate(user)
    )


@router.get("/me", response_model=UserWithProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the current authenticated user's profile.
    
    Requires valid JWT token in Authorization header.
    Returns user data with profile information.
    
    Args:
        current_user: Current authenticated user from JWT
        db: Database session
        
    Returns:
        UserWithProfile containing user and profile data
    """
    # Load user with profile relationship
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(User.id == current_user.id)
    )
    user_with_profile = result.scalar_one()
    
    return UserWithProfile.model_validate(user_with_profile)


@router.post("/refresh")
async def refresh_access_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token from httpOnly cookie.
    
    Args:
        request: FastAPI request to extract cookie
        response: FastAPI response to set new cookie
        db: Database session
        
    Returns:
        New access token
        
    Raises:
        HTTPException 401: Invalid or missing refresh token
    """
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
    
    try:
        # Decode and verify refresh token
        payload = decode_refresh_token(refresh_token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Verify user still exists and is active
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Generate new tokens
        new_access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Update refresh token cookie
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="strict",
            max_age=7 * 24 * 60 * 60
        )
        
        return {"access_token": new_access_token, "token_type": "bearer"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/logout")
async def logout(response: Response):
    """
    Logout user by clearing refresh token cookie.
    
    Args:
        response: FastAPI response to clear cookie
        
    Returns:
        Success message
    """
    response.delete_cookie(key="refresh_token")
    return {"message": "Successfully logged out"}

