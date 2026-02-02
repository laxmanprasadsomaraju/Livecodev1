# 🎓 Live Code Mentor

## AI-Powered Educational Platform with Multi-Modal Learning

Live Code Mentor is a comprehensive AI-powered learning platform that helps developers learn to code through interactive mentoring, real-time code analysis, CV optimization, interview preparation, and more.

---

## 🚀 Quick Start

### Prerequisites

- **Docker** (recommended) or:
  - Python 3.11+
  - Node.js 18+
  - MongoDB 7.0+
  - Yarn package manager

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd live-code-mentor

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys

# Start backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env and configure REACT_APP_BACKEND_URL

# Start frontend
yarn start
```

#### MongoDB Setup

```bash
# Start MongoDB (using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# OR install MongoDB locally
# Follow: https://docs.mongodb.com/manual/installation/
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
# Emergent LLM Key (Universal key for OpenAI, Anthropic, Google)
EMERGENT_LLM_KEY=sk-emergent-your-key-here

# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=live_code_mentor

# CORS Settings
CORS_ORIGINS=*
```

### Frontend (.env)

```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🤖 AI Models Used

### Model Architecture

This platform uses **Emergent LLM Integration** with the following models:

#### **1. Google Gemini Models (Primary)**

| Model | Use Case | Features |
|-------|----------|----------|
| `gemini-3-flash-preview` | Default (Fast responses) | Code analysis, quick Q&A, chat |
| `gemini-3-pro-preview` | Deep research & reasoning | Complex problems, detailed analysis |
| `gemini-2.5-pro` | Balanced performance | General-purpose tasks |
| `gemini-2.5-flash-lite` | High-volume tasks | Simple, rapid responses |
| `gemini-3-pro-image-preview` | Image analysis | Screenshots, diagrams, visual learning |
| `gemini-2.0-flash-exp` | Video processing | Video transcripts, frame analysis |

#### **2. OpenAI Models (Optional)**
- `gpt-4o` - Available for custom API key users
- Used for alternative processing when specified

#### **3. Anthropic Models (Optional)**
- `claude-sonnet-4-20250514` - Available for custom API key users
- Used in Remotion code generation as alternative

---

## 📋 Features & AI Models by Tab

### **1. 🧠 Learning Tab**
**AI Model:** Gemini 3 Flash Preview (default), upgrades to Pro for complex topics

**Features:**
- **Line-by-line mentoring** - AI explains each line of your code
- **Skill-level aware** - Adapts explanations (Beginner → Senior)
- **Real-time help** - Instant responses to coding questions
- **Code execution** - Run Python/JavaScript directly in browser
- **Video learning** - AI analyzes coding tutorial videos

**Model Switching:**
- Simple questions: Gemini Flash (fast)
- Complex topics: Gemini Pro (detailed)
- Video analysis: Gemini 2.0 Flash Exp

---

### **2. 🤖 Agents Tab**
**AI Model:** Gemini 3 Flash Preview with specialized agent personas

**Features:**
- **6 Specialized Agents:**
  - General Learning Tutor
  - Research Assistant
  - Coding Expert
  - Creative Problem Solver
  - Business Analyst
  - Learning Path Designer
- **Multi-agent conversations** - Switch between agents
- **Context retention** - Agents remember your learning journey

**Model:** Single Gemini model with different system prompts per agent

---

### **3. 🦞 Moltbot Tab**
**AI Model:** Gemini 3 Flash Preview (multi-turn conversations)

**Features:**
- **Conversational coding mentor**
- **Project upload & analysis**
- **Code improvement suggestions**
- **Architecture discussions**
- **Best practices guidance**

**Model Behavior:**
- Maintains conversation history
- Adapts tone to user's level
- Provides contextual suggestions

---

### **4. 📰 News Tab**
**AI Model:** Gemini 2.5 Pro (for summarization)

**Features:**
- **Live tech news aggregation**
- **AI-powered summarization**
- **Multi-category filtering** (AI, Programming, Cloud, Security, etc.)
- **Detailed article analysis**

**Model Usage:**
- News fetching: Direct API calls
- Summarization: Gemini 2.5 Pro
- Key points extraction: Gemini Flash

---

### **5. 📄 CV Intelligence & Interview Mentor**
**AI Models:** Multiple models for different tasks

#### **CV Analysis & Editing**
- **Model:** Gemini 3 Flash Preview
- **Features:**
  - PDF/DOCX/LaTeX parsing
  - Section-by-section editing
  - Job-aware suggestions
  - Gap analysis
  - ATS optimization

#### **Interview Preparation**
- **Model:** Gemini 3 Pro Preview (for deep evaluation)
- **Features:**
  - Role-specific question generation
  - Answer evaluation with scoring
  - "If I Were You" model answers
  - Real-time feedback
  - Timer & voice recording

#### **Learning Roadmap**
- **Model:** Gemini 3 Pro Preview
- **Features:**
  - 7/14/30 day prep plans
  - Time-boxed task breakdown
  - Skill gap closure strategies

**Model Switching Logic:**
```
CV Parsing: Gemini Flash (fast extraction)
Job Analysis: Gemini Pro (detailed gap analysis)
Interview Questions: Gemini Pro (quality questions)
Answer Evaluation: Gemini Pro (nuanced scoring)
```

---

### **6. 🎬 Remotion Studio**
**AI Model:** Gemini 3 Flash Preview (with multi-agent system)

**Features:**
- **4-Agent Code Generation System:**
  1. Requirements Analyzer
  2. Code Architect
  3. Code Generator
  4. Code Reviewer
- **42 Remotion packages** supported
- **Code validation** & syntax checking
- **Package auto-detection**
- **Monaco code editor**

**Multi-Agent Flow:**
```
User Prompt
    ↓
Agent 1: Analyzes requirements (Gemini Flash)
    ↓
Agent 2: Designs architecture (Gemini Flash)
    ↓
Agent 3: Generates code (Gemini Flash)
    ↓
Agent 4: Reviews & validates (Gemini Flash)
    ↓
Production-Ready Remotion Code
```

---

## 🎯 Core AI Features

### **1. Context-Aware Learning**
- AI adapts based on your skill level (Beginner/Intermediate/Advanced/Senior)
- Remembers conversation history
- Provides personalized learning paths

### **2. Multi-Modal Processing**
- **Text:** Code explanations, Q&A
- **Images:** Screenshot analysis, diagram explanations
- **Video:** Tutorial transcript analysis, frame extraction
- **Audio:** Voice-to-text for interviews

### **3. Job-Aware Intelligence**
- Stores job descriptions with CVs
- Provides job-specific suggestions
- Keyword optimization for ATS
- Gap analysis against job requirements

### **4. Code Execution**
- Python sandbox execution
- JavaScript Node.js execution
- Real-time output display
- Error handling & debugging

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  - Monaco Editor, TailwindCSS, Lucide Icons             │
│  - Port: 3000                                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓ REST API
┌─────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                       │
│  - Python 3.11, Emergent LLM Client                     │
│  - Port: 8001                                           │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
┌──────────────────┐    ┌──────────────────┐
│   MongoDB        │    │  Emergent LLM    │
│   Database       │    │  (Gemini/GPT/    │
│   Port: 27017    │    │   Claude)        │
└──────────────────┘    └──────────────────┘
```

---

## 🔧 Technical Stack

### **Backend**
- **Framework:** FastAPI (Python 3.11)
- **AI Integration:** Emergent LLM Client
- **Database:** MongoDB 7.0
- **File Processing:**
  - PDFs: pdfplumber, PyPDF2
  - DOCX: python-docx
  - Images: Pillow
  - Videos: playwright
- **Code Execution:** subprocess with sandboxing

### **Frontend**
- **Framework:** React 18
- **Styling:** TailwindCSS 3
- **Code Editor:** Monaco Editor (VS Code)
- **Icons:** Lucide React
- **State Management:** React Hooks
- **API Client:** Fetch API

### **DevOps**
- **Process Manager:** Supervisor
- **Web Server:** Nginx (reverse proxy)
- **Containerization:** Docker & Docker Compose
- **Environment:** Kubernetes-ready

---

## 📁 Project Structure

```
live-code-mentor/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Backend environment variables
│   └── data/                  # Data storage
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── LearningView.jsx
│   │   │   ├── CVIntelligenceView.jsx
│   │   │   ├── RemotionStudioView.jsx
│   │   │   └── ...
│   │   ├── App.js            # Main app component
│   │   └── index.js          # Entry point
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
│   └── .env                  # Frontend environment variables
│
├── tests/                    # Test files
├── scripts/                  # Utility scripts
├── docker-compose.yml        # Docker configuration
└── README.md                 # This file
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
yarn test
```

### End-to-End Tests
```bash
# Coming soon
```

---

## 🔒 Security Features

1. **API Key Protection**
   - Environment variable storage
   - No hardcoded keys in code
   - Emergent LLM key rotation support

2. **Code Execution Sandbox**
   - Isolated subprocess execution
   - Timeout protection (2 minutes)
   - Resource limitations

3. **CORS Configuration**
   - Configurable origins
   - Secure headers

4. **Input Validation**
   - Pydantic models for all requests
   - File type validation
   - Size limits on uploads

---

## 📚 API Documentation

### Access API Docs
```
# Swagger UI
http://localhost:8001/docs

# ReDoc
http://localhost:8001/redoc
```

### Key Endpoints

**Learning:**
- `POST /api/analyze-code` - Analyze code quality
- `POST /api/execute-code` - Execute code
- `POST /api/explain-line` - Line-by-line explanations

**Moltbot:**
- `POST /api/moltbot/chat` - Multi-agent chat
- `POST /api/moltbot/project-upload` - Upload project
- `GET /api/moltbot/status` - Gateway status

**CV Intelligence:**
- `POST /api/cv/upload` - Upload CV with job description
- `POST /api/cv/section/chat-edit` - Job-aware editing
- `POST /api/cv/analyze` - Gap analysis
- `POST /api/cv/interview/generate` - Generate questions

**Remotion:**
- `POST /api/remotion/generate-code` - Generate video code
- `POST /api/remotion/code/validate` - Validate code
- `POST /api/remotion/packages/install-all` - Install packages

---

## 🎨 Customization

### Changing AI Models

Edit `/app/backend/server.py`:

```python
# Change default model
def get_chat_instance(system_prompt: str, model_type: str = "fast"):
    model_map = {
        "fast": "gemini-3-flash-preview",      # Change this
        "pro": "gemini-3-pro-preview",         # Or this
        "balanced": "gemini-2.5-pro",
        "ultra_fast": "gemini-2.5-flash-lite"
    }
    selected_model = model_map.get(model_type, "gemini-3-flash-preview")
```

### Using Custom API Keys

Users can provide their own API keys in the settings panel:
- OpenAI API Key
- Anthropic API Key
- Google Gemini API Key

---

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
tail -f /var/log/supervisor/backend.err.log

# Common fixes
pip install -r requirements.txt
sudo supervisorctl restart backend
```

### Frontend not connecting to backend
```bash
# Check REACT_APP_BACKEND_URL in frontend/.env
echo $REACT_APP_BACKEND_URL

# Should be: http://localhost:8001
```

### MongoDB connection issues
```bash
# Check MongoDB is running
docker ps | grep mongo

# Or check local MongoDB
systemctl status mongodb
```

### AI responses not working
```bash
# Verify Emergent LLM key is set
grep EMERGENT_LLM_KEY backend/.env

# Test API key
curl http://localhost:8001/api/moltbot/status
```

---

## 📈 Performance Optimization

### Backend
- Uses async/await for concurrent requests
- MongoDB connection pooling
- Response caching for common queries
- Lazy loading of AI models

### Frontend
- React.memo for expensive components
- Code splitting with lazy imports
- Debounced user inputs
- Virtual scrolling for long lists

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Emergent AI** - For the unified LLM integration
- **Google Gemini** - Primary AI model provider
- **FastAPI** - High-performance backend framework
- **React** - Frontend framework
- **MongoDB** - Database solution
- **TailwindCSS** - Styling framework
- **Monaco Editor** - Code editing experience

---

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues:** [Create an issue]
- **Email:** support@example.com
- **Documentation:** [Full docs](./docs)

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Multi-language support (Spanish, French, etc.)
- [ ] Collaborative coding sessions
- [ ] Advanced code refactoring suggestions
- [ ] Integration with GitHub/GitLab
- [ ] Mobile app (React Native)
- [ ] Voice-based coding assistant
- [ ] Custom agent creation
- [ ] LeetCode integration for practice

---

## 📊 Statistics

- **AI Models:** 6+ Gemini models
- **Features:** 70+ API endpoints
- **Supported Languages:** Python, JavaScript, TypeScript, Java, C++, Go
- **File Formats:** PDF, DOCX, LaTeX, TXT, Images, Videos
- **Interview Questions:** Unlimited (AI-generated)
- **Remotion Packages:** 42 packages supported

---

**Made with ❤️ by the Live Code Mentor Team**

**Version:** 2.0.0  
**Last Updated:** February 2026
