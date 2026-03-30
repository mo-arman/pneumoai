# ─────────────────────────────────────────────
# train.py — Pneumonia Detection Model Training
# ─────────────────────────────────────────────

import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models
import matplotlib.pyplot as plt

# ── 1. CONFIG ────────────────────────────────
TRAIN_DIR   = "ml_model/data/train"
TEST_DIR    = "ml_model/data/test"
MODEL_SAVE  = "ml_model/saved_model/pneumonia_model.pth"
BATCH_SIZE  = 16
EPOCHS      = 5
LR          = 0.001
IMG_SIZE    = 224

# ── 2. DEVICE ────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Using device: {device}")

# ── 3. DATA TRANSFORMS ───────────────────────
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

test_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ── 4. LOAD DATASET ──────────────────────────
print("📂 Loading dataset...")
full_train = datasets.ImageFolder(TRAIN_DIR, transform=train_transform)
test_data  = datasets.ImageFolder(TEST_DIR,  transform=test_transform)

train_size = int(0.8 * len(full_train))
val_size   = len(full_train) - train_size
train_data, val_data = random_split(full_train, [train_size, val_size])

train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)
val_loader   = DataLoader(val_data,   batch_size=BATCH_SIZE, shuffle=False)
test_loader  = DataLoader(test_data,  batch_size=BATCH_SIZE, shuffle=False)

print(f"✅ Train: {train_size} | Val: {val_size} | Test: {len(test_data)}")
print(f"✅ Classes: {full_train.classes}")

# ── 5. MODEL ─────────────────────────────────
print("🧠 Loading ResNet18 model...")
model = models.resnet18(weights="IMAGENET1K_V1")

for param in model.parameters():
    param.requires_grad = False

model.fc = nn.Linear(model.fc.in_features, 2)
model = model.to(device)
print("✅ Model ready!")

# ── 6. LOSS + OPTIMIZER ──────────────────────
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.fc.parameters(), lr=LR)

# ── 7. TRAINING LOOP ─────────────────────────
print("\n🏋️ Training started...\n")

train_losses   = []
val_losses     = []
val_accuracies = []

for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss    = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()

    avg_train_loss = running_loss / len(train_loader)
    train_losses.append(avg_train_loss)

    model.eval()
    val_loss = 0.0
    correct  = 0
    total    = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss    = criterion(outputs, labels)
            val_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total   += labels.size(0)
            correct += (predicted == labels).sum().item()

    avg_val_loss = val_loss / len(val_loader)
    val_accuracy = 100 * correct / total
    val_losses.append(avg_val_loss)
    val_accuracies.append(val_accuracy)

    print(f"Epoch [{epoch+1}/{EPOCHS}] "
          f"Train Loss: {avg_train_loss:.4f} | "
          f"Val Loss: {avg_val_loss:.4f} | "
          f"Val Accuracy: {val_accuracy:.2f}%")

# ── 8. SAVE MODEL ────────────────────────────
os.makedirs("ml_model/saved_model", exist_ok=True)
torch.save(model.state_dict(), MODEL_SAVE)
print(f"\n💾 Model saved to {MODEL_SAVE}")

# ── 9. PLOT RESULTS ──────────────────────────
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(train_losses, label="Train Loss")
plt.plot(val_losses,   label="Val Loss")
plt.title("Loss over Epochs")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(val_accuracies, label="Val Accuracy", color="green")
plt.title("Accuracy over Epochs")
plt.xlabel("Epoch")
plt.ylabel("Accuracy (%)")
plt.legend()

plt.tight_layout()
plt.savefig("ml_model/training_results.png")
plt.show()
print("📊 Training graph saved!")

print("\n✅ Training Complete!")
print(f"🏆 Final Val Accuracy: {val_accuracies[-1]:.2f}%")