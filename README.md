# 🎓 Live Code Mentor (Gemini Mentor Hub)

## AI-Powered Educational Platform | Google DeepMind Gemini 3 Hackathon 2026

<div align="center">

![Live Code Mentor](https://img.shields.io/badge/Live%20Code%20Mentor-Gemini%203-blue?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**🏆 Built for Google DeepMind Gemini 3 Hackathon 2026**

</div>

---

## 🔐 Judge Login Credentials

```
📧 Email:    judge@gemini3hackathon.dev
🔑 Password: Gemini3Hackathon2026!
```

Simply visit the application, enter these credentials, and explore all features!

---

## 📋 Table of Contents

- [Inspiration](#-inspiration)
- [What It Does](#-what-it-does)
- [How We Built It](#-how-we-built-it)
- [Challenges We Ran Into](#-challenges-we-ran-into)
- [Accomplishments](#-accomplishments-that-were-proud-of)
- [What We Learned](#-what-we-learned)
- [What's Next](#-whats-next-for-gemini-mentor-hub)
- [Built With](#-built-with)
- [Gemini Models Usage](#-gemini-models-usage)
- [Quick Start](#-quick-start)

---

## 💡 Inspiration

The idea for **Gemini Mentor Hub** was born from a simple observation: **learning to code is still unnecessarily hard.**

We noticed several pain points that developers face:

1. **Generic tutorials** that don't adapt to your skill level
2. **No real-time help** when you're stuck on a specific line of code
3. **CV preparation** that's disconnected from actual interview prep
4. **Video tutorials** where you can't ask questions about what you're watching
5. **No intelligent feedback** on your progress or gaps

**What if AI could be your personal senior engineer mentor?** Not just answering questions, but proactively watching your code, understanding your learning journey, and adapting to YOUR needs?

The release of **Google Gemini 3** gave us the perfect opportunity. With its revolutionary multimodal capabilities, deep reasoning, and ultra-fast responses, we could finally build the AI mentor we always wished we had.

---

## 🚀 What It Does

**Gemini Mentor Hub** is a comprehensive AI-powered learning platform with 7 major features:

### 1. 🧠 Intelligent Code Learning
- **Line-by-line mentoring** - Click any line, get contextual explanations
- **Skill-level adaptation** - AI adjusts complexity (Beginner → Senior)
- **Real-time code execution** - Run Python/JavaScript directly
- **Proactive bug detection** - AI watches your code and warns you

### 2. 🤖 Multi-Agent AI System (Moltbot)
- **6 specialized agents** - General, Research, Coding, Creative, Learning, Business
- **Senior Engineer Thinking Mode** - Deep reasoning with explicit trade-off analysis
- **Session memory** - Remembers your entire learning journey

### 3. 📹 Video Learning with AI Companion
- **YouTube transcript analysis** - AI reads along with you
- **Proactive help** - AI detects when you're confused (rewinding, pausing)
- **Comprehension checks** - Auto-generated quizzes based on video progress
- **Timestamp-aware Q&A** - Ask "what did they mean at 2:30?"

### 4. 📄 CV Intelligence & Interview Mentor
- **CV parsing** - PDF, DOCX, LaTeX support
- **Job-aware gap analysis** - Shows missing skills for target roles
- **AI interview simulator** - HR, Technical, and Hiring Manager rounds
- **"If I Were You" answers** - Model answers based ONLY on your CV (no fabrication)
- **14-day learning roadmap** - Personalized prep plan

### 5. 🎬 Remotion Video Studio
- **4-agent code generation** - Requirements → Architecture → Code → Review
- **42 Remotion packages** - Full animation toolkit
- **Monaco editor integration** - VS Code experience in browser
- **One-click preview** - See your animations instantly

### 6. 📰 AI News Aggregator
- **Live tech news** - From multiple sources
- **AI summarization** - Get key points instantly
- **Category filtering** - AI, Programming, Cloud, Security, etc.

### 7. 🎯 Personalized Learning Paths
- **Custom curriculum generation** - Enter ANY topic, get structured learning
- **Domain-specific AI** - Detects cooking, medical, art, etc. for specialized guidance
- **Progress tracking** - Visual completion status

---

## 🔨 How We Built It

### Architecture Design

We chose a modern, scalable stack:

```
Frontend: React 19 + TailwindCSS + Monaco Editor
Backend:  FastAPI (Python 3.11) + Async Programming
Database: MongoDB (document-based for flexibility)
AI:       Gemini 3 via Emergent Integrations
```

### The AI Brain

We leveraged **Emergent Integrations** for a unified LLM interface:

```python
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Single API for multiple models
chat = LlmChat(
    api_key=EMERGENT_LLM_KEY,
    model="gemini-3-flash-preview",
    system_prompt=skill_aware_prompt
)
```

### Multi-Agent System

For the **Moltbot** and **Remotion Studio**, we implemented a sequential multi-agent pipeline:

```
User Prompt → Agent 1 (Requirements) → Agent 2 (Architecture) → Agent 3 (Code) → Agent 4 (Review)
```

Each agent has a specialized system prompt and passes context to the next.

### Skill-Level Adaptation

We created dynamic prompts that change based on user level:

```python
def get_skill_aware_prompt(skill_level: str):
    complexity_map = {
        "beginner": "Explain like I'm 5. Use simple analogies.",
        "intermediate": "Assume basic programming knowledge.",
        "advanced": "Be technical. Discuss edge cases.",
        "senior": "Discuss architecture, trade-offs, and production concerns."
    }
    return f"{base_prompt}\n\nUser Level: {complexity_map[skill_level]}"
```

---

## 🧗 Challenges We Ran Into

### 1. Real-Time Code Analysis
**Problem:** Analyzing code on every keystroke overwhelmed the API.
**Solution:** Implemented debouncing (500ms delay) and smart caching.

### 2. YouTube Transcript Fetching
**Problem:** Many videos have auto-generated transcripts with poor quality.
**Solution:** Added fallback to multiple languages and transcript cleaning.

### 3. CV Parsing Accuracy
**Problem:** PDFs have wildly inconsistent formatting.
**Solution:** Combined multiple parsers + AI post-processing.

### 4. Interview Answer Evaluation
**Problem:** AI was too generous with scores.
**Solution:** Created rubric-based evaluation with specific criteria.

### 5. Multi-Agent Coordination
**Problem:** Agents were producing inconsistent outputs.
**Solution:** Strict JSON schemas with Pydantic validation.

### 6. Memory Management
**Problem:** Long conversations exhausted context windows.
**Solution:** Implemented sliding window with summarization.

---

## 🏆 Accomplishments That We're Proud Of

1. **True Skill-Level Adaptation** - The AI genuinely adapts its teaching style based on user level
2. **Proactive Video Mentoring** - Detects confusion by watching user behavior and offers help
3. **"If I Were You" Interview Answers** - Generates honest answers based only on CV content
4. **4-Agent Remotion Generator** - Multi-agent pipeline produces production-quality animations
5. **Universal LLM Integration** - Users can switch between Gemini, GPT, and Claude seamlessly
6. **Full-Stack Polish** - Glass morphism UI, smooth animations, professional UX

---

## 📚 What We Learned

### Technical Learnings
1. **Gemini 3 is incredible for code** - Understanding, explanation, and generation quality exceeded expectations
2. **Multi-agent systems need careful orchestration** - Pydantic validation was essential
3. **Prompt engineering is an art** - Hours spent refining skill-level prompts
4. **Async Python is powerful but tricky** - Error handling requires extra care
5. **Monaco Editor is amazing** - Bringing VS Code to the browser was easier than expected

### Product Learnings
1. **Users want proactive help** - Most praised feature was AI "watching" and offering help
2. **Skill-level adaptation is essential** - Generic responses frustrate both beginners and experts
3. **Interview prep is more than questions** - CV-aware answers valued more than unlimited practice
4. **Video learning needs AI enhancement** - Passive watching is inefficient

---

## 🔮 What's Next for Gemini Mentor Hub

### Short-Term (Next 3 Months)
- [ ] Voice-based coding assistant
- [ ] Collaborative learning sessions
- [ ] GitHub integration
- [ ] Mobile app (React Native)

### Medium-Term (6 Months)
- [ ] LeetCode/HackerRank integration
- [ ] Custom agent creation
- [ ] Team features for bootcamps
- [ ] Certificate generation

### Long-Term Vision
- [ ] Real-time pair programming with AI
- [ ] Multi-language localization
- [ ] AR/VR coding environments
- [ ] Enterprise self-hosted version

---

## 🛠️ Built With

### AI & Machine Learning

| Technology | Purpose | Model/Version |
|------------|---------|---------------|
| **Google Gemini 3** | Primary AI Engine | gemini-3-flash-preview, gemini-3-pro-preview |
| **Gemini 2.5 Pro** | Deep Research & Analysis | gemini-2.5-pro |
| **Gemini 2.0 Flash** | Video Processing | gemini-2.0-flash-exp |
| **Emergent Integrations** | Universal LLM API Client | v0.1.0 |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Python** | Server-side Programming | 3.11+ |
| **FastAPI** | REST API Framework | 0.115.5 |
| **Uvicorn** | ASGI Web Server | 0.32.1 |
| **Motor** | Async MongoDB Driver | 3.6.0 |
| **pdfplumber** | PDF Parsing | 0.11.4 |
| **python-docx** | Word Document Processing | 1.1.2 |
| **Playwright** | Browser Automation | 1.58.0 |
| **BeautifulSoup4** | HTML Parsing | 4.14.3 |

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 19.0.0 |
| **TailwindCSS** | Utility-first CSS | 3.4.17 |
| **Monaco Editor** | Code Editor (VS Code) | 4.7.0 |
| **Framer Motion** | Animations | 12.29.2 |
| **Lucide React** | Icons | 0.507.0 |
| **Recharts** | Data Visualization | 3.7.0 |
| **React Markdown** | Markdown Rendering | 10.1.0 |
| **Radix UI** | Accessible Components | Various |

### Database & Infrastructure

| Technology | Purpose |
|------------|---------|
| **MongoDB** | NoSQL Database (v7.0) |
| **Docker** | Containerization |
| **Kubernetes** | Container Orchestration |
| **Nginx** | Reverse Proxy |
| **Supervisor** | Process Management |

---

## 🤖 Gemini Models Usage

### Model Overview

| Model | Speed | Primary Use |
|-------|-------|-------------|
| `gemini-3-flash-preview` | ⚡ Ultra Fast | 85% of features (default) |
| `gemini-3-pro-preview` | 🧠 Deep Reasoning | 12% (complex analysis) |
| `gemini-3-pro-image-preview` | 🖼️ Vision | 2% (image generation) |
| `gemini-2.0-flash-exp` | 🎬 Video | 1% (video processing) |

### Feature → Model Mapping

| Feature | Model | Why |
|---------|-------|-----|
| **Learning Tab** | `gemini-3-flash-preview` | Fast real-time help |
| **Moltbot Chat** | `gemini-3-flash-preview` | Quick responses |
| **CV Gap Analysis** | `gemini-3-pro-preview` | Deep skill analysis |
| **Interview Evaluation** | `gemini-3-pro-preview` | Nuanced scoring |
| **Business Research** | `gemini-3-pro-preview` | Comprehensive insights |
| **Remotion Studio** | `gemini-3-flash-preview` | Fast code generation |
| **Visual Generation** | `gemini-3-pro-image-preview` | Image output |
| **Video Analysis** | `gemini-2.0-flash-exp` | Video support |

### Model Selection Logic

```python
def get_chat_instance(system_message, model_type="fast"):
    model_map = {
        "fast": "gemini-3-flash-preview",      # Default
        "pro": "gemini-3-pro-preview",         # Deep reasoning
        "balanced": "gemini-2.5-pro",          # Balanced
        "ultra_fast": "gemini-2.5-flash-lite"  # High-volume
    }
    return LlmChat(...).with_model("gemini", model_map[model_type])
```

---

## 🚀 Quick Start

### Prerequisites
- Docker (recommended) OR:
  - Python 3.11+
  - Node.js 18+
  - MongoDB 7.0+
  - Yarn

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone <your-repo-url>
cd live-code-mentor

# Start all services
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8001
```

### Option 2: Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (new terminal)
cd frontend
yarn install
yarn start
```

### Environment Variables

**Backend (.env):**
```env
EMERGENT_LLM_KEY=sk-emergent-your-key-here
MONGO_URL=mongodb://localhost:27017
DB_NAME=live_code_mentor
CORS_ORIGINS=*
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React 19 + TailwindCSS                    │
│                   (Modern Frontend Stack)                    │
└─────────────────────────────┬───────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI + Python 3.11                       │
│                (High-Performance Backend)                    │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────────┐
       │ MongoDB  │    │ Gemini 3 │    │ File Storage │
       │   7.0    │    │   AI     │    │    System    │
       └──────────┘    └──────────┘    └──────────────┘
```

---

## 📁 Project Structure

```
live-code-mentor/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── App.js            # Main app
│   │   └── index.js          # Entry point
│   ├── package.json          # Node dependencies
│   └── .env                  # Frontend config
│
├── BUILT_WITH.md             # Technology stack
├── PROJECT_STORY.md          # Hackathon story
├── GEMINI_MODELS_USAGE.md    # Model documentation
└── README.md                 # This file
```

---

## 🙏 Acknowledgments

- **Google DeepMind** - For creating Gemini 3
- **Emergent AI** - For the universal LLM integration
- **The React & FastAPI communities** - For incredible open-source tools

---

<div align="center">

**Built with ❤️ for Google DeepMind Gemini 3 Hackathon 2026**

*"The best mentor is one who meets you where you are."*

---

**Version:** 2.0.0 | **Last Updated:** February 2026

</div>
