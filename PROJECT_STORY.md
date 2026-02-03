# 🎓 Gemini Mentor Hub (Live Code Mentor)

## A Revolutionary AI-Powered Learning Platform

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

$$
\text{User Prompt} \xrightarrow{\text{Agent}_1} \text{Requirements} \xrightarrow{\text{Agent}_2} \text{Architecture} \xrightarrow{\text{Agent}_3} \text{Code} \xrightarrow{\text{Agent}_4} \text{Review}
$$

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

### Video Learning Intelligence

For proactive help during video watching:

$$
\text{Confusion Score} = \begin{cases}
\text{HIGH} & \text{if rewinds} > 2 \text{ in 30s} \\
\text{MEDIUM} & \text{if pauses} > 3 \text{ in 1min} \\
\text{LOW} & \text{otherwise}
\end{cases}
$$

### CV Intelligence Flow

```
CV Upload → AI Parsing → Section Extraction
     ↓
Job Description → Gap Analysis → Missing Keywords
     ↓
Interview Questions → Answer Evaluation → Model Answers
     ↓
Personalized Learning Roadmap
```

---

## 🧗 Challenges We Ran Into

### 1. **Real-Time Code Analysis**
**Problem:** Analyzing code on every keystroke overwhelmed the API.

**Solution:** Implemented debouncing (500ms delay) and smart caching:
```javascript
useEffect(() => {
  const timer = setTimeout(() => analyzeCode(code), 500);
  return () => clearTimeout(timer);
}, [code]);
```

### 2. **YouTube Transcript Fetching**
**Problem:** Many videos have auto-generated transcripts with poor quality.

**Solution:** Added fallback to multiple languages and transcript cleaning:
```python
try:
    transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
except:
    transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en-US', 'en-GB'])
```

### 3. **CV Parsing Accuracy**
**Problem:** PDFs have wildly inconsistent formatting.

**Solution:** Combined multiple parsers + AI post-processing:
```python
# Try pdfplumber first (better for tables)
text = pdfplumber.extract_text(pdf)
# Fallback to PyPDF2
if not text:
    text = PyPDF2Reader.extract(pdf)
# AI cleanup
sections = await gemini_parse_sections(text)
```

### 4. **Interview Answer Evaluation**
**Problem:** AI was too generous with scores.

**Solution:** Created rubric-based evaluation with specific criteria:
```python
scoring_rubric = """
Evaluate on:
1. Clarity (0-25): Clear, concise explanation
2. Relevance (0-25): Directly answers the question
3. Evidence (0-25): Uses specific examples from CV
4. Structure (0-25): STAR method or equivalent
"""
```

### 5. **Multi-Agent Coordination**
**Problem:** Agents were producing inconsistent outputs.

**Solution:** Strict JSON schemas with Pydantic validation:
```python
class AgentOutput(BaseModel):
    agent_name: str
    analysis: str
    next_action: str
    confidence: float = Field(ge=0, le=1)
```

### 6. **Memory Management**
**Problem:** Long conversations exhausted context windows.

**Solution:** Implemented sliding window with summarization:
```python
if len(history) > 20:
    summary = await summarize_conversation(history[:10])
    history = [summary] + history[10:]
```

---

## 🏆 Accomplishments That We're Proud Of

### 1. **True Skill-Level Adaptation**
The AI genuinely adapts its teaching style. A beginner asking about "async/await" gets analogies about waiting in line at a coffee shop. A senior engineer gets discussions about event loops, thread pools, and race conditions.

### 2. **Proactive Video Mentoring**
Our video learning system actually detects when you're confused by watching your behavior (rewinding, pausing) and offers help WITHOUT you asking. This was technically challenging but transformative for the learning experience.

### 3. **"If I Were You" Interview Answers**
The CV interview mentor generates model answers that are HONEST about what's in your CV. It won't fabricate experience you don't have – instead, it teaches you how to answer when you're missing experience.

### 4. **4-Agent Remotion Generator**
Our multi-agent pipeline for video code generation produces production-quality Remotion animations with proper architecture, not just random code snippets.

### 5. **Universal LLM Integration**
Through Emergent Integrations, users can switch between Gemini, GPT, and Claude seamlessly. One API key, multiple models.

### 6. **Full-Stack Polish**
The glass morphism UI, smooth animations, and attention to UX details make this feel like a professional product, not a hackathon prototype.

---

## 📚 What We Learned

### Technical Learnings

1. **Gemini 3 is incredible for code** - Its understanding of programming concepts, ability to explain at different levels, and code generation quality exceeded our expectations.

2. **Multi-agent systems need careful orchestration** - Without strict schemas and validation, agents produce inconsistent outputs. Pydantic was essential.

3. **Prompt engineering is an art** - The difference between a good prompt and a great prompt is massive. We spent hours refining skill-level prompts.

4. **Async Python is powerful but tricky** - FastAPI's async capabilities are great for I/O-bound AI calls, but error handling requires extra care.

5. **Monaco Editor is amazing** - Bringing VS Code's editor to the browser was easier than expected and dramatically improved UX.

### Product Learnings

1. **Users want proactive help** - The most praised feature was the AI "watching" their learning and offering help before they asked.

2. **Skill-level adaptation is essential** - Generic AI responses frustrate both beginners and experts. Adaptation changes everything.

3. **Interview prep is more than questions** - Users loved the CV-aware answers and honest gap analysis more than unlimited practice questions.

4. **Video learning needs AI enhancement** - Passive video watching is inefficient. AI-powered comprehension checks and contextual help transform the experience.

---

## 🔮 What's Next for Gemini Mentor Hub

### Short-Term (Next 3 Months)

- [ ] **Voice-based coding assistant** - Talk through problems, get AI feedback
- [ ] **Collaborative learning sessions** - Pair programming with AI and peers
- [ ] **GitHub integration** - Analyze your actual projects, suggest improvements
- [ ] **Mobile app** - React Native version for learning on the go

### Medium-Term (6 Months)

- [ ] **LeetCode/HackerRank integration** - AI-guided competitive programming
- [ ] **Custom agent creation** - Users build specialized AI mentors
- [ ] **Team features** - Track progress for coding bootcamps/companies
- [ ] **Certificate generation** - AI-verified skill assessments

### Long-Term Vision

- [ ] **Real-time pair programming** - AI that codes alongside you
- [ ] **Multi-language learning** - Spanish, French, Japanese localization
- [ ] **AR/VR coding environments** - Immersive learning experiences
- [ ] **Enterprise deployment** - Self-hosted version for companies

### The Ultimate Goal

$$
\text{Democratize access to world-class mentorship through AI}
$$

Every developer, regardless of background or location, deserves access to a patient, knowledgeable mentor who adapts to their needs. **Gemini Mentor Hub** is our step toward that future.

---

## 🙏 Acknowledgments

- **Google DeepMind** - For creating Gemini 3, the AI that makes this possible
- **Emergent AI** - For the universal LLM integration that simplified our backend
- **The React & FastAPI communities** - For incredible open-source tools
- **Our testers** - Who broke things in creative ways and helped us improve

---

**Built with ❤️ for Google DeepMind Gemini 3 Hackathon 2026**

*"The best mentor is one who meets you where you are."*
