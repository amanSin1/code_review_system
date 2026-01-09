from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.oauth2 import get_current_user
from app.models.user import User
from app.models.tag import Tag
router = APIRouter(
    prefix = "/api/tags",
    tags = ["Tags"]
)

@router.get("/", status_code=status.HTTP_200_OK)
def _get_tags(db : Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tags = db.query(Tag).all()
    return {"tags": tags}

