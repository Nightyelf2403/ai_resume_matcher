from typing import List, Tuple, Dict
from sentence_transformers import SentenceTransformer
import fitz  # PyMuPDF
import re
from collections import Counter

# Load sentence transformer model once
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(file) -> str:
    """Extract text from uploaded PDF file."""
    pdf = fitz.open(stream=file.file.read(), filetype="pdf")
    text = ""
    for page in pdf:
        text += page.get_text()
    pdf.close()
    return text.strip()

def extract_keywords(text: str, top_k: int = 10) -> List[str]:
    """Extract top-k frequent keywords from job description."""
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    filtered = [w for w in words if w not in {'with', 'from', 'that', 'your', 'will', 'have'}]
    common = Counter(filtered).most_common(top_k)
    return [word for word, _ in common]

def compute_similarity(resume_text: str, job_desc: str, keywords: List[str]) -> Tuple[float, List[str]]:
    """Compute percentage of matching keywords."""
    matched_keywords = [kw for kw in keywords if kw.lower() in resume_text.lower()]
    score = len(matched_keywords) / len(keywords) * 100 if keywords else 0
    return round(score, 2), matched_keywords

def generate_ai_suggestions(keywords: List[str], matched: List[str]) -> List[str]:
    """Return improvement suggestions for unmatched keywords."""
    unmatched = set(keywords) - set(matched)
    return [f"Consider adding the keyword '{kw}' to improve your match." for kw in unmatched]

def match_resume(file, job_description: str) -> Dict:
    """Main match function."""
    resume_text = extract_text_from_pdf(file)
    keywords = extract_keywords(job_description)
    score, matched = compute_similarity(resume_text, job_description, keywords)
    suggestions = generate_ai_suggestions(keywords, matched)

    return {
        "match_score": score,
        "matched_keywords": matched,
        "total_keywords": len(keywords),
        "suggestions": suggestions
    }
