# auth_service.py — User Authentication

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# ── Config ───────────────────────────────────
MONGODB_URL  = os.getenv("MONGODB_URL")
SECRET_KEY   = os.getenv("SECRET_KEY")
ALGORITHM    = os.getenv("ALGORITHM", "HS256")
EXPIRE_MINS  = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

# ── DB Connection ─────────────────────────────
client = MongoClient(MONGODB_URL)
db     = client.pneumoai
users  = db.users

# ── Password Hashing ──────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
   return pwd_context.hash(password[:72]) 

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ── JWT Token ─────────────────────────────────
def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire    = datetime.utcnow() + timedelta(minutes=EXPIRE_MINS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY,
                             algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# ── User Functions ────────────────────────────
def create_user(name: str, email: str,
                password: str) -> dict:
    # Check existing
    if users.find_one({"email": email}):
        return {"error": "Email already registered!"}

    user = {
        "name":       name,
        "email":      email,
        "password":   hash_password(password),
        "created_at": datetime.utcnow(),
    }
    result = users.insert_one(user)
    return {"id": str(result.inserted_id),
            "name": name, "email": email}

def login_user(email: str, password: str) -> dict:
    user = users.find_one({"email": email})
    if not user:
        return {"error": "User not found!"}
    if not verify_password(password, user["password"]):
        return {"error": "Wrong password!"}

    token = create_token({"sub": email,
                           "name": user["name"]})
    return {
        "token": token,
        "name":  user["name"],
        "email": email,
    }

def get_user(email: str) -> Optional[dict]:
    user = users.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
        user.pop("password", None)
        return user
    return None