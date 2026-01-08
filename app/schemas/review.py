from pydantic import BaseModel, Field
from typing import Optional,List
from datetime import datetime

class AnnotationCreate(BaseModel):
    comment_text : str
    line_number : Optional[int] = None

class ReviewCreate(BaseModel):
    submission_id : int
    overall_comment: str
    rating : int
    annotations : Optional[List[AnnotationCreate]] = []

class ReviewerOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class AnnotationOut(BaseModel):
    id: int
    line_number: int
    comment_text: str

    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    id: int
    submission_id: int
    overall_comment: str
    rating: int
    created_at: datetime
    reviewer: ReviewerOut
    annotations: list[AnnotationOut]

    class Config:
        from_attributes = True

class ReviewOut(BaseModel):
    id: int
    reviewer : ReviewerOut
    overall_comment: str
    rating: int
    created_at: datetime
    annotations : list[AnnotationOut]

    class Config:
        from_attributes = True

class ReviewListResponse(BaseModel):
    submission_id: int
    reviews: list[ReviewOut]
