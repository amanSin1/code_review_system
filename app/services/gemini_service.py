import google.generativeai as genai
import json
import time
from typing import Dict, Any
from app.config import settings


# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


def analyze_code_with_gemini(code: str, language: str, title: str = None, description: str = None) -> Dict[str, Any]:
    """
    Analyze code using Gemini API and return structured feedback.
    
    Args:
        code: The source code to analyze
        language: Programming language
        title: Optional title for context
        description: Optional description for context
    
    Returns:
        Dict with overall_score, summary, and issues
    
    Raises:
        Exception: If Gemini API fails or returns invalid JSON
    """
    start_time = time.time()
    
    # Build context string
    context = ""
    if title:
        context += f"Title: {title}\n"
    if description:
        context += f"Description: {description}\n"
    
    # Create the prompt
    prompt = f"""You are an expert code reviewer. Analyze this {language} code and return ONLY valid JSON (no markdown, no explanation, no code blocks).

CODE:
```{language}
{code}
```

{context if context else ""}

Return this EXACT JSON structure (nothing else):
{{
  "overall_score": <number 1-10>,
  "summary": "<brief 1-2 sentence overview>",
  "issues": [
    {{
      "line": <line number or null>,
      "severity": "<critical|warning|suggestion>",
      "message": "<what's wrong>",
      "suggestion": "<how to fix>"
    }}
  ]
}}

Focus on:
1. Security vulnerabilities (SQL injection, XSS, hardcoded secrets, insecure functions)
2. Code quality (unused variables, bad naming, code duplication, magic numbers)
3. Best practices (error handling, input validation, proper structure)
4. Performance issues (inefficient algorithms, unnecessary loops)
5. Language-specific conventions (PEP 8 for Python, ES6+ for JavaScript, etc.)

Rules:
- "line" should be the actual line number if identifiable, or null for general issues
- Severity levels: "critical" (security/breaking), "warning" (bugs/bad practice), "suggestion" (improvements)
- Provide actionable suggestions
- If code is perfect, return empty issues array and score 10
- Return ONLY the JSON object, no other text
"""
    
    try:
        # Use correct Gemini model name
        model = genai.GenerativeModel('gemini-2.5-flash')  # CHANGED THIS LINE
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Extract text from response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]  # Remove ```json
        if response_text.startswith("```"):
            response_text = response_text[3:]  # Remove ```
        if response_text.endswith("```"):
            response_text = response_text[:-3]  # Remove trailing ```
        
        response_text = response_text.strip()
        
        # Parse JSON
        analysis_result = json.loads(response_text)
        
        # Validate structure
        if "overall_score" not in analysis_result or "summary" not in analysis_result or "issues" not in analysis_result:
            raise ValueError("Invalid response structure from Gemini")
        
        # Ensure overall_score is between 1-10
        analysis_result["overall_score"] = max(1, min(10, int(analysis_result["overall_score"])))
        
        # Calculate analysis time
        analysis_time = time.time() - start_time
        analysis_result["analysis_time"] = round(analysis_time, 2)
        
        return analysis_result
        
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Gemini response as JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")