# history_service.py — Prediction History MongoDB

from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

# ── DB Connection ─────────────────────────────
client     = MongoClient(os.getenv("MONGODB_URL"))
db         = client.pneumoai
collection = db.predictions

def save_prediction(user_email: str,
                    patient_name: str,
                    patient_age: str,
                    filename: str,
                    prediction: str,
                    confidence: float,
                    is_pneumonia: bool,
                    message: str) -> dict:
    record = {
        "user_email":   user_email,
        "patient_name": patient_name,
        "patient_age":  patient_age,
        "filename":     filename,
        "prediction":   prediction,
        "confidence":   confidence,
        "is_pneumonia": is_pneumonia,
        "message":      message,
        "created_at":   datetime.utcnow(),
    }
    result = collection.insert_one(record)
    return {"id": str(result.inserted_id)}

def get_history(user_email: str) -> list:
    records = collection.find(
        {"user_email": user_email}
    ).sort("created_at", -1).limit(20)

    history = []
    for r in records:
        r["_id"] = str(r["_id"])
        r["created_at"] = r["created_at"].strftime(
            "%d/%m/%Y %H:%M"
        )
        history.append(r)
    return history

def delete_prediction(record_id: str,
                      user_email: str) -> bool:
    from bson import ObjectId
    result = collection.delete_one({
        "_id":        ObjectId(record_id),
        "user_email": user_email
    })
    return result.deleted_count > 0