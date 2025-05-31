from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from app.matcher import match_resume_to_job

app = FastAPI()

# ✅ Allow only your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-resume-match-gamma.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Resume Matcher backend is live ✅"}

@app.post("/match/")
async def match_resume(resume: UploadFile = File(...), job_description: str = Form(...)):
    try:
        score = match_resume_to_job(resume.file, job_description)
        return {"match_score": score}
    except Exception as e:
        return {"error": str(e)}
