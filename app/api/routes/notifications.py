from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.oauth2 import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notifications import NotificationResponse
router = APIRouter(
    prefix = "/api/notifications",
    tags = ["Notifications"]
)

@router.get("/", response_model=NotificationResponse, status_code=status.HTTP_200_OK)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    unread_count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .count()
    )

    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@router.put("/{notification_id}/read", status_code=status.HTTP_200_OK)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if not notification.is_read:
        notification.is_read = True
        db.commit()


    return {"detail": "Notification marked as read"}
