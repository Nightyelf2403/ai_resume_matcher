from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.matcher import match_resume
from pymongo import MongoClient
import os

app = FastAPI()

# Allow CORS from Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-resume-match-gamma.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Setup (set this in Render env vars)
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["resume_matcher"]
feedback_collection = db["feedback"]

# Root route
@app.get("/")
def read_root():
    return {"message": "AI Resume Matcher API is live!"}

# Resume Matching
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

# Feedback Model
class Feedback(BaseModel):
    rating: str
    feedback: str

# Feedback Storage Route
@app.post("/feedback")
async def store_feedback(item: Feedback):
    feedback_collection.insert_one(item.dict())
    return {"message": "Feedback stored successfully"}
