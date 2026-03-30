from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from services.auth_service import create_user, login_user, verify_token

router = APIRouter()

class SignupRequest(BaseModel):
    name:     str
    email:    str
    password: str

class LoginRequest(BaseModel):
    email:    str
    password: str

@router.post("/signup")
def signup(req: SignupRequest):
    result = create_user(req.name, req.email, req.password)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    token = login_user(req.email, req.password)
    return {
        "status":  "success",
        "message": "Account created!",
        "token":   token["token"],
        "name":    req.name,
        "email":   req.email,
    }

@router.post("/login")
def login(req: LoginRequest):
    result = login_user(req.email, req.password)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return {
        "status": "success",
        "token":  result["token"],
        "name":   result["name"],
        "email":  result["email"],
    }

@router.get("/me")
def get_me(authorization: str = Header(...)):
    token   = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token!")
    return {
        "email": payload["sub"],
        "name":  payload.get("name", ""),
    }