# 🫁 PneumoAI — AI-Powered Pneumonia Detection System

<div align="center">

![PneumoAI Banner](https://img.shields.io/badge/PneumoAI-Pneumonia%20Detection-blue?style=for-the-badge&logo=lungs)

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-pneumoai--h729.vercel.app-success?style=for-the-badge)](https://pneumoai-h729.vercel.app)
[![Backend](https://img.shields.io/badge/🤗%20Backend-HuggingFace%20Spaces-yellow?style=for-the-badge)](https://moharman-pneumoaibackend.hf.space)
[![GitHub](https://img.shields.io/badge/GitHub-mo--arman%2Fpneumoai-black?style=for-the-badge&logo=github)](https://github.com/mo-arman/pneumoai)

**A full-stack, production-grade AI web application that detects pneumonia from chest X-Ray images using Deep Learning.**

</div>

---

## 📸 Screenshots

| Login Page | Analysis Page | Results |
|------------|--------------|---------|
| Auth with JWT | Upload X-Ray | AI Prediction + GradCAM |

---

## 🚀 Live URLs

| Service | Platform | URL |
|---------|----------|-----|
| 🌐 Frontend | Vercel | https://pneumoai-h729.vercel.app |
| ⚙️ Backend API | HuggingFace Spaces | https://moharman-pneumoaibackend.hf.space |
| 📚 API Docs | FastAPI Swagger | https://moharman-pneumoaibackend.hf.space/docs |
| 🤖 AI Model | HuggingFace Model Hub | https://huggingface.co/moharman/pneumoai-model |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure Signup/Login with token-based auth
- 🫁 **AI Pneumonia Detection** — ResNet18 deep learning model trained on 5,856 chest X-Ray images
- 🔥 **GradCAM Visualization** — Shows exactly where the AI focused on the X-Ray
- 📋 **Patient History** — All scans saved to MongoDB with patient name, age, date
- 🎨 **4 Themes** — Dark, Light, Ocean, Purple
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop
- ⚡ **Real-time Analysis** — Results in under 2 seconds
- 🗑️ **Delete History** — Users can manage their scan history

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI Framework |
| JavaScript (ES6+) | Programming Language |
| CSS3 | Styling & Animations |
| LocalStorage | Token Persistence |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | REST API Framework |
| Python 3.10 | Programming Language |
| JWT (python-jose) | Authentication |
| Passlib + bcrypt | Password Hashing |
| Uvicorn | ASGI Server |

### AI/ML
| Technology | Purpose |
|-----------|---------|
| PyTorch 2.1 | Deep Learning Framework |
| ResNet18 | CNN Architecture (Transfer Learning) |
| TorchVision | Image Transforms |
| GradCAM | Model Explainability |
| OpenCV | Image Processing |
| Pillow | Image Handling |

### Database & Deployment
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud Database |
| Vercel | Frontend Hosting |
| HuggingFace Spaces | Backend Hosting (Docker) |
| HuggingFace Model Hub | AI Model Storage |
| GitHub | Version Control |

---

## 📁 Project Structure

```
healthcare-prediction/
│
├── frontend/                    # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.png
│   ├── src/
│   │   ├── App.js              # Main App Component
│   │   ├── App.css             # Styles + Themes
│   │   └── index.js
│   └── package.json
│
├── backend/                     # FastAPI Backend
│   ├── main.py                 # App Entry Point + CORS
│   ├── requirements.txt        # Python Dependencies
│   ├── Dockerfile              # Docker Config for HuggingFace
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py             # Signup/Login Routes
│   │   ├── predict.py          # AI Prediction Route
│   │   └── history.py          # Scan History Routes
│   └── services/
│       ├── auth_service.py     # JWT + User Management
│       ├── model_service.py    # AI Model Loading + Inference
│       ├── gradcam_service.py  # GradCAM Visualization
│       └── history_service.py  # MongoDB Operations
│
├── ml_model/                    # ML Training Code
│   ├── train.py                # ResNet18 Training Script
│   ├── evaluate.py             # Model Evaluation
│   └── training_results.png    # Training Graphs
│
├── render.yaml                  # Render Config (optional)
├── .gitignore
└── README.md
```

---

## 🧠 AI Model Details

| Property | Value |
|----------|-------|
| Architecture | ResNet18 (Transfer Learning) |
| Dataset | Chest X-Ray Images (Pneumonia) — Kaggle |
| Training Images | 5,216 |
| Validation Images | 16 |
| Test Images | 624 |
| Classes | NORMAL, PNEUMONIA |
| Accuracy | ~88% |
| Input Size | 224 × 224 RGB |
| Framework | PyTorch 2.1 |

### Training Configuration
```python
Optimizer:     Adam
Learning Rate: 0.001
Batch Size:    32
Epochs:        10
Loss:          CrossEntropyLoss
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Create new account | ❌ |
| POST | `/auth/login` | Login & get JWT token | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| POST | `/predict` | Analyze chest X-Ray | ✅ Optional |
| GET | `/history` | Get scan history | ✅ |
| DELETE | `/history/{id}` | Delete a record | ✅ |
| GET | `/` | Health check | ❌ |
| GET | `/docs` | Swagger API Docs | ❌ |

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.10+
- Node.js 20+
- MongoDB (local or Atlas)

### 1. Clone Repository
```bash
git clone https://github.com/mo-arman/pneumoai.git
cd pneumoai
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

### 3. Create .env file in backend/
```env
MONGODB_URL=mongodb+srv://your_connection_string
SECRET_KEY=your_secret_key
ALGORITHM=HS256
```

### 4. Run Backend
```bash
uvicorn main:app --reload
# Backend runs on http://localhost:8000
```

### 5. Frontend Setup
```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

---

## 🌐 Deployment Architecture

```
User Browser
     │
     ▼
┌─────────────┐
│   Vercel    │  ← React Frontend
│  (Frontend) │
└─────────────┘
     │
     │ API Calls (HTTPS)
     ▼
┌──────────────────┐
│  HuggingFace     │  ← FastAPI Backend (Docker)
│  Spaces          │
│  (Backend)       │
└──────────────────┘
     │              │
     │              ▼
     │    ┌──────────────────┐
     │    │  HuggingFace     │  ← AI Model (.pth file)
     │    │  Model Hub       │
     │    └──────────────────┘
     ▼
┌─────────────┐
│   MongoDB   │  ← Cloud Database
│   Atlas     │
└─────────────┘
```

---

## 👨‍💻 Developer

**Mohammad Arman**
- GitHub: [@mo-arman](https://github.com/mo-arman)
- Email: moharman3818@gmail.com

---

## ⚠️ Disclaimer

> This application is built for **educational purposes only**. It should **NOT** be used as a substitute for professional medical diagnosis. Always consult a qualified doctor for medical advice.

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**🫁 PneumoAI — Built with PyTorch + FastAPI + React**

⭐ Star this repo if you found it helpful!

</div>
