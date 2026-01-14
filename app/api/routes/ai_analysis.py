from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.database import get_db
from app.oauth2 import get_current_user
from app.schemas.ai_analysis import AIAnalysisRequest, AIAnalysisResponse
from app.services.gemini_service import analyze_code_with_gemini
from app.models.user import User
from app.models.ai_analysis import AIAnalysisUsage
from app.core.rate_limiter import limiter
from fastapi import Request

router = APIRouter(prefix="/api/ai", tags=["AI Analysis"])

# Rate limit per day
DAILY_LIMIT = 10


def get_or_create_usage(db: Session, user_id: int, today: date) -> AIAnalysisUsage:
    """Get or create AI analysis usage record for user today."""
    usage = db.query(AIAnalysisUsage).filter(
        AIAnalysisUsage.user_id == user_id,
        AIAnalysisUsage.date == today
    ).first()
    
    if not usage:
        usage = AIAnalysisUsage(user_id=user_id, date=today, count=0)
        db.add(usage)
        db.commit()
        db.refresh(usage)
    
    return usage


@router.post("/analyze", response_model=AIAnalysisResponse, status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")  # Extra protection against rapid spam
async def analyze_code(
    request: Request,
    analysis_request: AIAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze code using AI (Gemini).
    
    - **code**: Source code to analyze (required)
    - **language**: Programming language (required)
    - **title**: Optional title for context
    - **description**: Optional description for context
    
    Rate limit: 10 analyses per day per user
    """
    
    # Check daily rate limit
    today = datetime.utcnow().date()
    usage = get_or_create_usage(db, current_user.id, today)
    
    if usage.count >= DAILY_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily AI analysis limit reached ({DAILY_LIMIT}/{DAILY_LIMIT}). Try again tomorrow."
        )
    
    try:
        # Call Gemini API
        analysis_result = analyze_code_with_gemini(
            code=analysis_request.code,
            language=analysis_request.language,
            title=analysis_request.title,
            description=analysis_request.description
        )
        
        # Increment usage count
        usage.count += 1
        usage.updated_at = datetime.utcnow()
        db.commit()
        
        # Add remaining analyses to response
        analysis_result["remaining_analyses_today"] = DAILY_LIMIT - usage.count
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )


@router.get("/quota", status_code=status.HTTP_200_OK)
async def get_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get remaining AI analysis quota for today.
    """
    today = datetime.utcnow().date()
    usage = get_or_create_usage(db, current_user.id, today)
    
    return {
        "total_limit": DAILY_LIMIT,
        "used_today": usage.count,
        "remaining_today": DAILY_LIMIT - usage.count,
        "date": str(today)
    }