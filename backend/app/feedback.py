from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["resume_matcher"]
feedbacks_collection = db["feedbacks"]

def store_feedback(rating, feedback):
    feedbacks_collection.insert_one({
        "rating": rating,
        "feedback": feedback
    })

def get_feedbacks():
    return list(feedbacks_collection.find({}, {"_id": 0}))
