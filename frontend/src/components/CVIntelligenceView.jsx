import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  FileText, Upload, Target, Search, Briefcase, Building2,
  ChevronRight, Sparkles, AlertCircle, CheckCircle, Clock,
  Edit3, Save, X, Loader2, GraduationCap, Code, Award,
  User, Mail, Phone, Linkedin, Github, MapPin, BarChart3,
  TrendingUp, TrendingDown, Lightbulb, BookOpen, Star,
  ArrowRight, RefreshCw, MessageSquare, Zap, Play, Pause,
  Mic, MicOff, Send, Timer, CheckCircle2, XCircle, 
  Calendar, Route, ChevronDown, ChevronUp, PlayCircle,
  StopCircle, Volume2, HelpCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Section type icons
const SECTION_ICONS = {
  experience: Briefcase,
  education: GraduationCap,
  skills: Code,
  projects: Lightbulb,
  summary: User,
  certifications: Award,
  other: FileText
};

// Section type colors
const SECTION_COLORS = {
  experience: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
  education: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  skills: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  projects: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  summary: "from-cyan-500/20 to-teal-500/20 border-cyan-500/30",
  certifications: "from-yellow-500/20 to-lime-500/20 border-yellow-500/30",
  other: "from-gray-500/20 to-slate-500/20 border-gray-500/30"
};

const STAGE_INFO = {
  hr: { name: "HR Round", icon: User, color: "text-blue-400", bg: "bg-blue-500/20" },
  technical: { name: "Technical Round", icon: Code, color: "text-green-400", bg: "bg-green-500/20" },
  hiring_manager: { name: "Hiring Manager", icon: Briefcase, color: "text-purple-400", bg: "bg-purple-500/20" }
};

const CVIntelligenceView = () => {
  // State management
  const [activeTab, setActiveTab] = useState("upload"); // upload, editor, analyze, interview, roadmap
  const [cvData, setCvData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Analysis state
  const [targetRole, setTargetRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [companyResearch, setCompanyResearch] = useState(null);
  const [isResearching, setIsResearching] = useState(false);
  
  // Editor state
  const [selectedSection, setSelectedSection] = useState(null);
  const [editPopup, setEditPopup] = useState(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editResult, setEditResult] = useState(null);
  
  // Interview state
  const [interviewSession, setInterviewSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);
  
  // If I Were You state
  const [ifIWereYouQuestion, setIfIWereYouQuestion] = useState("");
  const [ifIWereYouResult, setIfIWereYouResult] = useState(null);
  const [isGettingModelAnswer, setIsGettingModelAnswer] = useState(false);
  
  // Learning Roadmap state
  const [roadmap, setRoadmap] = useState(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapTimeframe, setRoadmapTimeframe] = useState(14);
  const [expandedDays, setExpandedDays] = useState({});
  
  const fileInputRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setAnswerText(transcript);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      recognitionInstance.onerror = () => {
        setIsRecording(false);
        toast.error("Voice recognition error");
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // File upload handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await uploadCV(file);
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) await uploadCV(file);
  };

  const uploadCV = async (file) => {
    const validTypes = ['.pdf', '.docx', '.tex', '.txt', '.latex'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(ext)) {
      toast.error("Please upload a PDF, DOCX, LaTeX, or TXT file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BACKEND_URL}/api/cv/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload CV');

      const data = await response.json();
      setCvData(data);
      setActiveTab("editor");
      toast.success("CV uploaded and parsed successfully!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload CV. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Section edit handler
  const handleSectionClick = (section, e) => {
    setEditPopup({ section });
    setSelectedSection(section);
    setEditInstruction("");
    setEditResult(null);
  };

  const handleEditSubmit = async () => {
    if (!editInstruction.trim() || !selectedSection) return;

    setIsEditing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_id: cvData.cv_id,
          section_id: selectedSection.id,
          edit_instruction: editInstruction,
          preserve_latex: cvData.file_type === 'latex'
        })
      });

      if (!response.ok) throw new Error('Edit failed');

      const data = await response.json();
      setEditResult(data);
      toast.success("AI edit suggestion ready!");
    } catch (error) {
      console.error('Edit error:', error);
      toast.error("Failed to process edit");
    } finally {
      setIsEditing(false);
    }
  };

  const applyEdit = async () => {
    if (!editResult || !selectedSection) return;

    try {
      const formData = new FormData();
      formData.append('cv_id', cvData.cv_id);
      formData.append('section_id', selectedSection.id);
      formData.append('new_content', editResult.edited_text);

      const response = await fetch(`${BACKEND_URL}/api/cv/update-section`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Update failed');

      setCvData(prev => ({
        ...prev,
        sections: prev.sections.map(s => 
          s.id === selectedSection.id 
            ? { ...s, content: editResult.edited_text, raw_text: editResult.edited_text }
            : s
        )
      }));

      setEditPopup(null);
      setEditResult(null);
      setSelectedSection(null);
      toast.success("CV updated!");
    } catch (error) {
      console.error('Apply edit error:', error);
      toast.error("Failed to apply edit");
    }
  };

  // Analysis handler
  const runAnalysis = async () => {
    if (!targetRole.trim() || !companyName.trim()) {
      toast.error("Please enter target role and company name");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_id: cvData.cv_id,
          target_role: targetRole,
          company_name: companyName,
          job_description: jobDescription || null
        })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setAnalysisResult(data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze CV");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Company research handler
  const researchCompany = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter company name");
      return;
    }

    setIsResearching(true);
    setCompanyResearch(null);
    
    try {
      const formData = new FormData();
      formData.append('company_name', companyName);
      formData.append('target_role', targetRole || 'General');

      const response = await fetch(`${BACKEND_URL}/api/cv/company-research`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Research failed');

      const data = await response.json();
      setCompanyResearch(data);
      toast.success("Company research complete!");
    } catch (error) {
      console.error('Research error:', error);
      toast.error("Failed to research company");
    } finally {
      setIsResearching(false);
    }
  };

  // Interview handlers
  const generateInterview = async (stage = "all") => {
    if (!targetRole.trim() || !companyName.trim()) {
      toast.error("Please enter target role and company in the Analysis tab first");
      return;
    }

    setIsGeneratingInterview(true);
    setInterviewSession(null);
    setCurrentQuestionIndex(0);
    setCurrentEvaluation(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/interview/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_id: cvData.cv_id,
          target_role: targetRole,
          company_name: companyName,
          stage: stage,
          num_questions: 5
        })
      });

      if (!response.ok) throw new Error('Failed to generate interview');

      const data = await response.json();
      setInterviewSession(data);
      toast.success(`Interview generated with ${data.questions?.length || 0} questions!`);
    } catch (error) {
      console.error('Generate interview error:', error);
      toast.error("Failed to generate interview questions");
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const startAnswer = () => {
    setAnswerText("");
    setTimer(0);
    setIsTimerRunning(true);
    setCurrentEvaluation(null);
  };

  const toggleRecording = () => {
    if (!recognition) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
      toast.info('Listening... speak your answer');
    }
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    setIsTimerRunning(false);
    setIsEvaluating(true);
    
    try {
      const currentQuestion = interviewSession.questions[currentQuestionIndex];
      
      const response = await fetch(`${BACKEND_URL}/api/cv/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: interviewSession.session_id,
          question_id: currentQuestion.id,
          answer_text: answerText,
          time_taken_seconds: timer
        })
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const data = await response.json();
      setCurrentEvaluation(data);
      toast.success("Answer evaluated!");
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error("Failed to evaluate answer");
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < interviewSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswerText("");
      setCurrentEvaluation(null);
      setTimer(0);
    }
  };

  // If I Were You handler
  const getIfIWereYou = async () => {
    if (!ifIWereYouQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsGettingModelAnswer(true);
    setIfIWereYouResult(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/interview/if-i-were-you`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_id: cvData.cv_id,
          question: ifIWereYouQuestion
        })
      });

      if (!response.ok) throw new Error('Failed to get model answer');

      const data = await response.json();
      setIfIWereYouResult(data);
      toast.success("Model answer ready!");
    } catch (error) {
      console.error('If I Were You error:', error);
      toast.error("Failed to generate model answer");
    } finally {
      setIsGettingModelAnswer(false);
    }
  };

  // Learning Roadmap handler
  const generateRoadmap = async () => {
    if (!targetRole.trim()) {
      toast.error("Please enter target role in the Analysis tab first");
      return;
    }

    setIsGeneratingRoadmap(true);
    setRoadmap(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/learning-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_id: cvData.cv_id,
          target_role: targetRole,
          timeframe_days: roadmapTimeframe
        })
      });

      if (!response.ok) throw new Error('Failed to generate roadmap');

      const data = await response.json();
      setRoadmap(data);
      toast.success(`${roadmapTimeframe}-day learning roadmap ready!`);
    } catch (error) {
      console.error('Roadmap error:', error);
      toast.error("Failed to generate learning roadmap");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Helper functions
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return "from-green-500/20 to-emerald-500/20";
    if (score >= 60) return "from-yellow-500/20 to-amber-500/20";
    if (score >= 40) return "from-orange-500/20 to-amber-500/20";
    return "from-red-500/20 to-rose-500/20";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleDayExpand = (day) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CV Intelligence & Interview Mentor
            </h1>
            <p className="text-white/60 text-sm">Upload your CV, analyze gaps, practice interviews, and get personalized learning plans</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 glass-light rounded-xl w-fit flex-wrap">
        {[
          { id: "upload", label: "Upload", icon: Upload },
          { id: "editor", label: "CV Editor", icon: Edit3, disabled: !cvData },
          { id: "analyze", label: "Analysis", icon: Target, disabled: !cvData },
          { id: "interview", label: "Interview", icon: Mic, disabled: !cvData },
          { id: "roadmap", label: "Learning", icon: Route, disabled: !cvData }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id 
                ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white" 
                : tab.disabled 
                  ? "text-white/30 cursor-not-allowed" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300
              ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/20 hover:border-indigo-500/50 hover:bg-white/5"}
              ${isUploading ? "pointer-events-none opacity-60" : ""}
            `}
          >
            <div className="flex flex-col items-center justify-center py-16 px-8">
              {isUploading ? (
                <>
                  <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mb-4" />
                  <p className="text-lg font-medium text-white">Processing your CV...</p>
                  <p className="text-sm text-white/50 mt-2">Extracting text and parsing sections</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-indigo-400" />
                  </div>
                  <p className="text-lg font-medium text-white mb-2">Drop your CV here or click to browse</p>
                  <p className="text-sm text-white/50">Supports PDF, DOCX, LaTeX (.tex), and TXT files</p>
                  <div className="flex gap-2 mt-4">
                    {["PDF", "DOCX", "LaTeX", "TXT"].map(type => (
                      <span key={type} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">{type}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.tex,.txt,.latex" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Edit3, title: "Smart CV Editing", desc: "AI-powered section editing with LaTeX support", color: "blue" },
              { icon: Target, title: "Gap Analysis", desc: "Compare CV against job requirements", color: "green" },
              { icon: Mic, title: "Interview Prep", desc: "Practice with AI-generated questions", color: "purple" },
              { icon: Route, title: "Learning Roadmap", desc: "Time-boxed prep plans (7/14/30 days)", color: "orange" }
            ].map((feature, idx) => (
              <div key={idx} className="glass-light rounded-xl p-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 flex items-center justify-center mb-3`}>
                  <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Tab */}
      {activeTab === "editor" && cvData && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Contact Info */}
            {cvData.contact_info && Object.keys(cvData.contact_info).length > 0 && (
              <div className="glass-light rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Contact Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { key: "name", icon: User },
                    { key: "email", icon: Mail },
                    { key: "phone", icon: Phone },
                    { key: "linkedin", icon: Linkedin },
                    { key: "github", icon: Github },
                    { key: "location", icon: MapPin }
                  ].map(({ key, icon: Icon }) => cvData.contact_info[key] && (
                    <div key={key} className="flex items-center gap-2 text-white/80">
                      <Icon className="w-4 h-4 text-white/40" />
                      <span className="truncate">{cvData.contact_info[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sections */}
            {cvData.sections?.map((section) => {
              const Icon = SECTION_ICONS[section.type] || FileText;
              const colorClass = SECTION_COLORS[section.type] || SECTION_COLORS.other;
              
              return (
                <div
                  key={section.id}
                  onClick={(e) => handleSectionClick(section, e)}
                  className={`
                    glass-light rounded-xl p-6 cursor-pointer transition-all duration-300
                    hover:ring-2 hover:ring-indigo-500/50 group
                    ${selectedSection?.id === section.id ? "ring-2 ring-indigo-500" : ""}
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {section.title}
                    </h3>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-white/40">Click to edit</span>
                      <Edit3 className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                  <div className="text-white/70 text-sm whitespace-pre-wrap">
                    {section.content?.length > 500 ? section.content.substring(0, 500) + "..." : section.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Document Info
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Filename", value: cvData.filename },
                  { label: "Type", value: cvData.file_type?.toUpperCase() },
                  { label: "Total Lines", value: cvData.total_lines },
                  { label: "Sections", value: cvData.sections?.length || 0 }
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-white/50">{label}</span>
                    <span className="text-white/80 truncate ml-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button onClick={() => setActiveTab("analyze")} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">
                  <Target className="w-4 h-4 mr-2" />
                  Analyze for Job
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full border-white/20 hover:bg-white/10">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Upload New CV
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Tab */}
      {activeTab === "analyze" && cvData && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Target Position
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Target Role *</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Company Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Job Description (Optional)</label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for better analysis..."
                    className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <Button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !targetRole.trim() || !companyName.trim()}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {isAnalyzing ? "Analyzing..." : "Analyze CV"}
                </Button>
              </div>
            </div>

            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Company Research
              </h3>
              <Button
                onClick={researchCompany}
                disabled={isResearching || !companyName.trim()}
                variant="outline"
                className="w-full border-white/20 hover:bg-white/10"
              >
                {isResearching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                {isResearching ? "Researching..." : `Research ${companyName || "Company"}`}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!analysisResult && !isAnalyzing && (
              <div className="glass-light rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-16 h-16 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Analysis Yet</h3>
                <p className="text-white/50">Enter target role and company, then click "Analyze CV"</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="glass-light rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Analyzing Your CV...</h3>
                <p className="text-white/50">Comparing against job requirements</p>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4">
                {/* Match Score */}
                <div className={`glass-light rounded-xl p-6 bg-gradient-to-br ${getScoreBackground(analysisResult.match_score)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Match Score</h3>
                    <span className={`text-4xl font-bold ${getScoreColor(analysisResult.match_score)}`}>
                      {analysisResult.match_score}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        analysisResult.match_score >= 80 ? "bg-green-500" :
                        analysisResult.match_score >= 60 ? "bg-yellow-500" :
                        analysisResult.match_score >= 40 ? "bg-orange-500" : "bg-red-500"
                      }`}
                      style={{ width: `${analysisResult.match_score}%` }}
                    />
                  </div>
                </div>

                {/* Strengths */}
                {analysisResult.strengths?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Your Strengths
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.strengths.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {analysisResult.missing_keywords?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      Missing Keywords (ATS)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missing_keywords.map((k, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm">{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Gaps */}
                {analysisResult.skill_gaps?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-orange-400" />
                      Skill Gaps
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.skill_gaps.map((gap, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{gap.skill}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              gap.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                              gap.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}>{gap.priority}</span>
                          </div>
                          <p className="text-sm text-white/60">{gap.how_to_learn}</p>
                          {gap.time_needed && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-white/40">
                              <Clock className="w-3 h-3" />{gap.time_needed}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Honest Additions vs Do Not Fake */}
                <div className="grid md:grid-cols-2 gap-4">
                  {analysisResult.honest_additions?.length > 0 && (
                    <div className="glass-light rounded-xl p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Can Add Truthfully
                      </h3>
                      <ul className="space-y-2">
                        {analysisResult.honest_additions.map((item, idx) => (
                          <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.do_not_fake?.length > 0 && (
                    <div className="glass-light rounded-xl p-6 bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-400" />
                        Do NOT Fake
                      </h3>
                      <ul className="space-y-2">
                        {analysisResult.do_not_fake.map((item, idx) => (
                          <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                            <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Mentor Advice */}
                {analysisResult.mentor_advice && analysisResult.mentor_advice !== "Unable to analyze CV" && (
                  <div className="glass-light rounded-xl p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-400" />
                      Mentor Advice
                    </h3>
                    <div className="text-white/80 prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{analysisResult.mentor_advice}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Company Research Results */}
            {companyResearch && (
              <div className="glass-light rounded-xl p-6 mt-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  {companyResearch.company_name} - Research
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-white/50 text-sm">Industry</span>
                    <p className="text-white/80">{companyResearch.industry}</p>
                  </div>
                  <div>
                    <span className="text-white/50 text-sm">Description</span>
                    <p className="text-white/80">{companyResearch.description}</p>
                  </div>
                  {companyResearch.values?.length > 0 && (
                    <div>
                      <span className="text-white/50 text-sm">Company Values</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {companyResearch.values.map((v, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">{v}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {companyResearch.interview_tips?.length > 0 && (
                    <div>
                      <span className="text-white/50 text-sm">Interview Tips</span>
                      <ul className="mt-1 space-y-1">
                        {companyResearch.interview_tips.map((tip, idx) => (
                          <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                            <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {companyResearch.common_questions?.length > 0 && (
                    <div>
                      <span className="text-white/50 text-sm">Common Interview Questions</span>
                      <ul className="mt-1 space-y-1">
                        {companyResearch.common_questions.map((q, idx) => (
                          <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />{q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interview Tab */}
      {activeTab === "interview" && cvData && (
        <div className="space-y-6">
          {/* Generate Interview Section */}
          {!interviewSession && (
            <div className="glass-light rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <Mic className="w-6 h-6 text-indigo-400" />
                Interview Simulation
              </h3>
              
              {!targetRole || !companyName ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-white/80 mb-4">Please set your target role and company in the Analysis tab first</p>
                  <Button onClick={() => setActiveTab("analyze")} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                    <Target className="w-4 h-4 mr-2" />
                    Go to Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/60 text-sm mb-2">Preparing interview for:</p>
                    <p className="text-white font-medium">{targetRole} at {companyName}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(STAGE_INFO).map(([stage, info]) => (
                      <button
                        key={stage}
                        onClick={() => generateInterview(stage)}
                        disabled={isGeneratingInterview}
                        className={`p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all text-left ${info.bg}`}
                      >
                        <info.icon className={`w-8 h-8 ${info.color} mb-3`} />
                        <h4 className="text-white font-semibold mb-1">{info.name}</h4>
                        <p className="text-white/50 text-sm">Practice this round only</p>
                      </button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => generateInterview("all")}
                    disabled={isGeneratingInterview}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 py-6 text-lg"
                  >
                    {isGeneratingInterview ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating Questions...</>
                    ) : (
                      <><PlayCircle className="w-5 h-5 mr-2" />Start Full Interview (All Rounds)</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Interview in Progress */}
          {interviewSession && interviewSession.questions?.length > 0 && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Interview Area */}
              <div className="lg:col-span-2 space-y-4">
                {/* Question Card */}
                <div className="glass-light rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const q = interviewSession.questions[currentQuestionIndex];
                        const stageInfo = STAGE_INFO[q.stage] || STAGE_INFO.technical;
                        return (
                          <div className={`px-3 py-1 rounded-full ${stageInfo.bg} ${stageInfo.color} text-sm font-medium flex items-center gap-1`}>
                            <stageInfo.icon className="w-4 h-4" />
                            {stageInfo.name}
                          </div>
                        );
                      })()}
                      <span className="text-white/40 text-sm">
                        Question {currentQuestionIndex + 1} of {interviewSession.questions.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-white/40" />
                      <span className={`font-mono ${timer > interviewSession.questions[currentQuestionIndex].time_limit_seconds ? 'text-red-400' : 'text-white'}`}>
                        {formatTime(timer)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl text-white mb-6">
                    {interviewSession.questions[currentQuestionIndex].question}
                  </h3>
                  
                  {/* Answer Area */}
                  {!currentEvaluation ? (
                    <div className="space-y-4">
                      <Textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here or use voice input..."
                        className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        disabled={isEvaluating}
                      />
                      
                      <div className="flex gap-3">
                        {!isTimerRunning ? (
                          <Button onClick={startAnswer} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
                            <Play className="w-4 h-4 mr-2" />
                            Start Answer
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={toggleRecording}
                              variant="outline"
                              className={`border-white/20 ${isRecording ? 'bg-red-500/20 border-red-500/50' : ''}`}
                            >
                              {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                              {isRecording ? "Stop Recording" : "Voice Input"}
                            </Button>
                            <Button
                              onClick={submitAnswer}
                              disabled={isEvaluating || !answerText.trim()}
                              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                            >
                              {isEvaluating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                              {isEvaluating ? "Evaluating..." : "Submit Answer"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Evaluation Results */
                    <div className="space-y-4">
                      <div className={`p-6 rounded-xl bg-gradient-to-br ${getScoreBackground(currentEvaluation.score)}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold">Your Score</h4>
                          <span className={`text-3xl font-bold ${getScoreColor(currentEvaluation.score)}`}>
                            {currentEvaluation.score}%
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          {[
                            { label: "Clarity", score: currentEvaluation.clarity_score },
                            { label: "Structure", score: currentEvaluation.structure_score },
                            { label: "Confidence", score: currentEvaluation.confidence_score },
                            { label: "Relevance", score: currentEvaluation.relevance_score }
                          ].map(({ label, score }) => (
                            <div key={label}>
                              <div className={`text-lg font-bold ${getScoreColor(score)}`}>{score}%</div>
                              <div className="text-xs text-white/50">{label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5">
                        <h4 className="text-white font-semibold mb-2">Feedback</h4>
                        <p className="text-white/70 text-sm">{currentEvaluation.feedback}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {currentEvaluation.strengths?.length > 0 && (
                          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Strengths
                            </h4>
                            <ul className="space-y-1">
                              {currentEvaluation.strengths.map((s, idx) => (
                                <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                                  <ChevronRight className="w-4 h-4 text-green-400 mt-0.5" />{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {currentEvaluation.improvements?.length > 0 && (
                          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              To Improve
                            </h4>
                            <ul className="space-y-1">
                              {currentEvaluation.improvements.map((i, idx) => (
                                <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                                  <ChevronRight className="w-4 h-4 text-orange-400 mt-0.5" />{i}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {currentEvaluation.model_answer && (
                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                          <h4 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            If I Were You (Model Answer)
                          </h4>
                          <p className="text-white/80 text-sm whitespace-pre-wrap">{currentEvaluation.model_answer}</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {currentQuestionIndex < interviewSession.questions.length - 1 ? (
                          <Button onClick={nextQuestion} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Next Question
                          </Button>
                        ) : (
                          <Button onClick={() => setInterviewSession(null)} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Finish Interview
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Progress */}
              <div className="space-y-4">
                <div className="glass-light rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-4">Progress</h4>
                  <div className="space-y-2">
                    {interviewSession.questions.map((q, idx) => {
                      const stageInfo = STAGE_INFO[q.stage] || STAGE_INFO.technical;
                      const isCompleted = idx < currentQuestionIndex;
                      const isCurrent = idx === currentQuestionIndex;
                      
                      return (
                        <div
                          key={q.id}
                          className={`p-3 rounded-lg border transition-all ${
                            isCurrent ? 'border-indigo-500 bg-indigo-500/10' :
                            isCompleted ? 'border-green-500/30 bg-green-500/10' :
                            'border-white/10 bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : isCurrent ? (
                              <PlayCircle className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-white/30" />
                            )}
                            <span className={`text-sm ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                              Q{idx + 1}: {stageInfo.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* If I Were You Section */}
                <div className="glass-light rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                    "If I Were You" Mode
                  </h4>
                  <p className="text-white/50 text-sm mb-4">Get a model answer for any question based on your CV</p>
                  <Textarea
                    value={ifIWereYouQuestion}
                    onChange={(e) => setIfIWereYouQuestion(e.target.value)}
                    placeholder="Paste any interview question..."
                    className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/30 mb-3"
                  />
                  <Button
                    onClick={getIfIWereYou}
                    disabled={isGettingModelAnswer || !ifIWereYouQuestion.trim()}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  >
                    {isGettingModelAnswer ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                    Get Model Answer
                  </Button>
                  
                  {ifIWereYouResult && (
                    <div className="mt-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <h5 className="text-indigo-300 font-medium mb-2">Model Answer:</h5>
                      <p className="text-white/80 text-sm whitespace-pre-wrap">{ifIWereYouResult.model_answer}</p>
                      {ifIWereYouResult.key_points?.length > 0 && (
                        <div className="mt-3">
                          <h6 className="text-white/50 text-xs mb-1">Key Points:</h6>
                          <ul className="space-y-1">
                            {ifIWereYouResult.key_points.map((p, idx) => (
                              <li key={idx} className="text-white/60 text-xs flex items-start gap-1">
                                <ChevronRight className="w-3 h-3 mt-0.5" />{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Learning Roadmap Tab */}
      {activeTab === "roadmap" && cvData && (
        <div className="space-y-6">
          {/* Generate Roadmap */}
          <div className="glass-light rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Route className="w-6 h-6 text-orange-400" />
              Learning Roadmap
            </h3>
            
            {!targetRole ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-white/80 mb-4">Please set your target role in the Analysis tab first</p>
                <Button onClick={() => setActiveTab("analyze")} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                  <Target className="w-4 h-4 mr-2" />
                  Go to Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/60 text-sm mb-2">Creating roadmap for:</p>
                  <p className="text-white font-medium">{targetRole}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm mb-3 block">Select Timeframe</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[7, 14, 30].map(days => (
                      <button
                        key={days}
                        onClick={() => setRoadmapTimeframe(days)}
                        className={`p-4 rounded-xl border transition-all ${
                          roadmapTimeframe === days 
                            ? 'border-orange-500 bg-orange-500/20' 
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Calendar className={`w-6 h-6 mx-auto mb-2 ${roadmapTimeframe === days ? 'text-orange-400' : 'text-white/40'}`} />
                        <div className={`font-semibold ${roadmapTimeframe === days ? 'text-white' : 'text-white/60'}`}>{days} Days</div>
                        <div className="text-white/40 text-xs">
                          {days === 7 ? 'Quick prep' : days === 14 ? 'Balanced' : 'Comprehensive'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={generateRoadmap}
                  disabled={isGeneratingRoadmap}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 py-6 text-lg"
                >
                  {isGeneratingRoadmap ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating Roadmap...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 mr-2" />Generate {roadmapTimeframe}-Day Roadmap</>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Roadmap Display */}
          {roadmap && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Daily Plan */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  Daily Plan
                </h4>
                {roadmap.daily_plan?.map((day, idx) => (
                  <div key={idx} className="glass-light rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleDayExpand(day.day)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                          <span className="text-orange-400 font-bold">D{day.day}</span>
                        </div>
                        <div className="text-left">
                          <div className="text-white font-medium">{day.focus}</div>
                          <div className="text-white/50 text-sm">{day.time_hours} hours</div>
                        </div>
                      </div>
                      {expandedDays[day.day] ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                    </button>
                    {expandedDays[day.day] && (
                      <div className="p-4 pt-0 border-t border-white/10">
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-white/60 text-xs mb-2">Tasks</h5>
                            <ul className="space-y-1">
                              {day.tasks?.map((task, tidx) => (
                                <li key={tidx} className="text-white/80 text-sm flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5" />{task}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {day.milestones?.length > 0 && (
                            <div>
                              <h5 className="text-white/60 text-xs mb-2">By end of day you should know:</h5>
                              <ul className="space-y-1">
                                {day.milestones.map((m, midx) => (
                                  <li key={midx} className="text-green-300 text-sm flex items-start gap-2">
                                    <Star className="w-4 h-4 mt-0.5" />{m}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Key Skills */}
                {roadmap.key_skills_to_learn?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-400" />
                      Skills to Learn
                    </h4>
                    <div className="space-y-3">
                      {roadmap.key_skills_to_learn.map((skill, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">{skill.skill}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              skill.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                              skill.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>{skill.priority}</span>
                          </div>
                          <p className="text-white/50 text-xs">{skill.why_important}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-white/40">
                            <Clock className="w-3 h-3" />{skill.estimated_hours}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interview Focus */}
                {roadmap.interview_focus_areas?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Interview Focus
                    </h4>
                    <ul className="space-y-2">
                      {roadmap.interview_focus_areas.map((area, idx) => (
                        <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                          <Zap className="w-4 h-4 text-green-400 mt-0.5" />{area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Practice Questions */}
                {roadmap.practice_questions?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-400" />
                      Practice Questions
                    </h4>
                    <ul className="space-y-2">
                      {roadmap.practice_questions.map((q, idx) => (
                        <li key={idx} className="text-white/80 text-sm p-2 rounded bg-white/5 border border-white/10">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Popup Modal */}
      {editPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { setEditPopup(null); setEditResult(null); }}
        >
          <div 
            className="w-full max-w-2xl mx-4 glass-heavy rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                Edit: {editPopup.section?.title}
              </h3>
              <button onClick={() => { setEditPopup(null); setEditResult(null); }} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10 max-h-40 overflow-y-auto">
              <span className="text-xs text-white/40 mb-2 block">Current Content</span>
              <p className="text-sm text-white/70 whitespace-pre-wrap">
                {editPopup.section?.content?.substring(0, 500)}
                {editPopup.section?.content?.length > 500 && "..."}
              </p>
            </div>

            <div className="mb-4">
              <label className="text-sm text-white/60 mb-2 block">What do you want to change and why?</label>
              <Textarea
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                placeholder="e.g., Make this more concise, add metrics..."
                className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            {!editResult ? (
              <Button
                onClick={handleEditSubmit}
                disabled={isEditing || !editInstruction.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
              >
                {isEditing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {isEditing ? "Processing..." : "Generate Edit"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-xs text-green-400 mb-2 block flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />AI Suggested Edit
                  </span>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{editResult.edited_text}</p>
                </div>

                <div className="p-3 rounded-lg bg-white/5">
                  <span className="text-xs text-white/40 mb-1 block">Changes Made</span>
                  <p className="text-sm text-white/70">{editResult.explanation}</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={applyEdit} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
                    <Save className="w-4 h-4 mr-2" />Apply Edit
                  </Button>
                  <Button onClick={() => setEditResult(null)} variant="outline" className="flex-1 border-white/20 hover:bg-white/10">
                    <RefreshCw className="w-4 h-4 mr-2" />Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CVIntelligenceView;
