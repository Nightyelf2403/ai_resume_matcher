from typing import List, Tuple
from sentence_transformers import SentenceTransformer, util
import fitz  # PyMuPDF

model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(file) -> str:
    pdf = fitz.open(stream=file.file.read(), filetype="pdf")
    text = ""
    for page in pdf:
        text += page.get_text()
    pdf.close()
    return text

def extract_keywords(job_desc: str, top_k: int = 10) -> List[str]:
    # Naive keyword extraction: top frequent meaningful words
    from collections import Counter
    import re

    words = re.findall(r'\b[a-zA-Z]{4,}\b', job_desc.lower())
    common = Counter(words).most_common(top_k)
    return [word for word, _ in common]

def compute_similarity(resume_text: str, job_desc: str, keywords: List[str]) -> Tuple[float, List[str]]:
    matched_keywords = [kw for kw in keywords if kw.lower() in resume_text.lower()]
    score = len(matched_keywords) / len(keywords) * 100 if keywords else 0
    return round(score, 2), matched_keywords

def match_resume(file, job_description: str):
    resume_text = extract_text_from_pdf(file)
    keywords = extract_keywords(job_description)
    score, matched_keywords = compute_similarity(resume_text, job_description, keywords)

    return {
        "match_score": score,
        "matched_keywords": matched_keywords,
        "total_keywords": keywords
    }
