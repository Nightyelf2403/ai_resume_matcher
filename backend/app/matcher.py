# ✅ backend/app/matcher.py
import fitz  # PyMuPDF
import requests
import os
from dotenv import load_dotenv
load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
if not HF_API_TOKEN:
    raise ValueError("HF_API_TOKEN is not set")

HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
HEADERS = {
    "Authorization": f"Bearer {HF_API_TOKEN}"
}

def extract_text_from_pdf(file) -> str:
    pdf = fitz.open(stream=file.file.read(), filetype="pdf")
    text = ""
    for page in pdf:
        text += page.get_text()
    pdf.close()
    return text

def get_similarity_score(resume_text, job_description):
    payload = {
        "inputs": {
            "source_sentence": job_description,
            "sentences": [resume_text]
        }
    }
    response = requests.post(HF_API_URL, headers=HEADERS, json=payload)
    if response.status_code != 200:
        raise Exception("Hugging Face API Error:", response.text)

    score = response.json()['score'] * 100 if isinstance(response.json(), dict) else response.json()[0] * 100
    return round(score, 2)

def extract_keywords(text: str, top_k: int = 10):
    from collections import Counter
    import re
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    common = Counter(words).most_common(top_k)
    return [word for word, _ in common]

def match_resume(file, job_description: str):
    resume_text = extract_text_from_pdf(file)
    score = get_similarity_score(resume_text, job_description)
    keywords = extract_keywords(job_description)
    matched = [kw for kw in keywords if kw.lower() in resume_text.lower()]

    return {
        "match_score": score,
        "matched_keywords": matched,
        "total_keywords": keywords,
        "suggestions": [
            "Add more relevant keywords from the job description.",
            "Tailor your experience to align with job responsibilities.",
            "Highlight your technical and soft skills clearly."
        ]
    }
