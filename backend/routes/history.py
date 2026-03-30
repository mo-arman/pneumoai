# history.py — History API Endpoints

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from services.auth_service import verify_token
from services.history_service import (
    get_history, delete_prediction
)

router = APIRouter()

def get_current_user(authorization: str):
    token   = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Please login first!"
        )
    return payload["sub"]

# ── Get History ───────────────────────────────
@router.get("/history")
def history(authorization: str = Header(...)):
    email   = get_current_user(authorization)
    records = get_history(email)
    return {
        "status":  "success",
        "history": records,
        "count":   len(records),
    }

# ── Delete One ────────────────────────────────
@router.delete("/history/{record_id}")
def delete_one(record_id: str,
               authorization: str = Header(...)):
    email   = get_current_user(authorization)
    deleted = delete_prediction(record_id, email)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Record not found!"
        )
    return {"status": "success",
            "message": "Deleted!"}