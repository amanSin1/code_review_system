from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserOut, RegisterResponse
from app.utils.helpers import hash_password, verify_password
from app.oauth2 import create_access_token, get_current_user
from app.schemas.auth import LoginUser, LoginResponse
from app.core.rate_limiter import limiter
from fastapi import Request
from app.core.logger import logger


router = APIRouter(
    prefix="/api/auth", tags=["Authentication"]
    )

@router.post("/register", response_model=RegisterResponse)
@limiter.limit("5/minute")  # Max 5 registrations per minute
def register_user(request: Request,payload: UserCreate, db: Session = Depends(get_db)):  # added request paramater,bcoz slowapi needs it in func definition while using limiter
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        logger.warning(
            f"Registration attempt with existing email: {payload.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    hashed_password = hash_password(payload.password)
    new_user = User(
        **payload.model_dump(exclude={"password"}), password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(
        f"New user registered: user_id={new_user.id}, email={new_user.email}"
    )
    return {
        "message" : "User registered successfully.",
        "user" : new_user
    }

@router.post("/login", response_model = LoginResponse, status_code=200)
@limiter.limit("10/minute")  # Max 10 login attempts per minute
def login(request: Request,payload: LoginUser, db: Session = Depends(get_db)): # added request paramater,bcoz slowapi needs it in func definition while using limiter
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        logger.warning(
            f"Failed login attempt for email={payload.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data = {"user_id" : user.id})
    logger.info(
        f"Login success: user_id={user.id}, email={user.email}"
    )
    return {"access_token" : access_token, "token_type" : "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_current_user(current_user: User = Depends(get_current_user)):
    return current_user


