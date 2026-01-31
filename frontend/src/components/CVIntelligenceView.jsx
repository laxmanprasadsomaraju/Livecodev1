import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  FileText, Upload, Target, Search, Briefcase, Building2,
  ChevronRight, Sparkles, AlertCircle, CheckCircle, Clock,
  Edit3, Save, X, Loader2, GraduationCap, Code, Award,
  User, Mail, Phone, Linkedin, Github, MapPin, BarChart3,
  TrendingUp, TrendingDown, Lightbulb, BookOpen, Star,
  ArrowRight, RefreshCw, MessageSquare, Zap, Play,
  Mic, MicOff, Send, Timer, CheckCircle2,
  Calendar, Route, ChevronDown, ChevronUp, PlayCircle,
  HelpCircle, Users, ArrowLeft, Plus, RotateCcw, 
  Newspaper, Trophy, Info
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
  const [activeTab, setActiveTab] = useState("upload");
  const [cvData, setCvData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Analysis state
  const [targetRole, setTargetRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Enhanced company research
  const [enhancedResearch, setEnhancedResearch] = useState(null);
  const [isEnhancedResearching, setIsEnhancedResearching] = useState(false);
  
  // Interviewer research state
  const [interviewerNames, setInterviewerNames] = useState("");
  const [interviewerProfiles, setInterviewerProfiles] = useState(null);
  const [isResearchingInterviewers, setIsResearchingInterviewers] = useState(false);
  
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
  
  // Role selection state
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);
  const [commonRoles, setCommonRoles] = useState([]);
  
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

  // Fetch common roles on mount
  useEffect(() => {
    fetchCommonRoles();
  }, []);

  const fetchCommonRoles = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/common-roles`);
      if (response.ok) {
        const data = await response.json();
        setCommonRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
        setAnswerText(transcript);
      };
      recognitionInstance.onend = () => setIsRecording(false);
      recognitionInstance.onerror = () => { setIsRecording(false); toast.error("Voice recognition error"); };
      setRecognition(recognitionInstance);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // File handlers
  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
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
      const response = await fetch(`${BACKEND_URL}/api/cv/upload`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to upload CV');
      const data = await response.json();
      setCvData(data);
      setActiveTab("editor");
      toast.success("CV uploaded and parsed successfully!");
    } catch (error) {
      toast.error("Failed to upload CV. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Section edit handlers
  const handleSectionClick = (section) => {
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
      const response = await fetch(`${BACKEND_URL}/api/cv/update-section`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Update failed');
      setCvData(prev => ({
        ...prev,
        sections: prev.sections.map(s => 
          s.id === selectedSection.id ? { ...s, content: editResult.edited_text, raw_text: editResult.edited_text } : s
        )
      }));
      setEditPopup(null);
      setEditResult(null);
      setSelectedSection(null);
      toast.success("CV updated!");
    } catch (error) {
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
      toast.error("Failed to analyze CV");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced company research handler
  const runEnhancedResearch = async () => {
    if (!companyName.trim()) { toast.error("Please enter company name"); return; }
    setIsEnhancedResearching(true);
    setEnhancedResearch(null);
    try {
      const formData = new FormData();
      formData.append('company_name', companyName);
      formData.append('target_role', targetRole || 'General');
      const response = await fetch(`${BACKEND_URL}/api/cv/company-research-enhanced`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Research failed');
      const data = await response.json();
      setEnhancedResearch(data);
      toast.success("Company research complete!");
    } catch (error) {
      toast.error("Failed to research company");
    } finally {
      setIsEnhancedResearching(false);
    }
  };

  // Interviewer research handler
  const researchInterviewers = async () => {
    const names = interviewerNames.split(',').map(n => n.trim()).filter(n => n);
    if (names.length === 0) { toast.error("Please enter at least one interviewer name"); return; }
    if (!companyName.trim()) { toast.error("Please enter company name first"); return; }
    setIsResearchingInterviewers(true);
    setInterviewerProfiles(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/research-interviewers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName, interviewer_names: names })
      });
      if (!response.ok) throw new Error('Research failed');
      const data = await response.json();
      setInterviewerProfiles(data);
      toast.success(`Researched ${data.interviewers?.length || 0} interviewers!`);
    } catch (error) {
      toast.error("Failed to research interviewers");
    } finally {
      setIsResearchingInterviewers(false);
    }
  };

  // Interview handlers
  const getEffectiveRole = () => {
    if (customRole.trim()) return customRole;
    if (selectedRole) return selectedRole;
    return targetRole;
  };

  const generateInterview = async (stage = "all", refresh = false) => {
    const effectiveRole = getEffectiveRole();
    if (!effectiveRole.trim()) { toast.error("Please select or enter a role"); return; }
    if (!companyName.trim()) { toast.error("Please enter company name in Analysis tab"); return; }
    
    setIsGeneratingInterview(true);
    setInterviewSession(null);
    setCurrentQuestionIndex(0);
    setCurrentEvaluation(null);
    setAnswerText("");
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/interview/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_id: cvData.cv_id,
          target_role: targetRole || effectiveRole,
          company_name: companyName,
          stage: stage,
          num_questions: 5,
          refresh: refresh,
          custom_role: customRole.trim() || null
        })
      });
      if (!response.ok) throw new Error('Failed to generate interview');
      const data = await response.json();
      setInterviewSession(data);
      toast.success(`${refresh ? 'New ' : ''}Interview generated with ${data.questions?.length || 0} questions!`);
    } catch (error) {
      toast.error("Failed to generate interview questions");
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const resetInterview = () => {
    setInterviewSession(null);
    setCurrentQuestionIndex(0);
    setCurrentEvaluation(null);
    setAnswerText("");
    setTimer(0);
    setIsTimerRunning(false);
  };

  const startAnswer = () => {
    setAnswerText("");
    setTimer(0);
    setIsTimerRunning(true);
    setCurrentEvaluation(null);
  };

  const toggleRecording = () => {
    if (!recognition) { toast.error('Voice input not supported'); return; }
    if (isRecording) { recognition.stop(); } else { recognition.start(); setIsRecording(true); toast.info('Listening...'); }
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) { toast.error("Please provide an answer"); return; }
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

  const skipToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setAnswerText("");
    setCurrentEvaluation(null);
    setTimer(0);
    setIsTimerRunning(false);
  };

  // If I Were You handler
  const getIfIWereYou = async () => {
    if (!ifIWereYouQuestion.trim()) { toast.error("Please enter a question"); return; }
    setIsGettingModelAnswer(true);
    setIfIWereYouResult(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/interview/if-i-were-you`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_id: cvData.cv_id, question: ifIWereYouQuestion })
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setIfIWereYouResult(data);
      toast.success("Model answer ready!");
    } catch (error) {
      toast.error("Failed to generate model answer");
    } finally {
      setIsGettingModelAnswer(false);
    }
  };

  // Learning Roadmap handler
  const generateRoadmap = async () => {
    const effectiveRole = getEffectiveRole() || targetRole;
    if (!effectiveRole.trim()) { toast.error("Please enter target role in Analysis tab"); return; }
    setIsGeneratingRoadmap(true);
    setRoadmap(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cv/learning-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_id: cvData.cv_id, target_role: effectiveRole, timeframe_days: roadmapTimeframe })
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setRoadmap(data);
      toast.success(`${roadmapTimeframe}-day roadmap ready!`);
    } catch (error) {
      toast.error("Failed to generate roadmap");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Helpers
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

  const toggleDayExpand = (day) => setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCustomRole("");
    setShowCustomRoleInput(false);
  };

  const handleCustomRoleClick = () => {
    setShowCustomRoleInput(true);
    setSelectedRole("");
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
            <p className="text-white/60 text-sm">Your AI career companion - analyze CV, practice interviews, get personalized coaching</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 glass-light rounded-xl w-fit flex-wrap">
        {[
          { id: "upload", label: "Upload CV", icon: Upload },
          { id: "editor", label: "CV Editor", icon: Edit3, disabled: !cvData },
          { id: "analyze", label: "Job Analysis", icon: Target, disabled: !cvData },
          { id: "interview", label: "Interview Prep", icon: Mic, disabled: !cvData },
          { id: "roadmap", label: "Learning Plan", icon: Route, disabled: !cvData }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
              ${activeTab === tab.id ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white" 
                : tab.disabled ? "text-white/30 cursor-not-allowed" : "text-white/60 hover:text-white hover:bg-white/5"}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== UPLOAD TAB ===== */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300
              ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/20 hover:border-indigo-500/50 hover:bg-white/5"}
              ${isUploading ? "pointer-events-none opacity-60" : ""}`}
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
              { icon: Edit3, title: "Smart CV Editing", desc: "AI-powered section editing with formatting preservation", color: "blue" },
              { icon: Target, title: "Gap Analysis", desc: "Compare CV against job requirements with actionable tips", color: "green" },
              { icon: Mic, title: "Interview Prep", desc: "Practice with AI-generated questions & get scored", color: "purple" },
              { icon: Route, title: "Learning Roadmap", desc: "Time-boxed prep plans (7/14/30 days)", color: "orange" }
            ].map((feature, idx) => (
              <div key={idx} className="glass-light rounded-xl p-6 hover:bg-white/5 transition-colors">
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

      {/* ===== EDITOR TAB ===== */}
      {activeTab === "editor" && cvData && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cvData.contact_info && Object.keys(cvData.contact_info).length > 0 && (
              <div className="glass-light rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />Contact Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[{ key: "name", icon: User }, { key: "email", icon: Mail }, { key: "phone", icon: Phone },
                    { key: "linkedin", icon: Linkedin }, { key: "github", icon: Github }, { key: "location", icon: MapPin }
                  ].map(({ key, icon: Icon }) => cvData.contact_info[key] && (
                    <div key={key} className="flex items-center gap-2 text-white/80">
                      <Icon className="w-4 h-4 text-white/40" />
                      <span className="truncate">{cvData.contact_info[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {cvData.sections?.map((section) => {
              const Icon = SECTION_ICONS[section.type] || FileText;
              const colorClass = SECTION_COLORS[section.type] || SECTION_COLORS.other;
              return (
                <div key={section.id} onClick={() => handleSectionClick(section)}
                  className={`glass-light rounded-xl p-6 cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-indigo-500/50 group
                    ${selectedSection?.id === section.id ? "ring-2 ring-indigo-500" : ""}`}>
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
          <div className="space-y-4">
            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />Document Info
              </h3>
              <div className="space-y-3 text-sm">
                {[{ label: "Filename", value: cvData.filename }, { label: "Type", value: cvData.file_type?.toUpperCase() },
                  { label: "Lines", value: cvData.total_lines }, { label: "Sections", value: cvData.sections?.length || 0 }
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
                  <Target className="w-4 h-4 mr-2" />Analyze for Job
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full border-white/20 hover:bg-white/10">
                  <RefreshCw className="w-4 h-4 mr-2" />Upload New CV
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ANALYZE TAB ===== */}
      {activeTab === "analyze" && cvData && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {/* Target Position */}
            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />Target Position
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Target Role *</label>
                  <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Company Name *</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Job Description (Optional - for better analysis)</label>
                  <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for more accurate gap analysis..."
                    className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <Button onClick={runAnalysis} disabled={isAnalyzing || !targetRole.trim() || !companyName.trim()}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer">
                  {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Sparkles className="w-4 h-4 mr-2" />Analyze CV</>}
                </Button>
              </div>
            </div>

            {/* Company Deep Research */}
            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />Company Deep Research
              </h3>
              <p className="text-white/50 text-sm mb-3">Get case studies, recent news, achievements & interview tips</p>
              <Button onClick={runEnhancedResearch} disabled={isEnhancedResearching || !companyName.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer">
                {isEnhancedResearching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Researching...</> : <><Search className="w-4 h-4 mr-2" />Research {companyName || "Company"}</>}
              </Button>
            </div>

            {/* Interviewer Research */}
            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />Research Your Interviewers
              </h3>
              <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-amber-200/80 text-xs">AI research may not always find exact matches. Use the LinkedIn search links to verify and get more details.</p>
              </div>
              <Textarea value={interviewerNames} onChange={(e) => setInterviewerNames(e.target.value)}
                placeholder="Enter names separated by commas (e.g., John Smith, Sarah Johnson)"
                className="min-h-[60px] bg-white/5 border-white/10 text-white placeholder:text-white/30 mb-3" />
              <Button onClick={researchInterviewers} disabled={isResearchingInterviewers || !interviewerNames.trim() || !companyName.trim()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 cursor-pointer">
                {isResearchingInterviewers ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Researching...</> : <><Linkedin className="w-4 h-4 mr-2" />Research Interviewers</>}
              </Button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-4">
            {!analysisResult && !isAnalyzing && !enhancedResearch && !interviewerProfiles && (
              <div className="glass-light rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-16 h-16 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze Your CV</h3>
                <p className="text-white/50 max-w-md">Enter your target role and company name, then click "Analyze CV" to get detailed gap analysis, skill recommendations, and mentor advice.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="glass-light rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Analyzing Your CV...</h3>
                <p className="text-white/50">Comparing against job requirements and generating insights</p>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4">
                {/* Match Score */}
                <div className={`glass-light rounded-xl p-6 bg-gradient-to-br ${getScoreBackground(analysisResult.match_score)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Match Score for {targetRole} at {companyName}</h3>
                    <span className={`text-4xl font-bold ${getScoreColor(analysisResult.match_score)}`}>
                      {analysisResult.match_score}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all duration-1000 ${
                      analysisResult.match_score >= 80 ? "bg-green-500" :
                      analysisResult.match_score >= 60 ? "bg-yellow-500" :
                      analysisResult.match_score >= 40 ? "bg-orange-500" : "bg-red-500"
                    }`} style={{ width: `${analysisResult.match_score}%` }} />
                  </div>
                </div>

                {/* Strengths */}
                {analysisResult.strengths?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />Your Strengths
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
                      <AlertCircle className="w-5 h-5 text-yellow-400" />Missing Keywords (for ATS)
                    </h3>
                    <p className="text-white/50 text-sm mb-3">Add these keywords to your CV to improve ATS matching:</p>
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
                      <TrendingDown className="w-5 h-5 text-orange-400" />Skill Gaps to Address
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.skill_gaps.map((gap, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{gap.skill}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              gap.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                              gap.priority === 'high' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'
                            }`}>{gap.priority}</span>
                          </div>
                          <p className="text-sm text-white/70">{gap.how_to_learn}</p>
                          {gap.time_needed && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-white/50">
                              <Clock className="w-3 h-3" />Estimated: {gap.time_needed}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Gaps */}
                {analysisResult.experience_gaps?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-400" />Experience Gaps
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.experience_gaps.map((gap, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <p className="font-medium text-white mb-2">{gap.gap}</p>
                          <p className="text-sm text-white/70">{gap.advice}</p>
                          {gap.alternative && (
                            <p className="text-sm text-indigo-300 mt-2">
                              <ArrowRight className="w-3 h-3 inline mr-1" />Alternative: {gap.alternative}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-400" />Recommendations
                    </h3>
                    <div className="space-y-2">
                      {analysisResult.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-white/80">
                          <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec.suggestion || rec}</span>
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
                        <CheckCircle className="w-5 h-5 text-green-400" />You CAN Truthfully Add
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
                        <X className="w-5 h-5 text-red-400" />Do NOT Fake These
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
                      <MessageSquare className="w-5 h-5 text-indigo-400" />Career Mentor Advice
                    </h3>
                    <div className="text-white/80 prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{analysisResult.mentor_advice}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Company Research */}
            {enhancedResearch && (
              <div className="glass-light rounded-xl p-6 space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-purple-400" />{enhancedResearch.company_name} - Deep Research
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5">
                    <span className="text-white/50 text-xs">Industry</span>
                    <p className="text-white">{enhancedResearch.industry}</p>
                  </div>
                  {enhancedResearch.tech_stack?.length > 0 && (
                    <div className="p-4 rounded-lg bg-white/5">
                      <span className="text-white/50 text-xs">Tech Stack</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {enhancedResearch.tech_stack.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {enhancedResearch.recent_news?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-cyan-400" />Recent News
                    </h4>
                    <div className="space-y-2">
                      {enhancedResearch.recent_news.map((news, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                          <div className="flex items-start justify-between">
                            <span className="text-white font-medium text-sm">{news.title}</span>
                            <span className="text-white/40 text-xs">{news.date}</span>
                          </div>
                          <p className="text-white/60 text-xs mt-1">{news.summary}</p>
                          {news.relevance && <p className="text-cyan-300 text-xs mt-1">💡 Interview tip: {news.relevance}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {enhancedResearch.case_studies?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-400" />Case Studies
                    </h4>
                    <div className="space-y-2">
                      {enhancedResearch.case_studies.map((cs, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <span className="text-white font-medium text-sm">{cs.title}</span>
                          <p className="text-white/60 text-xs mt-1">{cs.summary}</p>
                          {cs.key_takeaways && <p className="text-green-300 text-xs mt-1">📌 {cs.key_takeaways}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {enhancedResearch.recent_achievements?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />Recent Achievements
                    </h4>
                    <ul className="space-y-1">
                      {enhancedResearch.recent_achievements.map((a, idx) => (
                        <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                          <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {enhancedResearch.interview_tips?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-400" />Interview Tips
                    </h4>
                    <ul className="space-y-1">
                      {enhancedResearch.interview_tips.map((tip, idx) => (
                        <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-orange-400 mt-0.5" />{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Interviewer Profiles */}
            {interviewerProfiles && (
              <div className="glass-light rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-400" />Interviewer Research Results
                </h3>
                <p className="text-white/50 text-xs mb-4 flex items-center gap-1">
                  <Info className="w-3 h-3" />{interviewerProfiles.research_note}
                </p>
                <div className="space-y-4">
                  {interviewerProfiles.interviewers?.map((profile, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{profile.name}</h4>
                          <p className="text-white/60 text-sm">{profile.current_role}</p>
                        </div>
                        <a href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(profile.linkedin_hint || profile.name + ' ' + companyName)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors flex items-center gap-1">
                          <Linkedin className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-300 text-xs">Search</span>
                        </a>
                      </div>
                      {profile.background && <p className="text-white/70 text-sm mb-3">{profile.background}</p>}
                      {profile.previous_experience?.length > 0 && (
                        <div className="mb-3">
                          <span className="text-white/50 text-xs">Previous Experience</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profile.previous_experience.map((exp, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-white/70 text-xs">{exp}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.talking_points?.length > 0 && (
                        <div>
                          <span className="text-white/50 text-xs">Topics They Might Discuss</span>
                          <ul className="mt-1 space-y-1">
                            {profile.talking_points.map((tp, i) => (
                              <li key={i} className="text-white/60 text-xs flex items-start gap-1">
                                <MessageSquare className="w-3 h-3 mt-0.5 text-cyan-400" />{tp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== INTERVIEW TAB ===== */}
      {activeTab === "interview" && cvData && (
        <div className="space-y-6">
          {!interviewSession ? (
            <div className="glass-light rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <Mic className="w-6 h-6 text-indigo-400" />Interview Simulation
              </h3>
              
              {(!targetRole && !companyName) ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-white/80 mb-4">Please set your target role and company in the Analysis tab first</p>
                  <Button onClick={() => setActiveTab("analyze")} className="bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer">
                    <Target className="w-4 h-4 mr-2" />Go to Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Role Selection */}
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <label className="text-white font-medium mb-4 block">1. Select or Enter Interview Role</label>
                    
                    {/* Preset Role Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {commonRoles.map(role => (
                        <button key={role.id} onClick={() => handleRoleSelect(role.title)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            selectedRole === role.title 
                              ? "bg-indigo-500 text-white ring-2 ring-indigo-400" 
                              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                          }`}>
                          {role.title}
                        </button>
                      ))}
                      <button onClick={handleCustomRoleClick}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1 ${
                          showCustomRoleInput 
                            ? "bg-purple-500 text-white ring-2 ring-purple-400" 
                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                        }`}>
                        <Plus className="w-4 h-4" />Custom Role
                      </button>
                    </div>

                    {/* Custom Role Input */}
                    {showCustomRoleInput && (
                      <div className="mb-4">
                        <input type="text" value={customRole} onChange={(e) => setCustomRole(e.target.value)}
                          placeholder="Enter custom role (e.g., AI Product Manager, CEO)"
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-purple-500/50 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                      </div>
                    )}

                    {/* Current Selection Display */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                      <span className="text-white/60 text-sm">Preparing interview for:</span>
                      <p className="text-white font-semibold text-lg">{getEffectiveRole() || targetRole || "Select a role above"} at {companyName}</p>
                    </div>
                  </div>
                  
                  {/* Interview Stage Selection */}
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <label className="text-white font-medium mb-4 block">2. Choose Interview Round</label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(STAGE_INFO).map(([stage, info]) => (
                        <button key={stage} onClick={() => generateInterview(stage)}
                          disabled={isGeneratingInterview || !getEffectiveRole()}
                          className={`p-6 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${info.bg}`}>
                          <info.icon className={`w-8 h-8 ${info.color} mb-3`} />
                          <h4 className="text-white font-semibold mb-1">{info.name}</h4>
                          <p className="text-white/50 text-sm">Practice only this round</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Full Interview Button */}
                  <Button onClick={() => generateInterview("all")} 
                    disabled={isGeneratingInterview || !getEffectiveRole()}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 py-6 text-lg cursor-pointer disabled:opacity-50">
                    {isGeneratingInterview ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating Questions...</>
                    ) : (
                      <><PlayCircle className="w-5 h-5 mr-2" />Start Full Interview (All 3 Rounds)</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Interview In Progress */
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <Button onClick={resetInterview} variant="outline" className="border-white/20 hover:bg-white/10 cursor-pointer">
                    <ArrowLeft className="w-4 h-4 mr-2" />Change Role / Back
                  </Button>
                  <Button onClick={() => generateInterview(interviewSession.current_stage || "all", true)}
                    disabled={isGeneratingInterview} variant="outline" className="border-white/20 hover:bg-white/10 cursor-pointer">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isGeneratingInterview ? "Refreshing..." : "New Questions"}
                  </Button>
                </div>

                {/* Question Card */}
                <div className="glass-light rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const q = interviewSession.questions[currentQuestionIndex];
                        const stageInfo = STAGE_INFO[q?.stage] || STAGE_INFO.technical;
                        return (
                          <div className={`px-3 py-1 rounded-full ${stageInfo.bg} ${stageInfo.color} text-sm font-medium flex items-center gap-1`}>
                            <stageInfo.icon className="w-4 h-4" />{stageInfo.name}
                          </div>
                        );
                      })()}
                      <span className="text-white/40 text-sm">
                        Question {currentQuestionIndex + 1} of {interviewSession.questions.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-white/40" />
                      <span className={`font-mono ${timer > (interviewSession.questions[currentQuestionIndex]?.time_limit_seconds || 120) ? 'text-red-400' : 'text-white'}`}>
                        {formatTime(timer)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl text-white mb-6">
                    {interviewSession.questions[currentQuestionIndex]?.question}
                  </h3>
                  
                  {!currentEvaluation ? (
                    <div className="space-y-4">
                      <Textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here or use voice input..."
                        className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        disabled={isEvaluating} />
                      
                      <div className="flex gap-3">
                        {!isTimerRunning ? (
                          <Button onClick={startAnswer} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 cursor-pointer">
                            <Play className="w-4 h-4 mr-2" />Start Answering
                          </Button>
                        ) : (
                          <>
                            <Button onClick={toggleRecording} variant="outline"
                              className={`cursor-pointer border-white/20 ${isRecording ? 'bg-red-500/20 border-red-500/50' : ''}`}>
                              {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                              {isRecording ? "Stop" : "Voice"}
                            </Button>
                            <Button onClick={submitAnswer} disabled={isEvaluating || !answerText.trim()}
                              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer disabled:opacity-50">
                              {isEvaluating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                              {isEvaluating ? "Evaluating..." : "Submit Answer"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-6 rounded-xl bg-gradient-to-br ${getScoreBackground(currentEvaluation.score)}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold">Your Score</h4>
                          <span className={`text-3xl font-bold ${getScoreColor(currentEvaluation.score)}`}>{currentEvaluation.score}%</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          {[{ label: "Clarity", score: currentEvaluation.clarity_score },
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
                      {currentEvaluation.model_answer && (
                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                          <h4 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />If I Were You (Better Answer)
                          </h4>
                          <p className="text-white/80 text-sm whitespace-pre-wrap">{currentEvaluation.model_answer}</p>
                        </div>
                      )}
                      <div className="flex gap-3">
                        {currentQuestionIndex < interviewSession.questions.length - 1 ? (
                          <Button onClick={nextQuestion} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer">
                            <ArrowRight className="w-4 h-4 mr-2" />Next Question
                          </Button>
                        ) : (
                          <Button onClick={resetInterview} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 cursor-pointer">
                            <CheckCircle className="w-4 h-4 mr-2" />Finish & Start New
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="glass-light rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-4">Progress (Click to Jump)</h4>
                  <div className="space-y-2">
                    {interviewSession.questions.map((q, idx) => {
                      const stageInfo = STAGE_INFO[q.stage] || STAGE_INFO.technical;
                      const isCompleted = idx < currentQuestionIndex;
                      const isCurrent = idx === currentQuestionIndex;
                      return (
                        <button key={q.id} onClick={() => skipToQuestion(idx)}
                          className={`w-full p-3 rounded-lg border transition-all text-left cursor-pointer ${
                            isCurrent ? 'border-indigo-500 bg-indigo-500/10' :
                            isCompleted ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}>
                          <div className="flex items-center gap-2">
                            {isCompleted ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                              isCurrent ? <PlayCircle className="w-4 h-4 text-indigo-400" /> :
                              <div className="w-4 h-4 rounded-full border border-white/30" />}
                            <span className={`text-sm ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                              Q{idx + 1}: {stageInfo.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-light rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />"If I Were You" Mode
                  </h4>
                  <p className="text-white/50 text-xs mb-3">Paste any question to get a personalized model answer based on your CV</p>
                  <Textarea value={ifIWereYouQuestion} onChange={(e) => setIfIWereYouQuestion(e.target.value)}
                    placeholder="Paste any interview question..."
                    className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/30 mb-3" />
                  <Button onClick={getIfIWereYou} disabled={isGettingModelAnswer || !ifIWereYouQuestion.trim()}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer disabled:opacity-50">
                    {isGettingModelAnswer ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                    Get Model Answer
                  </Button>
                  {ifIWereYouResult && (
                    <div className="mt-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 max-h-60 overflow-y-auto">
                      <p className="text-white/80 text-sm whitespace-pre-wrap">{ifIWereYouResult.model_answer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== LEARNING ROADMAP TAB ===== */}
      {activeTab === "roadmap" && cvData && (
        <div className="space-y-6">
          <div className="glass-light rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Route className="w-6 h-6 text-orange-400" />Learning Roadmap
            </h3>
            
            {!targetRole && !getEffectiveRole() ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-white/80 mb-4">Please set your target role in the Analysis tab first</p>
                <Button onClick={() => setActiveTab("analyze")} className="bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer">
                  <Target className="w-4 h-4 mr-2" />Go to Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/60 text-sm mb-2">Creating roadmap for:</p>
                  <p className="text-white font-medium text-lg">{getEffectiveRole() || targetRole}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm mb-3 block">Select Timeframe</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[{ days: 7, label: "Quick Prep" }, { days: 14, label: "Balanced" }, { days: 30, label: "Comprehensive" }].map(({ days, label }) => (
                      <button key={days} onClick={() => setRoadmapTimeframe(days)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          roadmapTimeframe === days ? 'border-orange-500 bg-orange-500/20' : 'border-white/10 hover:border-white/20'
                        }`}>
                        <Calendar className={`w-6 h-6 mx-auto mb-2 ${roadmapTimeframe === days ? 'text-orange-400' : 'text-white/40'}`} />
                        <div className={`font-semibold ${roadmapTimeframe === days ? 'text-white' : 'text-white/60'}`}>{days} Days</div>
                        <div className="text-white/40 text-xs">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button onClick={generateRoadmap} disabled={isGeneratingRoadmap}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 py-6 text-lg cursor-pointer disabled:opacity-50">
                  {isGeneratingRoadmap ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-5 h-5 mr-2" />Generate {roadmapTimeframe}-Day Roadmap</>}
                </Button>
              </div>
            )}
          </div>

          {roadmap && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />Daily Plan
                </h4>
                {roadmap.daily_plan?.map((day, idx) => (
                  <div key={idx} className="glass-light rounded-xl overflow-hidden">
                    <button onClick={() => toggleDayExpand(day.day)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
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
                        <ul className="space-y-1">
                          {day.tasks?.map((task, tidx) => (
                            <li key={tidx} className="text-white/80 text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5" />{task}
                            </li>
                          ))}
                        </ul>
                        {day.milestones?.length > 0 && (
                          <div className="mt-3">
                            <span className="text-white/50 text-xs">By end of day:</span>
                            <ul className="mt-1 space-y-1">
                              {day.milestones.map((m, midx) => (
                                <li key={midx} className="text-green-300 text-sm flex items-start gap-2">
                                  <Star className="w-4 h-4 mt-0.5" />{m}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {roadmap.key_skills_to_learn?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-400" />Skills to Learn
                    </h4>
                    <div className="space-y-3">
                      {roadmap.key_skills_to_learn.map((skill, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{skill.skill}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              skill.priority === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                            }`}>{skill.priority}</span>
                          </div>
                          {skill.why_important && <p className="text-white/50 text-xs mt-1">{skill.why_important}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {roadmap.interview_focus_areas?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />Interview Focus
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
                {roadmap.practice_questions?.length > 0 && (
                  <div className="glass-light rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-400" />Practice Questions
                    </h4>
                    <ul className="space-y-2">
                      {roadmap.practice_questions.map((q, idx) => (
                        <li key={idx} className="text-white/80 text-sm p-2 rounded bg-white/5 border border-white/10">{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { setEditPopup(null); setEditResult(null); }}>
          <div className="w-full max-w-2xl mx-4 glass-heavy rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />Edit: {editPopup.section?.title}
              </h3>
              <button onClick={() => { setEditPopup(null); setEditResult(null); }} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10 max-h-40 overflow-y-auto">
              <span className="text-xs text-white/40 mb-2 block">Current Content</span>
              <p className="text-sm text-white/70 whitespace-pre-wrap">
                {editPopup.section?.content?.substring(0, 500)}{editPopup.section?.content?.length > 500 && "..."}
              </p>
            </div>
            <div className="mb-4">
              <label className="text-sm text-white/60 mb-2 block">What do you want to change and why?</label>
              <Textarea value={editInstruction} onChange={(e) => setEditInstruction(e.target.value)}
                placeholder="e.g., Make this more concise, add metrics, highlight leadership..."
                className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            </div>
            {!editResult ? (
              <Button onClick={handleEditSubmit} disabled={isEditing || !editInstruction.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer disabled:opacity-50">
                {isEditing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Edit</>}
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
                  <Button onClick={applyEdit} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 cursor-pointer">
                    <Save className="w-4 h-4 mr-2" />Apply Edit
                  </Button>
                  <Button onClick={() => setEditResult(null)} variant="outline" className="flex-1 border-white/20 hover:bg-white/10 cursor-pointer">
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
