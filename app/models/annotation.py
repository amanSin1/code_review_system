from app.database import Base
from sqlalchemy import Column,Integer,String,TIMESTAMP,Text,ForeignKey,text,Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
class Annotation(Base):
    __tablename__ = "annotations"
    id = Column(Integer, primary_key = True, index = True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable = False)
    line_number = Column(Integer, nullable = False)
    comment_text = Column(Text, nullable = False)
    created_at = Column(TIMESTAMP(timezone=True), nullable= False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable= False, server_default=func.now(), onupdate=func.now())
    review = relationship("Review", back_populates="annotations")
