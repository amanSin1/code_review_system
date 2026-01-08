from fastapi import FastAPI
from app.config import settings
from app.database import engine
from app.api.routes import auth,submissions,reviews
from app.api.routes import notifications


app = FastAPI(title = settings.PROJECT_NAME)

app.include_router(auth.router)
app.include_router(submissions.router)
app.include_router(reviews.router)
app.include_router(notifications.router)

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
