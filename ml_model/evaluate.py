# evaluate.py — Model Accuracy Check

import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

# Device
device = torch.device('cpu')

# Transform
test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Load test data
print("📂 Loading test data...")
test_data   = datasets.ImageFolder('ml_model/data/test',
                                    transform=test_transform)
test_loader = DataLoader(test_data, batch_size=16, shuffle=False)
print(f"✅ Test images: {len(test_data)}")

# Load model
print("🧠 Loading model...")
model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)
model.load_state_dict(torch.load(
    'ml_model/saved_model/pneumonia_model.pth',
    map_location=device))
model.eval()
print("✅ Model loaded!")

# Evaluate
correct = 0
total   = 0

with torch.no_grad():
    for images, labels in test_loader:
        outputs = model(images)
        _, predicted = torch.max(outputs, 1)
        total   += labels.size(0)
        correct += (predicted == labels).sum().item()

accuracy = 100 * correct / total
print(f"\n🏆 Test Accuracy: {accuracy:.2f}%")

if accuracy >= 85:
    print("✅ Excellent! Model is production ready!")
elif accuracy >= 75:
    print("✅ Good! Model is working well!")
else:
    print("⚠️ Model needs more training!")