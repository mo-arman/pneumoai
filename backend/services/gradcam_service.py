# gradcam_service.py — Fixed Version

import torch
import numpy as np
import cv2
import base64
from torchvision import transforms
from PIL import Image
import io

IMG_SIZE  = 224

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def generate_gradcam(model, image_bytes: bytes,
                     pred_idx: int) -> str:
    try:
        # ── Load image ───────────────────────
        original = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")
        original_resized = original.resize(
            (IMG_SIZE, IMG_SIZE)
        )
        original_np = np.array(
            original_resized, dtype=np.float32
        )

        # ── Prepare tensor ───────────────────
        tensor = transform(original).unsqueeze(0)
        tensor.requires_grad_(True)

        # ── Hook setup ───────────────────────
        activations = []
        gradients   = []

        def fwd_hook(m, i, o):
            activations.append(o.detach().clone())

        def bwd_hook(m, gi, go):
            gradients.append(go[0].detach().clone())

        layer = model.layer4[1].conv2
        fwd_h = layer.register_forward_hook(fwd_hook)
        bwd_h = layer.register_full_backward_hook(bwd_hook)

        # ── Forward + Backward ───────────────
        model.zero_grad()
        output = model(tensor)
        score  = output[0, pred_idx]
        score.backward()

        # ── Remove hooks ─────────────────────
        fwd_h.remove()
        bwd_h.remove()

        # ── Compute CAM ──────────────────────
        grads   = gradients[0][0]    # (512, 7, 7)
        acts    = activations[0][0]  # (512, 7, 7)
        weights = grads.mean(dim=(1, 2))  # (512,)

        cam = torch.zeros(acts.shape[1:])
        for i, w in enumerate(weights):
            cam += w * acts[i]

        cam = torch.relu(cam)
        cam = cam.detach().numpy().astype(np.float32)

        if cam.max() > 0:
            cam = cam / cam.max()

        # ── Resize + Colormap ─────────────────
        cam     = cv2.resize(cam, (IMG_SIZE, IMG_SIZE))
        heatmap = cv2.applyColorMap(
            np.uint8(255 * cam), cv2.COLORMAP_JET
        )
        heatmap = cv2.cvtColor(
            heatmap, cv2.COLOR_BGR2RGB
        ).astype(np.float32)

        # ── Overlay ───────────────────────────
        overlay = (
            0.5 * original_np + 0.5 * heatmap
        ).clip(0, 255).astype(np.uint8)

        # ── Base64 ────────────────────────────
        pil_img = Image.fromarray(overlay)
        buffer  = io.BytesIO()
        pil_img.save(buffer, format="PNG")
        b64 = base64.b64encode(
            buffer.getvalue()
        ).decode("utf-8")

        print("✅ GradCAM generated successfully!")
        return f"data:image/png;base64,{b64}"

    except Exception as e:
        print(f"❌ GradCAM failed: {e}")
        import traceback
        traceback.print_exc()
        return None