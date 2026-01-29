import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, MessageSquare, Youtube, Send, Loader2, Image as ImageIcon,
  X, Video, Search, Link2, Play, ExternalLink, Sparkles, Brain,
  BookOpen, Lightbulb, Target, Clock, CheckCircle2, Edit3, Plus,
  Upload, FileText, Zap, Eye, ChevronRight, AlertCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import VideoLearningModal from "./VideoLearningModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TopicDetailView = ({ topic, userProfile, onBack, onUpdateTopic }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showVideoSearch, setShowVideoSearch] = useState(false);
  const [searchedVideos, setSearchedVideos] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [urlPreview, setUrlPreview] = useState(null);
  const [activeSection, setActiveSection] = useState("chat"); // chat, video
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const hasVideo = topic?.youtube_url || topic?.video_id;

  useEffect(() => {
    // Welcome message when entering topic detail
    setMessages([{
      role: "assistant",
      content: `# 🎯 Welcome to ${topic?.name}!\n\n${topic?.description || "I'm your AI learning companion for this topic."}\n\n## What would you like to do?\n\n**💬 Chat-Based Learning** (You're here!)\n- Ask me anything about ${topic?.name}\n- Upload images for analysis\n- Request visual explanations\n- Get step-by-step guidance\n\n**📺 Video Learning** (Check the right panel)\n- ${hasVideo ? 'Watch with AI companion' : 'Find YouTube tutorials'}\n- Interactive learning with real-time help\n- Transcript-based Q&A\n\nLet's start learning! What would you like to know? 🚀`
    }]);
  }, [topic]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract YouTube video ID
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  // Fetch YouTube preview
  const fetchUrlPreview = async (url) => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      setUrlPreview(null);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/learning/youtube/preview/${videoId}`);
      const data = await response.json();
      if (data.success) {
        setUrlPreview(data);
      }
    } catch (error) {
      console.error("Preview fetch error:", error);
    }
  };

  useEffect(() => {
    if (!newVideoUrl) {
      setUrlPreview(null);
      return;
    }
    const timer = setTimeout(() => fetchUrlPreview(newVideoUrl), 500);
    return () => clearTimeout(timer);
  }, [newVideoUrl]);

  // Research videos using AI
  const handleResearchVideos = async () => {
    setIsSearching(true);
    setShowVideoSearch(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/learning/research-resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.name,
          level: userProfile?.experience || "beginner",
          goal: `Learn ${topic.name}`
        })
      });

      if (!response.ok) throw new Error("Failed to research videos");

      const data = await response.json();
      
      if (data.youtube_playlists && data.youtube_playlists.length > 0) {
        setSearchedVideos(data.youtube_playlists);
        toast.success(`Found ${data.youtube_playlists.length} videos!`);
      } else {
        toast.info("No videos found. Try adding a URL manually.");
        setSearchedVideos([]);
      }
    } catch (error) {
      toast.error("Failed to research videos");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  // Add manual URL to topic
  const handleAddVideoUrl = () => {
    if (!urlPreview) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    const updatedTopic = {
      ...topic,
      youtube_url: `https://www.youtube.com/watch?v=${urlPreview.video_id}`,
      video_id: urlPreview.video_id,
      video_title: urlPreview.title,
      thumbnail_url: urlPreview.thumbnail_url
    };

    if (onUpdateTopic) {
      onUpdateTopic(updatedTopic);
    }

    setShowAddUrl(false);
    setNewVideoUrl("");
    setUrlPreview(null);
    toast.success("Video added to topic!");
  };

  // Select video from search results
  const handleSelectVideo = (video) => {
    const videoId = extractVideoId(video.url);
    const updatedTopic = {
      ...topic,
      youtube_url: video.url,
      video_id: videoId,
      video_title: video.title,
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };

    if (onUpdateTopic) {
      onUpdateTopic(updatedTopic);
    }

    setShowVideoSearch(false);
    toast.success("Video added! Now you can learn with AI.");
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          file,
          preview: reader.result,
          base64: reader.result.split(',')[1]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message with optional image
  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = {
      role: "user",
      content: input || "📸 Please analyze this image",
      image: selectedImage?.preview
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = selectedImage;
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const requestBody = {
        message: currentInput || "Please analyze this image and explain it in the context of " + topic.name,
        topic: topic,
        user_profile: userProfile,
        conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
      };

      // If there's an image, include it for Gemini analysis
      if (currentImage) {
        requestBody.image_base64 = currentImage.base64;
        requestBody.analyze_visual = true;
      }

      const response = await fetch(`${BACKEND_URL}/api/learning/mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response
      }]);

    } catch (error) {
      toast.error("Failed to get response");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Request visual explanation
  const requestVisualExplanation = async () => {
    if (isLoading) return;
    
    const userMessage = {
      role: "user",
      content: `Can you provide a visual explanation or diagram for ${topic.name}?`
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/learning/visual-explanation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.name,
          skill_level: userProfile?.experience || "intermediate",
          context: messages.slice(-3).map(m => m.content).join('\n')
        })
      });

      if (!response.ok) throw new Error("Failed to generate visual");

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.explanation,
        visual: data.diagram || data.mermaid_code
      }]);

    } catch (error) {
      // Fallback: just ask for a detailed explanation with bullet points
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Let me explain ${topic.name} visually:\n\n## 📊 Concept Breakdown\n\n[Requesting detailed visual explanation...]\n\nI'll provide a structured breakdown with diagrams. One moment...`
      }]);
      
      // Make a regular mentor call for detailed explanation
      setTimeout(async () => {
        try {
          const fallbackResponse = await fetch(`${BACKEND_URL}/api/learning/mentor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: `Please provide a detailed, structured visual explanation of ${topic.name} with step-by-step breakdown, analogies, and examples. Use markdown formatting with headers, bullet points, and emojis to make it visual.`,
              topic: topic,
              user_profile: userProfile,
              conversation_history: []
            })
          });
          
          const fallbackData = await fallbackResponse.json();
          setMessages(prev => [...prev, {
            role: "assistant",
            content: fallbackData.response
          }]);
        } catch (err) {
          console.error("Fallback explanation error:", err);
        }
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Path
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#667eea]" />
            <h1 className="text-xl font-bold">{topic?.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 glass-light rounded-full text-xs">
            {topic?.level || "Beginner"} • {topic?.estimatedTime || "1-2 hours"}
          </div>
        </div>
      </div>

      {/* Mobile tabs for small screens */}
      <div className="lg:hidden flex gap-2 p-4 border-b border-white/10">
        <Button
          onClick={() => setActiveSection("chat")}
          variant={activeSection === "chat" ? "default" : "outline"}
          className={activeSection === "chat" ? "bg-[#667eea]" : "border-white/20"}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat Learning
        </Button>
        <Button
          onClick={() => setActiveSection("video")}
          variant={activeSection === "video" ? "default" : "outline"}
          className={activeSection === "video" ? "bg-[#EA4335]" : "border-white/20"}
        >
          <Youtube className="w-4 h-4 mr-2" />
          Video Learning
        </Button>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left: Chat-Based Learning */}
        <div className={`${activeSection === "chat" ? "flex" : "hidden lg:flex"} flex-1 flex-col glass-heavy rounded-2xl overflow-hidden`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Chat-Based Learning</h3>
                <p className="text-xs text-white/50">Interactive AI mentor for {topic?.name}</p>
              </div>
              <Button
                onClick={requestVisualExplanation}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="border-[#FBBC04]/30 text-[#FBBC04] hover:bg-[#FBBC04]/10"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Visual Explanation
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-white/50">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {selectedImage && (
            <div className="px-4 pb-2">
              <div className="relative inline-block">
                <img
                  src={selectedImage.preview}
                  alt="Upload preview"
                  className="h-20 rounded-lg border border-white/20"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="icon"
                className="border-white/20"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about this topic, upload images, or request explanations..."
                className="flex-1 min-h-[60px] max-h-[150px] bg-white/5 border-white/10"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="px-4 bg-[#667eea]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
              <div className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Upload images for analysis
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Request visual explanations
              </div>
            </div>
          </div>
        </div>

        {/* Right: Video Learning Options */}
        <div className={`${activeSection === "video" ? "flex" : "hidden lg:flex"} w-full lg:w-[400px] flex-col gap-4`}>
          {/* Video Section Card */}
          <div className="glass-heavy rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#EA4335]/20 flex items-center justify-center">
                <Youtube className="w-5 h-5 text-[#EA4335]" />
              </div>
              <div>
                <h3 className="font-semibold">Video Learning</h3>
                <p className="text-xs text-white/50">Watch and learn with AI</p>
              </div>
            </div>

            {hasVideo ? (
              // Has video - show watch option
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={topic.thumbnail_url || `https://img.youtube.com/vi/${topic.video_id}/hqdefault.jpg`}
                    alt={topic.video_title || topic.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <div className="text-sm font-medium line-clamp-2">
                      {topic.video_title || topic.name}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowVideoModal(true)}
                  className="w-full bg-gradient-to-r from-[#EA4335] to-[#FBBC04] hover:opacity-90 h-12"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" fill="white" />
                  Watch with AI Companion
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAddUrl(true)}
                    variant="outline"
                    className="flex-1 border-white/20 text-xs"
                    size="sm"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Change Video
                  </Button>
                  <Button
                    onClick={() => window.open(topic.youtube_url, '_blank')}
                    variant="outline"
                    className="flex-1 border-white/20 text-xs"
                    size="sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in YouTube
                  </Button>
                </div>
              </div>
            ) : (
              // No video - show options to add
              <div className="space-y-3">
                <div className="p-6 border-2 border-dashed border-white/20 rounded-xl text-center">
                  <Video className="w-12 h-12 mx-auto mb-3 text-white/30" />
                  <p className="text-sm text-white/60 mb-4">
                    No video added yet. Add one to unlock AI-powered video learning!
                  </p>
                </div>

                <Button
                  onClick={handleResearchVideos}
                  disabled={isSearching}
                  className="w-full bg-[#667eea] hover:bg-[#667eea]/80 h-12"
                  size="lg"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching for videos...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Find YouTube Videos (AI)
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-[#1E293B] text-white/50">OR</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowAddUrl(true)}
                  variant="outline"
                  className="w-full border-white/20 h-12"
                  size="lg"
                >
                  <Link2 className="w-5 h-5 mr-2" />
                  Add YouTube URL Manually
                </Button>
              </div>
            )}

            {/* Quick Info */}
            <div className="mt-4 p-4 glass-light rounded-xl space-y-3">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-[#34A853] mt-0.5" />
                <div className="text-xs">
                  <div className="font-medium text-white/70 mb-1">Learning Objective</div>
                  <div className="text-white/50">{topic?.objective || `Master ${topic?.name}`}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#FBBC04] mt-0.5" />
                <div className="text-xs">
                  <div className="font-medium text-white/70 mb-1">Estimated Time</div>
                  <div className="text-white/50">{topic?.estimatedTime || "1-2 hours"}</div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-[#34A853]/30 text-[#34A853] hover:bg-[#34A853]/10"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
        </div>
      </div>

      {/* Video Search Modal */}
      {showVideoSearch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl glass-heavy rounded-2xl p-6 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-[#667eea]" />
                <div>
                  <h2 className="text-xl font-bold">YouTube Videos for "{topic?.name}"</h2>
                  <p className="text-sm text-white/50">Select a video to learn with AI companion</p>
                </div>
              </div>
              <Button
                onClick={() => setShowVideoSearch(false)}
                variant="ghost"
                size="icon"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#667eea] mb-4" />
                <p className="text-white/60">Searching for best videos...</p>
              </div>
            ) : searchedVideos.length > 0 ? (
              <div className="space-y-3">
                {searchedVideos.map((video, idx) => (
                  <div
                    key={idx}
                    className="p-4 glass-light rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                    onClick={() => handleSelectVideo(video)}
                  >
                    <div className="flex gap-4">
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={`https://img.youtube.com/vi/${extractVideoId(video.url)}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-white" fill="white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{video.title}</h3>
                        <p className="text-xs text-white/50 mb-2">
                          {video.channel} • {video.estimated_duration || "Video Tutorial"}
                        </p>
                        <Button
                          size="sm"
                          className="bg-[#667eea] hover:bg-[#667eea]/80"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Select & Learn
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-white/30" />
                <p className="text-white/60 mb-4">No videos found. Try adding a URL manually.</p>
                <Button
                  onClick={() => {
                    setShowVideoSearch(false);
                    setShowAddUrl(true);
                  }}
                  className="bg-[#667eea]"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Add URL Manually
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add URL Modal */}
      {showAddUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl glass-heavy rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link2 className="w-6 h-6 text-[#EA4335]" />
                <div>
                  <h2 className="text-xl font-bold">Add YouTube Video</h2>
                  <p className="text-sm text-white/50">Paste a YouTube URL to add to this topic</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setShowAddUrl(false);
                  setNewVideoUrl("");
                  setUrlPreview(null);
                }}
                variant="ghost"
                size="icon"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <Input
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-white/5 border-white/10 mb-4"
            />

            {urlPreview && (
              <div className="p-4 glass-light rounded-xl mb-4">
                <div className="flex gap-3">
                  <img
                    src={urlPreview.thumbnail_url}
                    alt={urlPreview.title}
                    className="w-32 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1">{urlPreview.title}</h3>
                    <p className="text-xs text-white/50">{urlPreview.author_name}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#34A853]" />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAddVideoUrl}
                disabled={!urlPreview}
                className="flex-1 bg-[#EA4335] hover:bg-[#EA4335]/80"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Add Video
              </Button>
              <Button
                onClick={() => {
                  setShowAddUrl(false);
                  setNewVideoUrl("");
                  setUrlPreview(null);
                }}
                variant="outline"
                className="border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Learning Modal */}
      {showVideoModal && hasVideo && (
        <VideoLearningModal
          videoUrl={topic.youtube_url}
          videoTitle={topic.video_title || topic.name}
          onClose={() => setShowVideoModal(false)}
          skillLevel={userProfile?.experience || "intermediate"}
        />
      )}
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] p-4 rounded-2xl ${
        isUser ? 'bg-[#667eea] text-white' : 'glass-light'
      }`}>
        {message.image && (
          <img
            src={message.image}
            alt="User upload"
            className="max-h-48 rounded-lg mb-2"
          />
        )}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default TopicDetailView;
