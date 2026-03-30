from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Form
from services.model_service import predict_image
from services.history_service import save_prediction
from services.auth_service import verify_token
from typing import Optional

router = APIRouter()

@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    patient_name: Optional[str] = Form(None),
    patient_age: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG allowed!")

    image_bytes = await file.read()
    result = predict_image(image_bytes)

    user_email = None
    if authorization:
        token = authorization.replace("Bearer ", "")
        payload = verify_token(token)
        if payload:
            user_email = payload["sub"]
            save_prediction(
                user_email   = user_email,
                patient_name = patient_name or "Unknown",
                patient_age  = patient_age or "0",
                filename     = file.filename,
                prediction   = result["prediction"],
                confidence   = result["confidence"],
                is_pneumonia = result["is_pneumonia"],
                message      = "Pneumonia detected! Please consult a doctor."
                               if result["is_pneumonia"]
                               else "No pneumonia detected."
            )

    return {
        "status":       "success",
        "filename":     file.filename,
        "prediction":   result["prediction"],
        "confidence":   result["confidence"],
        "is_pneumonia": result["is_pneumonia"],
        "gradcam":      result["gradcam"],
        "message":      "Pneumonia detected! Please consult a doctor."
                        if result["is_pneumonia"]
                        else "No pneumonia detected. Lungs appear normal.",
        "saved_to_db":  user_email is not None,
    }