from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case, distinct
from datetime import datetime, timedelta
from app.database import get_db
from app.oauth2 import get_current_user
from app.models.user import User
from app.models.submission import Submission
from app.models.review import Review
from app.models.ai_analysis import AIAnalysisUsage
from typing import Dict, List, Any

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


# ==================== STUDENT ANALYTICS ====================

@router.get("/student", status_code=status.HTTP_200_OK)
def get_student_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get analytics dashboard data for student.
    Shows their submissions, ratings, languages, etc.
    """
    
    if current_user.role != 'student':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access student analytics"
        )
    
    # ===== 1. TOTAL COUNTS =====
    total_submissions = db.query(func.count(Submission.id)).filter(
        Submission.user_id == current_user.id
    ).scalar()
    
    total_reviews_received = db.query(func.count(Review.id)).join(
        Submission, Review.submission_id == Submission.id
    ).filter(
        Submission.user_id == current_user.id
    ).scalar()
    
    # ===== 2. SUBMISSIONS BY MONTH (Last 6 months) =====
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    submissions_by_month = db.query(
        extract('year', Submission.created_at).label('year'),
        extract('month', Submission.created_at).label('month'),
        func.count(Submission.id).label('count')
    ).filter(
        Submission.user_id == current_user.id,
        Submission.created_at >= six_months_ago
    ).group_by('year', 'month').order_by('year', 'month').all()
    
    # Format for frontend
    submissions_timeline = []
    for row in submissions_by_month:
        month_name = datetime(int(row.year), int(row.month), 1).strftime('%b %Y')
        submissions_timeline.append({
            'month': month_name,
            'count': row.count
        })
    
    # ===== 3. LANGUAGE BREAKDOWN =====
    language_breakdown = db.query(
        Submission.language,
        func.count(Submission.id).label('count')
    ).filter(
        Submission.user_id == current_user.id
    ).group_by(Submission.language).all()
    
    languages = [{'name': row.language, 'count': row.count} for row in language_breakdown]
    
    # ===== 4. STATUS BREAKDOWN =====
    status_breakdown = db.query(
        Submission.status,
        func.count(Submission.id).label('count')
    ).filter(
        Submission.user_id == current_user.id
    ).group_by(Submission.status).all()
    
    statuses = [{'status': row.status, 'count': row.count} for row in status_breakdown]
    
    # ===== 5. AVERAGE RATING (Overall and Trend) =====
    avg_rating_overall = db.query(
        func.avg(Review.rating).label('avg')
    ).join(
        Submission, Review.submission_id == Submission.id
    ).filter(
        Submission.user_id == current_user.id
    ).scalar()
    
    # Rating trend by month
    rating_trend = db.query(
        extract('year', Review.created_at).label('year'),
        extract('month', Review.created_at).label('month'),
        func.avg(Review.rating).label('avg_rating')
    ).join(
        Submission, Review.submission_id == Submission.id
    ).filter(
        Submission.user_id == current_user.id,
        Review.created_at >= six_months_ago
    ).group_by('year', 'month').order_by('year', 'month').all()
    
    rating_timeline = []
    for row in rating_trend:
        month_name = datetime(int(row.year), int(row.month), 1).strftime('%b %Y')
        rating_timeline.append({
            'month': month_name,
            'rating': round(float(row.avg_rating), 2) if row.avg_rating else 0
        })
    
    # ===== 6. AVERAGE REVIEW TIME (Days between submission and first review) =====
    avg_review_time_query = db.query(
        func.avg(
            func.extract('epoch', Review.created_at - Submission.created_at) / 86400
        ).label('avg_days')
    ).join(
        Submission, Review.submission_id == Submission.id
    ).filter(
        Submission.user_id == current_user.id
    ).scalar()
    
    avg_review_time_days = round(float(avg_review_time_query), 1) if avg_review_time_query else 0
    
    # ===== 7. AI ANALYSIS USAGE =====
    total_ai_analyses = db.query(
        func.sum(AIAnalysisUsage.count)
    ).filter(
        AIAnalysisUsage.user_id == current_user.id
    ).scalar() or 0
    
    # ===== 8. RECENT ACTIVITY (Last 5 submissions with status) =====
    recent_submissions = db.query(Submission).filter(
        Submission.user_id == current_user.id
    ).order_by(Submission.created_at.desc()).limit(5).all()
    
    recent_activity = []
    for sub in recent_submissions:
        review_count = db.query(func.count(Review.id)).filter(
            Review.submission_id == sub.id
        ).scalar()
        
        recent_activity.append({
            'id': sub.id,
            'title': sub.title,
            'language': sub.language,
            'status': sub.status,
            'review_count': review_count,
            'created_at': sub.created_at.isoformat() if sub.created_at else None
        })
    
    # ===== RETURN ALL DATA =====
    return {
        'summary': {
            'total_submissions': total_submissions or 0,
            'total_reviews_received': total_reviews_received or 0,
            'avg_rating': round(float(avg_rating_overall), 2) if avg_rating_overall else 0,
            'avg_review_time_days': avg_review_time_days,
            'total_ai_analyses': int(total_ai_analyses)
        },
        'submissions_timeline': submissions_timeline,
        'rating_timeline': rating_timeline,
        'language_breakdown': languages,
        'status_breakdown': statuses,
        'recent_activity': recent_activity
    }


# ==================== MENTOR ANALYTICS ====================

@router.get("/mentor", status_code=status.HTTP_200_OK)
def get_mentor_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get analytics dashboard data for mentor.
    Shows their reviews, students helped, languages reviewed, etc.
    """
    
    if current_user.role != 'mentor':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors can access mentor analytics"
        )
    
    # ===== 1. TOTAL COUNTS =====
    total_reviews_given = db.query(func.count(Review.id)).filter(
        Review.reviewer_id == current_user.id
    ).scalar()
    
    students_helped = db.query(
        func.count(distinct(Submission.user_id))
    ).join(
        Review, Review.submission_id == Submission.id
    ).filter(
        Review.reviewer_id == current_user.id
    ).scalar()
    
    # ===== 2. REVIEWS BY MONTH (Last 6 months) =====
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    reviews_by_month = db.query(
        extract('year', Review.created_at).label('year'),
        extract('month', Review.created_at).label('month'),
        func.count(Review.id).label('count')
    ).filter(
        Review.reviewer_id == current_user.id,
        Review.created_at >= six_months_ago
    ).group_by('year', 'month').order_by('year', 'month').all()
    
    reviews_timeline = []
    for row in reviews_by_month:
        month_name = datetime(int(row.year), int(row.month), 1).strftime('%b %Y')
        reviews_timeline.append({
            'month': month_name,
            'count': row.count
        })
    
    # ===== 3. LANGUAGES REVIEWED =====
    languages_reviewed = db.query(
        Submission.language,
        func.count(Review.id).label('count')
    ).join(
        Review, Review.submission_id == Submission.id
    ).filter(
        Review.reviewer_id == current_user.id
    ).group_by(Submission.language).all()
    
    languages = [{'name': row.language, 'count': row.count} for row in languages_reviewed]
    
    # ===== 4. AVERAGE RATING GIVEN =====
    avg_rating_given = db.query(
        func.avg(Review.rating).label('avg')
    ).filter(
        Review.reviewer_id == current_user.id
    ).scalar()
    
    # Rating distribution (how many 1-10 ratings given)
    rating_distribution = db.query(
        Review.rating,
        func.count(Review.id).label('count')
    ).filter(
        Review.reviewer_id == current_user.id
    ).group_by(Review.rating).order_by(Review.rating).all()
    
    ratings = [{'rating': row.rating, 'count': row.count} for row in rating_distribution]
    
    # ===== 5. AVERAGE RESPONSE TIME =====
    avg_response_time_query = db.query(
        func.avg(
            func.extract('epoch', Review.created_at - Submission.created_at) / 86400
        ).label('avg_days')
    ).join(
        Submission, Review.submission_id == Submission.id
    ).filter(
        Review.reviewer_id == current_user.id
    ).scalar()
    
    avg_response_time_days = round(float(avg_response_time_query), 1) if avg_response_time_query else 0
    
    # ===== 6. THIS MONTH'S IMPACT =====
    first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    reviews_this_month = db.query(func.count(Review.id)).filter(
        Review.reviewer_id == current_user.id,
        Review.created_at >= first_day_of_month
    ).scalar()
    
    students_helped_this_month = db.query(
        func.count(distinct(Submission.user_id))
    ).join(
        Review, Review.submission_id == Submission.id
    ).filter(
        Review.reviewer_id == current_user.id,
        Review.created_at >= first_day_of_month
    ).scalar()
    
    # ===== 7. RECENT REVIEWS =====
    recent_reviews = db.query(Review).filter(
        Review.reviewer_id == current_user.id
    ).order_by(Review.created_at.desc()).limit(5).all()
    
    recent_activity = []
    for review in recent_reviews:
        submission = db.query(Submission).filter(Submission.id == review.submission_id).first()
        student = db.query(User).filter(User.id == submission.user_id).first() if submission else None
        
        recent_activity.append({
            'id': review.id,
            'submission_title': submission.title if submission else 'Unknown',
            'student_name': student.name if student else 'Unknown',
            'rating': review.rating,
            'created_at': review.created_at.isoformat() if review.created_at else None
        })
    
    # ===== RETURN ALL DATA =====
    return {
        'summary': {
            'total_reviews_given': total_reviews_given or 0,
            'students_helped': students_helped or 0,
            'avg_rating_given': round(float(avg_rating_given), 2) if avg_rating_given else 0,
            'avg_response_time_days': avg_response_time_days,
            'reviews_this_month': reviews_this_month or 0,
            'students_helped_this_month': students_helped_this_month or 0
        },
        'reviews_timeline': reviews_timeline,
        'language_breakdown': languages,
        'rating_distribution': ratings,
        'recent_activity': recent_activity
    }


# ==================== ADMIN ANALYTICS (BONUS) ====================

@router.get("/admin", status_code=status.HTTP_200_OK)
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get platform-wide analytics for admin.
    Shows overall system stats.
    """
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access platform analytics"
        )
    
    # Total users by role
    users_by_role = db.query(
        User.role,
        func.count(User.id).label('count')
    ).group_by(User.role).all()
    
    # Total submissions and reviews
    total_submissions = db.query(func.count(Submission.id)).scalar()
    total_reviews = db.query(func.count(Review.id)).scalar()
    
    # Most active students
    most_active_students = db.query(
        User.name,
        func.count(Submission.id).label('submission_count')
    ).join(
        Submission, Submission.user_id == User.id
    ).group_by(User.id, User.name).order_by(
        func.count(Submission.id).desc()
    ).limit(5).all()
    
    # Most active mentors
    most_active_mentors = db.query(
        User.name,
        func.count(Review.id).label('review_count')
    ).join(
        Review, Review.reviewer_id == User.id
    ).group_by(User.id, User.name).order_by(
        func.count(Review.id).desc()
    ).limit(5).all()
    
    return {
        'summary': {
            'total_submissions': total_submissions or 0,
            'total_reviews': total_reviews or 0
        },
        'users_by_role': [{'role': row.role, 'count': row.count} for row in users_by_role],
        'most_active_students': [{'name': row.name, 'submissions': row.submission_count} for row in most_active_students],
        'most_active_mentors': [{'name': row.name, 'reviews': row.review_count} for row in most_active_mentors]
    }