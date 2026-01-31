import React, { useState, useRef, useEffect } from "react";
import { 
  Video, Send, Code, Sparkles, Wand2, RefreshCw, Copy, Check, 
  ChevronDown, ChevronUp, Loader2, Play, FileCode, MessageSquare,
  Zap, Brain, Eye, Terminal, Film, Settings, Palette
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RemotionStudioView = () => {
  // State management
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [agentThoughts, setAgentThoughts] = useState([]);
  const [videoConfig, setVideoConfig] = useState(null);
  const [showAgentThoughts, setShowAgentThoughts] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentAgentStep, setCurrentAgentStep] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");
  
  const chatContainerRef = useRef(null);
  const codeEditorRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Agent configuration
  const agents = [
    { 
      name: "Requirements Analyzer", 
      icon: Brain, 
      color: "from-purple-500 to-indigo-600",
      description: "Analyzes your video request and extracts requirements"
    },
    { 
      name: "Code Architect", 
      icon: Settings, 
      color: "from-cyan-500 to-blue-600",
      description: "Designs component structure and animation patterns"
    },
    { 
      name: "Code Generator", 
      icon: Code, 
      color: "from-emerald-500 to-teal-600",
      description: "Generates complete Remotion React code"
    },
    { 
      name: "Code Reviewer", 
      icon: Eye, 
      color: "from-orange-500 to-red-500",
      description: "Reviews and improves the generated code"
    }
  ];

  // Generate Remotion code
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setCurrentAgentStep(0);
    setAgentThoughts([]);

    // Add user message to conversation
    const userMessage = { role: "user", content: prompt };
    setConversationHistory(prev => [...prev, userMessage]);

    // Simulate agent steps progression
    const agentInterval = setInterval(() => {
      setCurrentAgentStep(prev => {
        if (prev < 4) return prev + 1;
        clearInterval(agentInterval);
        return prev;
      });
    }, 1500);

    try {
      const response = await fetch(`${BACKEND_URL}/api/remotion/generate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_prompt: prompt,
          conversation_history: conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      clearInterval(agentInterval);
      setCurrentAgentStep(4);

      if (!response.ok) {
        throw new Error("Failed to generate code");
      }

      const data = await response.json();
      
      // Update state with response
      setGeneratedCode(data.code || "");
      setAgentThoughts(data.agent_thoughts || []);
      setVideoConfig(data.video_config || null);
      setExplanation(data.explanation || "");

      // Add assistant response
      const assistantMessage = { 
        role: "assistant", 
        content: `Generated Remotion video code! ${data.explanation || ""}`,
        code: data.code,
        config: data.video_config
      };
      setConversationHistory(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = { 
        role: "assistant", 
        content: `Error generating code: ${error.message}. Please try again.` 
      };
      setConversationHistory(prev => [...prev, errorMessage]);
      clearInterval(agentInterval);
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  // Refine existing code
  const handleRefine = async () => {
    if (!refinePrompt.trim() || !generatedCode || isRefining) return;

    setIsRefining(true);

    // Add refinement request to conversation
    const userMessage = { role: "user", content: `Refine: ${refinePrompt}` };
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`${BACKEND_URL}/api/remotion/refine-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_code: generatedCode,
          user_feedback: refinePrompt
        })
      });

      if (!response.ok) {
        throw new Error("Failed to refine code");
      }

      const data = await response.json();
      
      // Update code with refined version
      setGeneratedCode(data.refined_code || generatedCode);
      setExplanation(data.explanation || "");

      // Add assistant response
      const assistantMessage = { 
        role: "assistant", 
        content: `Code refined! Changes: ${data.changes_made || "Updated based on your feedback"}`,
        code: data.refined_code
      };
      setConversationHistory(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error("Refinement error:", error);
      const errorMessage = { 
        role: "assistant", 
        content: `Error refining code: ${error.message}` 
      };
      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsRefining(false);
      setRefinePrompt("");
    }
  };

  // Copy code to clipboard
  const handleCopy = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Preset video templates
  const presets = [
    { 
      name: "Text Animation", 
      prompt: "Create a modern text animation with a title that fades in from blur, scales up with spring animation, and has a glowing subtitle that types in letter by letter",
      icon: "✨"
    },
    { 
      name: "Logo Reveal", 
      prompt: "Make a dramatic logo reveal animation where a logo emerges from particles, with a pulsing glow effect and smooth scale animation",
      icon: "🎬"
    },
    { 
      name: "Countdown Timer", 
      prompt: "Build a sleek countdown timer animation from 5 to 1, with each number having a unique entrance animation and color transition",
      icon: "⏱️"
    },
    { 
      name: "Social Media Post", 
      prompt: "Design a social media post animation with profile picture, username animation, content fade-in, and like/comment counters animating",
      icon: "📱"
    },
    { 
      name: "Data Visualization", 
      prompt: "Create an animated bar chart that shows data bars growing from bottom with staggered timing and value labels appearing",
      icon: "📊"
    },
    { 
      name: "Scene Transition", 
      prompt: "Make a professional scene transition with zoom blur effect transitioning between two colored backgrounds",
      icon: "🎥"
    }
  ];

  return (
    <div className="max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f97316] flex items-center justify-center">
          <Film className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-orange-200 bg-clip-text text-transparent">
            Remotion Studio
          </h1>
          <p className="text-sm text-white/50">
            Multi-Agent AI Video Code Generator • React + Remotion
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full glass-light text-xs font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            4 AI Agents Ready
          </div>
        </div>
      </div>

      {/* Main Layout - Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-200px)]">
        
        {/* Left Panel - Chat Interface */}
        <div className="flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/10">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-orange-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="font-semibold">Video Description Chat</span>
              </div>
              <button
                onClick={() => setConversationHistory([])}
                className="text-xs text-white/50 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          {/* Preset Templates */}
          <div className="p-4 border-b border-white/10 bg-black/20">
            <p className="text-xs text-white/50 mb-2">Quick Start Templates:</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(preset.prompt)}
                  className="px-3 py-1.5 rounded-lg glass-light text-xs hover:bg-white/10 transition-all flex items-center gap-1.5"
                >
                  <span>{preset.icon}</span>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]"
          >
            {conversationHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                  <Wand2 className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Describe Your Video</h3>
                <p className="text-sm text-white/50 max-w-sm">
                  Tell me what kind of video animation you want to create, and I'll generate 
                  production-ready Remotion React code using 4 specialized AI agents.
                </p>
              </div>
            ) : (
              conversationHistory.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-500/20' 
                        : 'glass-light border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {msg.role === 'user' ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center">
                            <span className="text-xs">👤</span>
                          </div>
                          <span className="text-xs font-medium text-purple-300">You</span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs font-medium text-orange-300">Remotion AI</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.config && (
                      <div className="mt-3 p-2 rounded-lg bg-black/30 text-xs font-mono">
                        <span className="text-emerald-400">Config:</span>{' '}
                        {msg.config.width}x{msg.config.height} @ {msg.config.fps}fps • {msg.config.durationInFrames} frames
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Generation Progress */}
            {isGenerating && (
              <div className="glass-light rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  <span className="font-medium">Multi-Agent Generation in Progress...</span>
                </div>
                <div className="space-y-3">
                  {agents.map((agent, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        currentAgentStep > idx 
                          ? 'bg-emerald-500/10 border border-emerald-500/30' 
                          : currentAgentStep === idx 
                            ? 'bg-purple-500/10 border border-purple-500/30 animate-pulse' 
                            : 'bg-white/5'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                        <agent.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{agent.name}</span>
                          {currentAgentStep > idx && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                          {currentAgentStep === idx && (
                            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                          )}
                        </div>
                        <p className="text-xs text-white/50">{agent.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex gap-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="Describe your video animation... (e.g., 'Create a text reveal animation with spring physics')"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm 
                         resize-none focus:outline-none focus:border-purple-500/50 placeholder:text-white/30"
                rows={3}
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 
                         hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 
                         disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor & Preview */}
        <div className="flex flex-col gap-4">
          {/* Agent Thoughts Panel */}
          {agentThoughts.length > 0 && (
            <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setShowAgentThoughts(!showAgentThoughts)}
                className="w-full p-3 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-orange-500/10 hover:from-purple-500/20 hover:to-orange-500/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">Agent Thoughts Process</span>
                  <span className="text-xs text-white/50">({agentThoughts.length} steps)</span>
                </div>
                {showAgentThoughts ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {showAgentThoughts && (
                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {agentThoughts.map((thought, idx) => {
                    const AgentIcon = agents[idx]?.icon || Brain;
                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg bg-gradient-to-br ${agents[idx]?.color || 'from-gray-500 to-gray-600'}/10 border border-white/5`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <AgentIcon className="w-4 h-4" />
                          <span className="text-xs font-semibold text-white/80">{thought.agent}</span>
                        </div>
                        <pre className="text-xs text-white/60 whitespace-pre-wrap overflow-x-auto font-mono">
                          {thought.output.substring(0, 500)}
                          {thought.output.length > 500 && '...'}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 glass-panel rounded-xl border border-white/10 overflow-hidden flex flex-col">
            {/* Editor Header */}
            <div className="p-3 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCode className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold">Generated Remotion Code</span>
                  {videoConfig && (
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
                      {videoConfig.width}x{videoConfig.height} @ {videoConfig.fps}fps
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg glass-light hover:bg-white/10 transition-all"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Code Content */}
            <div 
              ref={codeEditorRef}
              className="flex-1 overflow-auto p-4 bg-black/40 font-mono text-sm"
            >
              {generatedCode ? (
                <pre className="language-tsx whitespace-pre-wrap">
                  <code className="text-emerald-300/90">
                    {generatedCode}
                  </code>
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Terminal className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/40">
                    Generated Remotion code will appear here
                  </p>
                  <p className="text-xs text-white/30 mt-2">
                    Describe your video in the chat to generate code
                  </p>
                </div>
              )}
            </div>

            {/* Explanation */}
            {explanation && (
              <div className="p-3 border-t border-white/10 bg-indigo-500/10">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5" />
                  <p className="text-xs text-white/70">{explanation}</p>
                </div>
              </div>
            )}
          </div>

          {/* Refine Panel */}
          {generatedCode && (
            <div className="glass-panel rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium">Refine Your Code</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRefine();
                    }
                  }}
                  placeholder="What would you like to change? (e.g., 'Make the animation faster', 'Add a blue gradient')"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm 
                           focus:outline-none focus:border-orange-500/50 placeholder:text-white/30"
                  disabled={isRefining}
                />
                <button
                  onClick={handleRefine}
                  disabled={!refinePrompt.trim() || isRefining}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 
                           hover:from-orange-400 hover:to-red-400 disabled:opacity-50 
                           disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 text-sm"
                >
                  {isRefining ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refine
                </button>
              </div>
            </div>
          )}

          {/* Video Config Info */}
          {videoConfig && (
            <div className="glass-panel rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">Video Configuration</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <p className="text-xs text-white/50 mb-1">Width</p>
                  <p className="font-mono font-bold">{videoConfig.width}px</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <p className="text-xs text-white/50 mb-1">Height</p>
                  <p className="font-mono font-bold">{videoConfig.height}px</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <p className="text-xs text-white/50 mb-1">FPS</p>
                  <p className="font-mono font-bold">{videoConfig.fps}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-center">
                  <p className="text-xs text-white/50 mb-1">Frames</p>
                  <p className="font-mono font-bold">{videoConfig.durationInFrames}</p>
                </div>
              </div>
              <div className="mt-3 p-2 rounded-lg bg-indigo-500/10 text-xs text-center">
                Duration: {(videoConfig.durationInFrames / videoConfig.fps).toFixed(1)} seconds
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="glass-panel rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">How to Use Generated Code</span>
            </div>
            <ol className="text-xs text-white/60 space-y-2 list-decimal list-inside">
              <li>Copy the generated code using the copy button</li>
              <li>Create a new Remotion project: <code className="px-1 py-0.5 rounded bg-white/10 font-mono">npx create-video@latest</code></li>
              <li>Paste the code into your component file</li>
              <li>Register the composition in your Root.tsx</li>
              <li>Preview with: <code className="px-1 py-0.5 rounded bg-white/10 font-mono">npm run dev</code></li>
              <li>Render with: <code className="px-1 py-0.5 rounded bg-white/10 font-mono">npx remotion render --gl=angle</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemotionStudioView;
