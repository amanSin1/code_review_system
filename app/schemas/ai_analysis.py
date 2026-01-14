from pydantic import BaseModel, Field
from typing import List, Optional


class AIAnalysisRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Code to analyze")
    language: str = Field(..., min_length=1, description="Programming language")
    title: Optional[str] = Field(None, description="Optional title for context")
    description: Optional[str] = Field(None, description="Optional description for context")


class AIIssue(BaseModel):
    line: Optional[int] = Field(None, description="Line number (null for general issues)")
    severity: str = Field(..., description="critical, warning, or suggestion")
    message: str = Field(..., description="What's wrong")
    suggestion: str = Field(..., description="How to fix")


class AIAnalysisResponse(BaseModel):
    overall_score: int = Field(..., ge=1, le=10, description="Code quality score (1-10)")
    summary: str = Field(..., description="Brief overview of the analysis")
    issues: List[AIIssue] = Field(default_factory=list, description="List of issues found")
    analysis_time: float = Field(..., description="Time taken to analyze (seconds)")
    remaining_analyses_today: int = Field(..., description="Remaining API calls for today")