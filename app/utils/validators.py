import bleach
from fastapi import HTTPException, status

def sanitize_text(text: str, max_length: int = 1000) -> str:
    """Remove HTML tags and limit length"""
    if len(text) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Text too long. Maximum {max_length} characters."
        )
    return bleach.clean(text, strip=True)

def validate_code_content(code: str) -> str:
    """Validate code submissions"""
    max_code_length = 50000  # 50KB
    if len(code) > max_code_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code too long. Maximum 50,000 characters."
        )
    if len(code.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code cannot be empty."
        )
    return code