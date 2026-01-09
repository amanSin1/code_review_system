from app.database import Base
from sqlalchemy import Column,Integer,String,TIMESTAMP,Text,ForeignKey,text,Enum,Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean,  server_default=text("false"))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())