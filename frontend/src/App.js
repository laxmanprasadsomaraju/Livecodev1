import React, { useState, useEffect } from "react";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import CodeLearningView from "./components/CodeLearningView";
import EnglishChatView from "./components/EnglishChatView";
import IDEView from "./components/IDEView";
import AgentsView from "./components/AgentsView";
import LearningPathView from "./components/LearningPathView";
import AINewsFeed from "./components/AINewsFeed";
import MoltbotView from "./components/MoltbotView";
import MoltbotFullView from "./components/MoltbotFullView";
import CVIntelligenceView from "./components/CVIntelligenceView";
import RemotionStudioView from "./components/RemotionStudioView";
import LoginPage from "./components/LoginPage";
import { MentorProvider } from "./contexts/MentorContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [mode, setMode] = useState("learning");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const sessionToken = localStorage.getItem('session_token');
    
    if (!sessionToken) {
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken })
      });

      const data = await response.json();
      
      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_email');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-white">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <MentorProvider>
      <div className="min-h-screen bg-[#0B0B0F] grid-bg">
        <div className="noise-overlay" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header mode={mode} onModeChange={setMode} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {mode === "learning" ? (
              <LearningPathView />
            ) : mode === "agents" ? (
              <AgentsView />
            ) : mode === "news" ? (
              <div className="max-w-4xl mx-auto">
                <AINewsFeed />
              </div>
            ) : mode === "cv" ? (
              <CVIntelligenceView />
            ) : mode === "ide" ? (
              <IDEView />
            ) : mode === "code" ? (
              <CodeLearningView />
            ) : mode === "moltbot" ? (
              <div className="max-w-5xl mx-auto">
                <MoltbotView />
              </div>
            ) : mode === "moltbot-full" ? (
              <MoltbotFullView />
            ) : mode === "remotion" ? (
              <RemotionStudioView />
            ) : (
              <EnglishChatView />
            )}
          </main>
        </div>
        <Toaster position="bottom-right" richColors />
      </div>
    </MentorProvider>
  );
}

export default App;
