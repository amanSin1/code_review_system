from app.database import Base
from sqlalchemy import Column, Enum, Integer, String,Boolean, TIMESTAMP, text
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique = True, nullable = False)
    password = Column(String, nullable = False)
    role = Column(
        Enum("student","mentor","admin", name = "user_roles"),
        default = "student",
        nullable = False
    )
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable= False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable= False, server_default=func.now(), onupdate=func.now())
    submissions = relationship("Submission", back_populates="user")
    reviews = relationship("Review", back_populates="reviewer")
    ai_analysis_usage = relationship("AIAnalysisUsage", back_populates="user", cascade="all, delete-orphan")


