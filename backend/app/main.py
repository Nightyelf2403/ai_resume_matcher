from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.matcher import match_resume

app = FastAPI()

# Allow CORS from Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-resume-match-gamma.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Resume Matcher API is live!"}

@app.post("/match/")
async def match(file: UploadFile = File(...), job_description: str = Form(...)):
    try:
        result = match_resume(file, job_description)
        explanation = [
            f"✅ Matched '{word}' in resume with job description"
            for word in result["matched_keywords"]
        ]
        return JSONResponse(content={
            "match_percentage": result["match_score"],
            "matching_keywords": result["matched_keywords"],
            "job_keywords": result["total_keywords"],
            "explanation": explanation
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
