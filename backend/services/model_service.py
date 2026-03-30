import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import os
from huggingface_hub import hf_hub_download

MODEL_PATH = "/tmp/pneumonia_model.pth"
CLASSES  = ["NORMAL", "PNEUMONIA"]
IMG_SIZE = 224
device   = torch.device("cpu")

# Download model from Hugging Face
if not os.path.exists(MODEL_PATH):
    print("Downloading model from Hugging Face...")
    try:
        downloaded = hf_hub_download(
            repo_id="moharman/pneumoai-model",
            filename="pneumonia_model.pth",
            local_dir="/tmp"
        )
        print(f"Model downloaded to: {downloaded}")
    except Exception as e:
        print(f"Download error: {e}")
        raise

# Load Model
model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)
model.load_state_dict(
    torch.load(MODEL_PATH, map_location=device)
)
model.eval()
print("Model loaded successfully!")

# Transform
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def predict_image(image_bytes: bytes) -> dict:
    image  = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs    = model(tensor)
        probs      = torch.softmax(outputs, dim=1)
        confidence = probs.max().item()
        pred_idx   = probs.argmax().item()

    prediction = CLASSES[pred_idx]

    gradcam_img = None
    try:
        from services.gradcam_service import generate_gradcam
        gradcam_img = generate_gradcam(model, image_bytes, pred_idx)
    except Exception as e:
        print(f"GradCAM error: {e}")

    return {
        "prediction":   prediction,
        "confidence":   round(confidence * 100, 2),
        "is_pneumonia": prediction == "PNEUMONIA",
        "gradcam":      gradcam_img,
    }