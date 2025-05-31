from fastapi import FastAPI, UploadFile, File, Form
from app.matcher import match_resume_to_job

app = FastAPI()  # ✅ This line defines `app`

@app.post("/match/")
async def match_resume(resume: UploadFile = File(...), job_description: str = Form(...)):
    content = await resume.read()
    score = match_resume_to_job(content, resume.filename, job_description)
    return {"match_score": score}
