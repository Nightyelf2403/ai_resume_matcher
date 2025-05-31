from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pymongo import MongoClient
import os
import secrets

from app.matcher import match_resume

app = FastAPI()

# CORS for Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-resume-match-gamma.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Setup
MONGO_URL = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URL)
db = client["ai_resume_matcher"]
feedback_collection = db["feedbacks"]

# Basic Auth for Admin
security = HTTPBasic()
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "secretpass")


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
            "total_keywords": result["total_keywords"],
            "suggestions": result["suggestions"],
            "explanation": explanation
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/feedback")
async def store_feedback(rating: str = Form(...), feedback: str = Form(...)):
    try:
        feedback_collection.insert_one({"rating": rating, "feedback": feedback})
        return {"message": "Feedback received!"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/feedbacks")
def get_feedbacks(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)

    if not (correct_username and correct_password):
        raise HTTPException(status_code=401, detail="Unauthorized")

    feedbacks = list(feedback_collection.find({}, {"_id": 0}))
    return feedbacks
