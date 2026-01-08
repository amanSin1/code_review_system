from pydantic import BaseModel, Field
from typing import Optional,List
from datetime import datetime


class NotificationOut(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    notifications: list[NotificationOut]
    unread_count: int
