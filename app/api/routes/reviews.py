from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.submission import Submission
from app.models.annotation import Annotation
from app.models.notification import Notification
from app.oauth2 import get_current_user
from app.models.user import User
from app.models.review import Review
from sqlalchemy import func
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.review import ReviewListResponse
from app.core.logger import logger


router = APIRouter(
    prefix = "/api/reviews",
    tags = ["Reviews"]
)

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors can create reviews"
        )

    submission = db.query(Submission).filter(
        Submission.id == payload.submission_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Create review
    review = Review(
        submission_id=payload.submission_id,
        reviewer_id=current_user.id,
        overall_comment=payload.overall_comment,
        rating=payload.rating
    )
    db.add(review)
    db.flush()  # get review.id without committing

    # Create annotations
    for ann in payload.annotations:
        annotation = Annotation(
            review_id=review.id,
            comment_text=ann.comment_text,
            line_number=ann.line_number
        )
        db.add(annotation)

    # Create notification (for student)
    notification = Notification(
        user_id=submission.user_id,
        message=f"Your submission '{submission.title}' has been reviewed by {current_user.name}."
    )
    db.add(notification)

    # Update submission status
    submission.status = "reviewed"

    # ONE commit
    db.commit()
    db.refresh(review)
    logger.info(
        f"Review {review.id} created for submission {submission.id} by mentor {current_user.id}"
    )

    return review


@router.get("/submission/{submission_id}", response_model=ReviewListResponse)
def get_reviews_by_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    submission = db.query(Submission).filter(
        Submission.id == submission_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Authorization
    if current_user.role == "student" and submission.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view reviews for this submission"
        )

    reviews = db.query(Review).filter(
        Review.submission_id == submission_id
    ).all()

    return {
        "submission_id": submission_id,
        "reviews": reviews
    }
