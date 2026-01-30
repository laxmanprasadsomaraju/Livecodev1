import React, { useState, useRef, useCallback } from "react";
import {
  FileText, Upload, Target, Search, Briefcase, Building2,
  ChevronRight, Sparkles, AlertCircle, CheckCircle, Clock,
  Edit3, Save, X, Loader2, GraduationCap, Code, Award,
  User, Mail, Phone, Linkedin, Github, MapPin, BarChart3,
  TrendingUp, TrendingDown, Lightbulb, BookOpen, Star,
  ArrowRight, RefreshCw, MessageSquare, Zap
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

const CVIntelligenceView = () => {
  // State management
  const [activeTab, setActiveTab] = useState("upload"); // upload, editor, analyze
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
  
  const fileInputRef = useRef(null);

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
    if (file) {
      await uploadCV(file);
    }
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadCV(file);
    }
  };

  const uploadCV = async (file) => {
    // Validate file type
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

      if (!response.ok) {
        throw new Error('Failed to upload CV');
      }

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
    const rect = e.currentTarget.getBoundingClientRect();
    setEditPopup({
      section,
      x: rect.left + rect.width / 2,
      y: rect.top
    });
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

      // Update local state
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

  // Score color helper
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
            <p className="text-white/60 text-sm">Upload your CV, analyze gaps, and prepare for interviews with AI</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 glass-light rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "upload" 
              ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white" 
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload CV
        </button>
        <button
          onClick={() => setActiveTab("editor")}
          disabled={!cvData}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "editor" 
              ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white" 
              : cvData ? "text-white/60 hover:text-white hover:bg-white/5" : "text-white/30 cursor-not-allowed"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          CV Editor
        </button>
        <button
          onClick={() => setActiveTab("analyze")}
          disabled={!cvData}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "analyze" 
              ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white" 
              : cvData ? "text-white/60 hover:text-white hover:bg-white/5" : "text-white/30 cursor-not-allowed"
          }`}
        >
          <Target className="w-4 h-4" />
          Role Analysis
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300
              ${isDragging 
                ? "border-indigo-500 bg-indigo-500/10" 
                : "border-white/20 hover:border-indigo-500/50 hover:bg-white/5"
              }
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
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">PDF</span>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">DOCX</span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">LaTeX</span>
                    <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-300 text-xs">TXT</span>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.tex,.txt,.latex"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-light rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-3">
                <Edit3 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Smart CV Editing</h3>
              <p className="text-sm text-white/60">Click any section to edit with AI assistance. Preserves formatting and LaTeX syntax.</p>
            </div>
            <div className="glass-light rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Gap Analysis</h3>
              <p className="text-sm text-white/60">Compare your CV against job requirements. Get honest feedback on skill and experience gaps.</p>
            </div>
            <div className="glass-light rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Company Research</h3>
              <p className="text-sm text-white/60">Auto-research target companies. Get interview tips and common questions.</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor Tab */}
      {activeTab === "editor" && cvData && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* CV Sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contact Info */}
            {cvData.contact_info && Object.keys(cvData.contact_info).length > 0 && (
              <div className="glass-light rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Contact Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {cvData.contact_info.name && (
                    <div className="flex items-center gap-2 text-white/80">
                      <User className="w-4 h-4 text-white/40" />
                      {cvData.contact_info.name}
                    </div>
                  )}
                  {cvData.contact_info.email && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Mail className="w-4 h-4 text-white/40" />
                      {cvData.contact_info.email}
                    </div>
                  )}
                  {cvData.contact_info.phone && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Phone className="w-4 h-4 text-white/40" />
                      {cvData.contact_info.phone}
                    </div>
                  )}
                  {cvData.contact_info.linkedin && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Linkedin className="w-4 h-4 text-white/40" />
                      <span className="truncate">{cvData.contact_info.linkedin}</span>
                    </div>
                  )}
                  {cvData.contact_info.github && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Github className="w-4 h-4 text-white/40" />
                      <span className="truncate">{cvData.contact_info.github}</span>
                    </div>
                  )}
                  {cvData.contact_info.location && (
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="w-4 h-4 text-white/40" />
                      {cvData.contact_info.location}
                    </div>
                  )}
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
                    {section.content.length > 500 
                      ? section.content.substring(0, 500) + "..."
                      : section.content
                    }
                  </div>
                  
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {section.bullets.slice(0, 5).map((bullet, idx) => (
                        <li key={idx} className="text-white/60 text-sm flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                          {bullet}
                        </li>
                      ))}
                      {section.bullets.length > 5 && (
                        <li className="text-white/40 text-xs pl-6">
                          + {section.bullets.length - 5} more items
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* File Info */}
            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Document Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Filename</span>
                  <span className="text-white/80 truncate ml-2">{cvData.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Type</span>
                  <span className="text-white/80 uppercase">{cvData.file_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total Lines</span>
                  <span className="text-white/80">{cvData.total_lines}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Sections</span>
                  <span className="text-white/80">{cvData.sections?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-light rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => setActiveTab("analyze")}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Analyze for Job
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Upload New CV
                </Button>
              </div>
            </div>

            {/* Tips */}
            <div className="glass-light rounded-xl p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5" />
                  Click any section to edit with AI
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5" />
                  Be specific in your edit instructions
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5" />
                  LaTeX formatting is preserved automatically
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Tab */}
      {activeTab === "analyze" && cvData && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
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
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze CV
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Company Research */}
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
                {isResearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Research {companyName || "Company"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-4">
            {!analysisResult && !isAnalyzing && (
              <div className="glass-light rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Analysis Yet</h3>
                <p className="text-white/50 max-w-md">
                  Enter a target role and company name, then click "Analyze CV" to get a comprehensive gap analysis and personalized recommendations.
                </p>
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
                      {analysisResult.strengths.map((strength, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                          {strength}
                        </span>
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
                      {analysisResult.missing_keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm">
                          {keyword}
                        </span>
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
                            }`}>
                              {gap.priority}
                            </span>
                          </div>
                          <p className="text-sm text-white/60">{gap.how_to_learn}</p>
                          {gap.time_needed && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-white/40">
                              <Clock className="w-3 h-3" />
                              {gap.time_needed}
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
                      <Briefcase className="w-5 h-5 text-blue-400" />
                      Experience Gaps
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.experience_gaps.map((gap, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <p className="font-medium text-white mb-2">{gap.gap}</p>
                          <p className="text-sm text-white/60 mb-2">{gap.advice}</p>
                          {gap.alternative && (
                            <p className="text-sm text-indigo-300">
                              <ArrowRight className="w-3 h-3 inline mr-1" />
                              Alternative: {gap.alternative}
                            </p>
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
                            <ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            {item}
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
                            <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Mentor Advice */}
                {analysisResult.mentor_advice && (
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
                        {companyResearch.values.map((value, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
                            {value}
                          </span>
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
                            <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            {tip}
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
                            <MessageSquare className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
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
                Edit: {editPopup.section.title}
              </h3>
              <button 
                onClick={() => { setEditPopup(null); setEditResult(null); }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Current Content Preview */}
            <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10 max-h-40 overflow-y-auto">
              <span className="text-xs text-white/40 mb-2 block">Current Content</span>
              <p className="text-sm text-white/70 whitespace-pre-wrap">
                {editPopup.section.content.substring(0, 500)}
                {editPopup.section.content.length > 500 && "..."}
              </p>
            </div>

            {/* Edit Instruction */}
            <div className="mb-4">
              <label className="text-sm text-white/60 mb-2 block">
                What do you want to change and why?
              </label>
              <Textarea
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                placeholder="e.g., Make this more concise, add metrics, change tone to be more professional..."
                className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            {!editResult ? (
              <Button
                onClick={handleEditSubmit}
                disabled={isEditing || !editInstruction.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Edit
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Edit Result */}
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-xs text-green-400 mb-2 block flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    AI Suggested Edit
                  </span>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{editResult.edited_text}</p>
                </div>

                {/* Explanation */}
                <div className="p-3 rounded-lg bg-white/5">
                  <span className="text-xs text-white/40 mb-1 block">Changes Made</span>
                  <p className="text-sm text-white/70">{editResult.explanation}</p>
                  {editResult.changes_summary?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {editResult.changes_summary.map((change, idx) => (
                        <li key={idx} className="text-xs text-white/50 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={applyEdit}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Apply Edit
                  </Button>
                  <Button
                    onClick={() => setEditResult(null)}
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
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
