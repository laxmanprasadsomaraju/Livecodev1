import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, MessageSquare, Newspaper, FileText, Video, 
  LogOut, ChevronDown, User, Cog
} from 'lucide-react';
import OpenClaw from '@/components/ui/icons/OpenClaw';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Import your existing views (these need to exist or be created)
import LearningView from '@/components/views/LearningView';
import AgentsView from '@/components/views/AgentsView';
import MoltbotView from '@/components/views/MoltbotView';
import NewsView from '@/components/views/NewsView';
import CVIntelligenceView from '@/components/views/CVIntelligenceView';
import RemotionStudioView from '@/components/views/RemotionStudioView';
import OpenClawView from '@/components/views/OpenClawView';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const tabs = [
  { id: 'learning', name: 'Learning', icon: BookOpen, emoji: '🧠' },
  { id: 'agents', name: 'Agents', icon: Users, emoji: '🤖' },
  { id: 'moltbot', name: 'Moltbot', icon: MessageSquare, emoji: '🦞' },
  { id: 'news', name: 'News', icon: Newspaper, emoji: '📰' },
  { id: 'cv', name: 'CV Intelligence', icon: FileText, emoji: '📄' },
  { id: 'remotion', name: 'Remotion Studio', icon: Video, emoji: '🎬' },
  { id: 'openclaw', name: 'OpenClaw', icon: OpenClaw, emoji: '🦞', isSpecial: true }
];

export default function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(location.state?.user || null);
  const [isAuthenticated, setIsAuthenticated] = useState(location.state?.user ? true : null);
  const [activeTab, setActiveTab] = useState('learning');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check auth on mount
  useEffect(() => {
    if (location.state?.user) {
      setIsAuthenticated(true);
      setUser(location.state.user);
      return;
    }
    
    const checkAuth = async () => {
      try {
        const sessionToken = localStorage.getItem('judge_session_token');
        const email = localStorage.getItem('judge_email');
        
        if (sessionToken && email) {
          setUser({ email });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate('/login', { replace: true });
        }
      } catch (e) {
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate, location.state]);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (e) {
      console.error('Logout failed:', e);
      navigate('/login', { replace: true });
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-white">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'learning':
        return <LearningView />;
      case 'agents':
        return <AgentsView />;
      case 'moltbot':
        return <MoltbotView />;
      case 'news':
        return <NewsView />;
      case 'cv':
        return <CVIntelligenceView />;
      case 'remotion':
        return <RemotionStudioView />;
      case 'openclaw':
        return <OpenClawView user={user} />;
      default:
        return <LearningView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-xl">🎓</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Live Code Mentor</h1>
                <p className="text-xs text-white/50">AI-Powered Learning</p>
              </div>
            </div>

            {/* Tabs */}
            <nav className="hidden lg:flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-white/10 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }
                      ${tab.isSpecial ? 'border border-green-500/30' : ''}
                    `}
                  >
                    {tab.emoji && <span className="text-base">{tab.emoji}</span>}
                    <span className="hidden xl:inline">{tab.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white hidden sm:inline">
                  {user?.email || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-white/60" />
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-900 border border-white/10 shadow-xl py-2"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/5 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex items-center space-x-2 min-w-max">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                      ${isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }
                      ${tab.isSpecial ? 'border border-green-500/30' : ''}
                    `}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </main>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
