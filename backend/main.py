# main.py — FastAPI Entry Point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router as predict_router
from routes.auth    import router as auth_router
from routes.history import router as history_router

app = FastAPI(
    title="PneumoAI API",
    version="2.0.0"
)

# ── CORS ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────
app.include_router(predict_router)
app.include_router(auth_router)
app.include_router(history_router)

# ── Health Check ──────────────────────────────
@app.get("/")
def home():
    return {
        "status":  "running",
        "message": "PneumoAI API v2.0 is live!",
        "features": ["predict", "auth", "history"]
    }