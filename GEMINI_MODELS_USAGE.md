# 🤖 Gemini Models Usage Guide

## Live Code Mentor - AI Model Architecture

This document details which Google Gemini model is used for each feature in the application.

---

## 🔑 API Key Security Check

### ✅ Current Status: SECURE

| Location | Status | Notes |
|----------|--------|-------|
| `/app/backend/.env` | ✅ Clean | Keys removed, uses environment variables |
| `/app/backend/server.py` | ✅ Secure | Reads from `os.environ.get('EMERGENT_LLM_KEY')` |
| `/app/frontend/src/` | ✅ Secure | No API keys in frontend code |

**Important:** The Emergent LLM key should be set as an environment variable during deployment, NOT hardcoded in source files.

---

## 📊 Model Overview

| Model | Identifier | Speed | Use Case |
|-------|------------|-------|----------|
| **Gemini 3 Flash** | `gemini-3-flash-preview` | ⚡ Ultra Fast | Default for most features |
| **Gemini 3 Pro** | `gemini-3-pro-preview` | 🧠 Deep Reasoning | Complex analysis, research |
| **Gemini 2.5 Pro** | `gemini-2.5-pro` | ⚖️ Balanced | General purpose |
| **Gemini 2.5 Flash Lite** | `gemini-2.5-flash-lite` | 🚀 Fastest | High-volume simple tasks |
| **Gemini 3 Pro Image** | `gemini-3-pro-image-preview` | 🖼️ Vision | Image generation |
| **Gemini 2.0 Flash Exp** | `gemini-2.0-flash-exp` | 🎬 Video | Video processing |

---

## 🎯 Feature-by-Feature Model Usage

### 1. 📚 Learning Tab

| Feature | Model | Model Type | Reason |
|---------|-------|------------|--------|
| Code Analysis | `gemini-3-flash-preview` | fast | Quick bug detection |
| Line Mentoring | `gemini-3-flash-preview` | fast | Real-time explanations |
| Code Fixing | `gemini-3-flash-preview` | fast | Instant fixes |
| Code Execution Errors | `gemini-3-flash-preview` | fast | Error explanations |
| Proactive Mentor | `gemini-3-flash-preview` | fast | Live code watching |
| Teaching Generation | `gemini-3-flash-preview` | fast | Concept explanations |
| Deeper Explanations | `gemini-3-flash-preview` | fast | Follow-up learning |
| Visual Diagrams | `gemini-3-flash-preview` | fast | ASCII diagrams |

```python
# Learning Tab - Default fast model
chat = get_chat_instance(system_prompt)  # Uses gemini-3-flash-preview
```

---

### 2. 🤖 Agents Tab

| Agent | Model | Model Type | Reason |
|-------|-------|------------|--------|
| General Assistant | `gemini-3-flash-preview` | fast | Quick responses |
| Research Agent | `gemini-3-flash-preview` | fast | Information lookup |
| Coding Agent | `gemini-3-flash-preview` | fast | Code help |
| Creative Agent | `gemini-3-flash-preview` | fast | Creative writing |
| Learning Tutor | `gemini-3-flash-preview` | fast | Teaching |
| Business Intel | `gemini-3-flash-preview` | fast | Business analysis |

```python
# Agent Chat - Fast model for responsiveness
chat = get_chat_instance(system_prompt)
```

---

### 3. 🖼️ Visual Generation (Agents)

| Feature | Model | Notes |
|---------|-------|-------|
| Image Generation | `gemini-3-pro-image-preview` | Multimodal with image output |

```python
# Visual generation uses special image model
chat.with_model("gemini", "gemini-3-pro-image-preview")
    .with_params(modalities=["image", "text"])
```

---

### 4. 🦞 Moltbot Multi-Agent Chat

| Feature | Model | Model Type | Reason |
|---------|-------|------------|--------|
| General Chat | `gemini-3-flash-preview` | fast | Quick responses |
| Senior Thinking Mode | `gemini-3-flash-preview` | fast | Extended reasoning prompts |
| All 6 Agent Modes | `gemini-3-flash-preview` | fast | Consistent speed |

```python
# Moltbot uses fast model with specialized prompts
chat = get_chat_instance(moltbot_system_prompt)
```

---

### 5. 📰 News Tab

| Feature | Model | Model Type | Reason |
|---------|-------|------------|--------|
| Article Summarization | `gemini-3-flash-preview` | fast | Quick summaries |
| News Analysis | `gemini-3-flash-preview` | fast | Content extraction |

---

### 6. 📹 Video Learning

| Feature | Model | Model Type | Reason |
|---------|-------|------------|--------|
| Transcript Analysis | `gemini-3-flash-preview` | fast | Quick parsing |
| Contextual Help | `gemini-3-flash-preview` | fast | Real-time help |
| Proactive Analysis | `gemini-3-flash-preview` | fast | Confusion detection |
| Comprehension Checks | `gemini-3-flash-preview` | fast | Quiz generation |
| Video Processing | `gemini-2.0-flash-exp` | video | Frame analysis |

```python
# Video analysis endpoint
class VideoAnalysisRequest(BaseModel):
    model: str = "gemini-2.0-flash-exp"  # Video-capable model
```

---

### 7. 📄 CV Intelligence

| Feature | Model | Model Type | Reason |
|---------|-------|------------|--------|
| CV Parsing | `gemini-3-flash-preview` | fast | Quick extraction |
| Section Editing | `gemini-3-flash-preview` | fast | Real-time edits |
| **Gap Analysis** | `gemini-3-pro-preview` | **pro** | Deep skill analysis |
| Company Research | `gemini-3-flash-preview` | fast | Quick lookup |

```python
# Gap analysis uses Pro for thorough analysis
chat = get_chat_instance(system_prompt, model_type="pro")
```

---

### 8. 🎤 Interview Mentor

| Feature | Model | Model Type | Reason |
|---------|-------|------------|--------|
| Question Generation | `gemini-3-flash-preview` | fast | Quick generation |
| **Answer Evaluation** | `gemini-3-pro-preview` | **pro** | Nuanced scoring |
| **Model Answers** | `gemini-3-pro-preview` | **pro** | Quality examples |
| **Learning Roadmap** | `gemini-3-pro-preview` | **pro** | Strategic planning |

```python
# Interview evaluation needs deep reasoning
chat = get_chat_instance(system_prompt, model_type="pro")
```

---

### 9. 🎬 Remotion Studio

| Feature | Model | Provider Options |
|---------|-------|------------------|
| Code Generation | `gemini-3-flash-preview` | Gemini (default) |
| Code Refinement | `gemini-3-flash-preview` | Gemini (default) |
| Code Validation | `gemini-3-flash-preview` | Gemini (default) |

**Alternative Providers (User selectable):**
- OpenAI: `gpt-4o`
- Anthropic: `claude-sonnet-4-20250514`

```python
# Remotion supports multiple providers
model_map = {
    "gemini": ("gemini", "gemini-3-flash-preview"),
    "openai": ("openai", "gpt-4o"),
    "anthropic": ("anthropic", "claude-sonnet-4-20250514")
}
```

---

### 10. 🔬 Business Intelligence (Deep Research)

| Feature | Model | Model Type | Reason |
|---------|-------|------------|--------|
| **Company Analysis** | `gemini-3-pro-preview` | **pro** | 8-sheet deep dive |
| **Market Research** | `gemini-3-pro-preview` | **pro** | Comprehensive analysis |
| **Competitive Intel** | `gemini-3-pro-preview` | **pro** | Strategic insights |

```python
# Deep research uses Gemini 3 Pro for quality
chat1 = get_chat_instance(system_prompt_stage1, model_type="pro")
chat2 = get_chat_instance(system_prompt_stage2, model_type="pro")
chat3 = get_chat_instance(system_prompt_stage3, model_type="pro")
```

---

### 11. 🎓 Learning Path Generation

| Feature | Model | Model Type | Reason |
|---------|-------|------------|--------|
| Curriculum Generation | `gemini-3-flash-preview` | fast | Quick generation |
| Topic Explanations | `gemini-3-flash-preview` | fast | Responsive teaching |
| YouTube Research | `gemini-3-flash-preview` | fast | Video discovery |
| Visual Explanations | `gemini-3-flash-preview` | fast + vision | Image analysis |

---

### 12. 💬 English Practice Chat

| Feature | Model | Model Type |
|---------|-------|------------|
| Conversation Practice | `gemini-3-flash-preview` | fast |

---

## 📈 Model Distribution Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    MODEL USAGE BREAKDOWN                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  gemini-3-flash-preview    ████████████████████████  85%   │
│  (Fast - Default)                                           │
│                                                             │
│  gemini-3-pro-preview      ████████                  12%   │
│  (Pro - Deep Analysis)                                      │
│                                                             │
│  gemini-3-pro-image        ██                         2%   │
│  (Image Generation)                                         │
│                                                             │
│  gemini-2.0-flash-exp      █                          1%   │
│  (Video Processing)                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Model Selection Logic

```python
def get_chat_instance(system_message: str, session_id: str = None, 
                      model_type: str = "fast", enable_vision: bool = False):
    """
    Get a configured LLM chat instance.
    
    model_type options:
    - "fast": gemini-3-flash-preview (default, for quick responses)
    - "pro": gemini-3-pro-preview (for deep research, complex reasoning)
    - "balanced": gemini-2.5-pro (for balanced performance)
    - "ultra_fast": gemini-2.5-flash-lite (for high-volume, simple tasks)
    """
    
    if enable_vision:
        selected_model = "gemini-3-flash-preview"  # Supports vision
    else:
        model_map = {
            "fast": "gemini-3-flash-preview",
            "pro": "gemini-3-pro-preview", 
            "balanced": "gemini-2.5-pro",
            "ultra_fast": "gemini-2.5-flash-lite"
        }
        selected_model = model_map.get(model_type, "gemini-3-flash-preview")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        system_message=system_message,
        session_id=session_id
    ).with_model("gemini", selected_model)
    
    return chat
```

---

## 🎯 When to Use Each Model

| Scenario | Recommended Model | Why |
|----------|-------------------|-----|
| Real-time code help | `gemini-3-flash-preview` | Low latency |
| Quick Q&A | `gemini-3-flash-preview` | Fast responses |
| CV gap analysis | `gemini-3-pro-preview` | Thorough analysis |
| Interview evaluation | `gemini-3-pro-preview` | Nuanced scoring |
| Company research | `gemini-3-pro-preview` | Deep insights |
| Image generation | `gemini-3-pro-image-preview` | Multimodal |
| Video analysis | `gemini-2.0-flash-exp` | Video support |
| High-volume tasks | `gemini-2.5-flash-lite` | Cost efficiency |

---

## 💡 Best Practices

1. **Default to Fast**: Use `gemini-3-flash-preview` for most features
2. **Upgrade to Pro**: Only for features requiring deep reasoning
3. **Enable Vision**: When processing images/screenshots
4. **Session IDs**: Use for conversation continuity
5. **Custom Keys**: Allow users to bring their own API keys

---

## 🔒 Security Reminders

- ✅ Never hardcode API keys in source files
- ✅ Use environment variables for all secrets
- ✅ The `.env` file should NOT be committed to git
- ✅ Users can provide custom API keys through the UI

---

**Last Updated:** February 2026  
**Hackathon:** Google DeepMind Gemini 3 Hackathon 2026
