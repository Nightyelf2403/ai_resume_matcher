from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Request
from pymongo import MongoClient
import os
from app.matcher import match_resume

app = FastAPI()

# CORS for Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-resume-match-gamma.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup using secret
mongo_uri = os.getenv("MONGO_URI")
mongo_client = MongoClient(mongo_uri)
db = mongo_client["resume_matcher"]
feedback_collection = db["feedback"]

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
            "suggestions": result.get("suggestions", []),
            "explanation": explanation
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/feedback")
async def submit_feedback(request: Request):
    try:
        data = await request.json()
        rating = data.get("rating")
        feedback_text = data.get("feedback")

        feedback_collection.insert_one({
            "rating": rating,
            "feedback": feedback_text
        })

        return {"message": "Feedback stored successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
