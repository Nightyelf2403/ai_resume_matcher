# ✅ backend/app/main.py
from fastapi import FastAPI, File, UploadFile, Form, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.matcher import match_resume
from app.feedback import store_feedback, get_feedbacks
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-resume-matcher-5pczjldw5-nightyelf2403s-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
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
            "total_keywords": result["total_keywords"],
            "explanation": explanation,
            "suggestions": result.get("suggestions", [])
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/feedback")
async def receive_feedback(request: Request):
    data = await request.json()
    rating = data.get("rating")
    feedback = data.get("feedback")
    try:
        store_feedback(rating, feedback)
        return {"message": "Feedback stored successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/admin/feedbacks")
async def admin_view_feedbacks(authorization: str = Header(None)):
    admin_secret = os.getenv("ADMIN_SECRET")
    if not authorization or not authorization.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"error": "Unauthorized"})
    token = authorization.split(" ")[1]
    if token != admin_secret:
        return JSONResponse(status_code=403, content={"error": "Forbidden"})
    try:
        feedbacks = get_feedbacks()
        return {"feedbacks": feedbacks}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
