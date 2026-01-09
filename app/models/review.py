from app.database import Base
from sqlalchemy import Column,Integer,String,TIMESTAMP,Text,ForeignKey,text,Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index = True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    overall_comment = Column(Text, nullable = False)
    rating = Column(Integer, nullable = False)
    created_at = Column(TIMESTAMP(timezone=True), nullable= False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable= False, server_default=func.now(), onupdate=func.now())
    submission = relationship("Submission", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")

    annotations = relationship("Annotation", back_populates="review")
