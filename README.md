# LifeOS AI — Your Personal AI Productivity OS

<div align="center">

![LifeOS AI](https://img.shields.io/badge/LifeOS-AI%20Powered-6366f1?style=for-the-badge&logo=sparkles)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack AI-powered personal productivity operating system built with FastAPI, Next.js, and LangChain.**

[🌐 Live Demo](https://lifeos-ai-ml9f.vercel.app) · [📖 API Docs](https://moharman-lifeos-backend.hf.space/api/docs) · [💻 GitHub](https://github.com/mo-arman/lifeos-ai)

</div>

---

## 🚀 Overview

LifeOS AI is a comprehensive personal productivity platform that leverages the power of AI agents to help you manage every aspect of your life — from tasks and finance to health tracking and team collaboration. Built with a modern tech stack, it features 6 specialized AI agents, real-time web search, multilingual support (Hindi/English/Hinglish), and 20+ integrated features.

---

## ✨ Features

### 🤖 AI Agents
| Agent | Capabilities |
|-------|-------------|
| **Task Agent** | Create, update, delete, and list tasks with natural language |
| **Calendar Agent** | Schedule events, sync with Google Calendar |
| **Finance Agent** | Track expenses, generate spending summaries |
| **Email Agent** | Read, summarize, and send emails via Gmail |
| **Study Agent** | Generate flashcards, create study plans |
| **Research Agent** | Real-time web search powered by Tavily |

### 📱 Core Features
- **🧠 AI Chat** — Conversational AI with long-term memory and context awareness
- **✅ Task Manager** — Full CRUD with priorities, due dates, and comments
- **🗂️ Kanban Board** — Drag & drop task management with @dnd-kit
- **📅 Calendar** — Event management with Google Calendar sync
- **💰 Finance Tracker** — Expense tracking, budget alerts, and spending analytics
- **📝 Rich Text Notes** — Full-featured editor with Tiptap
- **📧 Gmail Integration** — AI-powered email summarization and compose
- **🎙️ AI Meeting Notes** — Voice input + AI summarization with action items
- **💪 Health & Sleep Tracker** — Daily health metrics and sleep quality monitoring
- **📔 Mood Journal** — Daily mood tracking with AI-generated insights
- **🌐 Language Translator** — 15 languages with voice output (TTS)
- **📰 News Feed** — Real-time AI-powered personalized news
- **📄 AI Resume Builder** — Professional CV generator with PDF export
- **🎤 Voice Assistant** — Hands-free AI control with speech recognition
- **🧾 Invoice Generator** — Professional invoices with PDF export
- **🧠 Flashcards** — AI-generated study cards with spaced repetition
- **⏱️ Pomodoro Timer** — Focus timer with SVG animation
- **🔥 Habit Tracker** — 7-day habit grid tracking
- **👥 Team Collaboration** — Real-time team chat, task assignment, invite system
- **📊 Analytics** — AI-powered weekly reports with charts
- **📱 WhatsApp Bot** — Full AI assistant via WhatsApp using Twilio
- **🎨 6 Custom Themes** — Dark, Light, Purple, Green, Blue, Red

---

## 🏗️ Architecture

```
lifeos/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── agents/            # 6 AI Agents (LangChain + Groq)
│   │   │   ├── orchestrator.py  # Intent classification & routing
│   │   │   ├── task_agent.py
│   │   │   ├── calendar_agent.py
│   │   │   ├── finance_agent.py
│   │   │   ├── email_agent.py
│   │   │   ├── study_agent.py
│   │   │   └── research_agent.py
│   │   ├── api/               # REST API endpoints
│   │   ├── models/            # SQLAlchemy models
│   │   ├── tools/             # LangChain tools
│   │   ├── memory/            # Persistent memory system
│   │   └── services/          # Gmail, LLM factory, Auth
│   └── Dockerfile
│
└── frontend/                  # Next.js 16 Frontend
    ├── app/
    │   ├── dashboard/         # 20+ feature pages
    │   └── (auth)/           # Login & Register
    ├── components/
    ├── hooks/
    ├── lib/
    └── store/                 # Zustand state management
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance async REST API |
| **LangChain + Groq** | AI agent framework (Llama 3.3 70B) |
| **SQLAlchemy + SQLite** | Async database ORM |
| **Google APIs** | Gmail & Calendar integration |
| **Tavily** | Real-time web search |
| **Twilio** | WhatsApp bot integration |
| **JWT + PBKDF2** | Secure authentication |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with TypeScript |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | Lightweight state management |
| **Recharts** | Data visualization & analytics |
| **@dnd-kit** | Drag & drop Kanban board |
| **Tiptap** | Rich text editor |
| **jsPDF** | PDF export functionality |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- API keys: Groq, Tavily, (optional) Twilio

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/mo-arman/lifeos-ai.git
cd lifeos-ai/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

### Environment Variables

```env
# Backend (.env)
SECRET_KEY=your-secret-key
ACTIVE_LLM=groq
GROQ_API_KEY=your-groq-api-key
TAVILY_API_KEY=your-tavily-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_NUMBER=+14155238886
ALLOWED_ORIGINS=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| **Frontend** | Vercel | [lifeos-ai-ml9f.vercel.app](https://lifeos-ai-ml9f.vercel.app) |
| **Backend** | Hugging Face Spaces | [moharman-lifeos-backend.hf.space](https://moharman-lifeos-backend.hf.space) |

---

## 📸 Screenshots

### Dashboard
- AI-powered daily briefing
- Quick stats: tasks, events, expenses
- Recent activity feed

### AI Chat
- Natural language task management
- Hindi/English/Hinglish support
- Long-term memory retention

### Kanban Board
- Drag & drop task management
- Priority-based color coding
- Real-time updates

---

## 🤖 AI Capabilities

### Multi-Language Support
LifeOS AI automatically detects and responds in:
- **English** — Full feature support
- **Hindi** — हिंदी में बात करें
- **Hinglish** — Mix kar ke bolo

### Long-term Memory
The AI remembers:
- Your name and preferences
- Past conversations and context
- Personal goals and habits
- Work and study patterns

### Example Commands
```
"Add task: Submit assignment by Friday"
"मेरे tasks दिखाओ"
"I spent 200 rupees on lunch"
"Schedule a meeting tomorrow at 3pm"
"Research latest AI trends"
"Show my expenses this month"
```

---

## 📊 API Documentation

Once running, visit:
- **Swagger UI:** `http://localhost:8000/api/docs`
- **ReDoc:** `http://localhost:8000/api/redoc`

### Key Endpoints
```
POST /api/auth/register     — User registration
POST /api/auth/login        — User authentication
POST /api/chat/message      — AI chat message
GET  /api/tasks             — List tasks
POST /api/tasks             — Create task
GET  /api/finance/expenses  — List expenses
POST /api/finance/expenses  — Track expense
GET  /api/calendar          — List events
POST /api/meetings          — Create meeting
POST /api/meetings/{id}/summarize — AI summarize
```

---

## 🔐 Security

- **JWT Authentication** with secure token rotation
- **PBKDF2 password hashing** with salt
- **CORS protection** with allowed origins
- **Environment variables** for all sensitive data
- **SQL injection prevention** via SQLAlchemy ORM

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time WebSocket chat
- [ ] Multi-user workspace
- [ ] AI image generation
- [ ] Plugin system
- [ ] Self-hosted LLM support

---

## 👨‍💻 Author

**Mohammad Arman**

Aspiring AI Engineer passionate about building intelligent systems that make life easier.

- GitHub: [@mo-arman](https://github.com/mo-arman)
- Project: [LifeOS AI](https://lifeos-ai-ml9f.vercel.app)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using FastAPI, Next.js, and LangChain**

⭐ Star this repo if you find it useful!

</div>
