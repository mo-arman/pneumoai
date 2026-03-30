from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.predict import router as predict_router
from routes.history import router as history_router

app = FastAPI(title="PneumoAI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(predict_router)
app.include_router(history_router)

@app.get("/")
def home():
    return {"status": "PneumoAI Backend Running!"}