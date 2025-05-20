from fastapi import FastAPI, UploadFile, File, Form
from matcher import match_resume_to_job

app = FastAPI()

@app.post("/match/")
async def match_resume(resume: UploadFile = File(...), job_description: str = Form(...)):
    content = await resume.read()
    score = match_resume_to_job(content.decode(), job_description)
    return {"match_score": score}

