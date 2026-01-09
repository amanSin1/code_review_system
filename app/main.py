from fastapi import FastAPI
from app.config import settings
from app.database import engine
from app.api.routes import auth,submissions,reviews, tags
from app.api.routes import notifications
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from app.core.rate_limiter import limiter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title = settings.PROJECT_NAME)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(submissions.router)
app.include_router(reviews.router)
app.include_router(notifications.router)
app.include_router(tags.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Code Review System!"}

@app.get("/health")
def health_check():
    try:
        with engine.connect():
            return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "error", "database": "disconnected"}
