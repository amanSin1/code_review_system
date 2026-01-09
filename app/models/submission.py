from app.database import Base
from sqlalchemy import Column,Integer,String,TIMESTAMP,Text,ForeignKey,text,Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable = False)
    title = Column(String, nullable = False)
    description = Column(Text, nullable = False)
    status = Column(
        Enum("pending", "in_review", "reviewed", name = "submission_statuses"),
        default = "pending",
        nullable = False
    )
    code_content = Column(Text, nullable = False)
    language = Column(String(50), nullable = False)
    created_at = Column(TIMESTAMP(timezone=True), nullable= False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable= False, server_default=func.now(), onupdate=func.now())
    user = relationship("User", back_populates="submissions")
    reviews = relationship("Review", back_populates="submission")
    # 🔑 THIS IS THE FIX
    tags = relationship(
        "Tag",
        secondary="submission_tags",
        back_populates="submissions"
    )
