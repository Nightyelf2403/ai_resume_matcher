from sentence_transformers import SentenceTransformer, util
import fitz  # PyMuPDF

model = SentenceTransformer("all-MiniLM-L6-v2")

def extract_text(file_content: bytes, filename: str):
    if filename.lower().endswith(".pdf"):
        with fitz.open(stream=file_content, filetype="pdf") as doc:
            return "\n".join(page.get_text() for page in doc)
    return file_content.decode()

def match_resume_to_job(resume_bytes: bytes, filename: str, job_description: str):
    resume_text = extract_text(resume_bytes, filename)
    embeddings = model.encode([resume_text, job_description], convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(embeddings[0], embeddings[1])
    return float(similarity.item())
