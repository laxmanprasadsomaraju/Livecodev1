import React, { useState, useEffect } from "react";
import { 
  Newspaper, RefreshCw, Loader2, ExternalLink, Clock, 
  Sparkles, TrendingUp, Code, Brain, Cpu, Globe,
  ChevronRight, Search, Filter, X, BookOpen, Zap,
  AlertCircle, CheckCircle2
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NEWS_CATEGORIES = [
  { id: "all", name: "All News", icon: Newspaper, color: "#667eea" },
  { id: "ai", name: "AI & ML", icon: Brain, color: "#EA4335" },
  { id: "tech", name: "Technology", icon: Cpu, color: "#34A853" },
  { id: "coding", name: "Programming", icon: Code, color: "#FBBC04" },
  { id: "products", name: "Products", icon: Sparkles, color: "#f59e0b" },
  { id: "startups", name: "Startups", icon: TrendingUp, color: "#9333ea" },
];

const AINewsFeed = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Changed to false - don't load on mount
  const [category, setCategory] = useState("all");
  const [searchInput, setSearchInput] = useState(""); // For display only
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleSummary, setArticleSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // REMOVED automatic fetch - only on Refresh button click now!

  const fetchNews = async (customQuery = null) => {
    setIsLoading(true);
    try {
      let url = `${BACKEND_URL}/api/news/search-live?category=${category}`;
      if (customQuery) {
        url += `&query=${encodeURIComponent(customQuery)}`;
      }
      
      console.log("Fetching news from:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log("News data received:", data);
      
      setNews(data.articles || []);
      
      if (data.articles && data.articles.length > 0) {
        toast.success(`✨ Found ${data.articles.length} latest articles!`);
      } else {
        toast.info("No articles found. Try different search.");
      }
    } catch (error) {
      console.error("News fetch error:", error);
      toast.error("Failed to fetch news");
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleClick = async (article) => {
    if (!article.url || article.url === "#") {
      toast.error("Article URL not available");
      return;
    }
    
    setSelectedArticle(article);
    setIsSummarizing(true);
    setArticleSummary(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/news/summarize-article`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: article.url })
      });
      
      if (!response.ok) throw new Error("Failed to summarize");
      
      const data = await response.json();
      setArticleSummary(data);
    } catch (error) {
      console.error("Summarize error:", error);
      toast.error("Failed to summarize article");
      setArticleSummary({
        title: article.title,
        summary: "Unable to fetch article content. You can click the link below to read on the original website.",
        key_points: [],
        error: true
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  // Remove the filteredNews filter - just show all news
  const displayNews = news;

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recent";
    }
  };

  const getCategoryColor = (cat) => {
    const found = NEWS_CATEGORIES.find(c => c.id === cat);
    return found?.color || "#667eea";
  };

  return (
    <>
      <div className="glass-heavy rounded-2xl p-6 h-full" data-testid="ai-news-feed">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#667eea]/20 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-[#667eea]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">🌟 AI & Tech News</h2>
              <p className="text-xs text-white/50">Real-time updates • Powered by MOLTBOT</p>
            </div>
          </div>
          <Button 
            onClick={fetchNews} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="border-white/20 hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchInput.trim()) {
                fetchNews(searchInput);
              }
            }}
            placeholder="🔍 Search any news topic and press Enter..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#667eea] transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {NEWS_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  category === cat.id 
                    ? 'bg-white/10 border border-white/20 shadow-lg' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: cat.color }} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* News List */}
        <div className="space-y-3 max-h-[500px] overflow-auto pr-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#667eea] mb-3" />
              <p className="text-white/60 text-sm">🔍 Researching latest news...</p>
            </div>
          ) : displayNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-white/30 mb-3" />
              <p className="text-white/60 text-sm">No articles found</p>
              <p className="text-white/40 text-xs mt-1">Try a different category or refresh</p>
            </div>
          ) : (
            displayNews.map((article, idx) => (
              <div
                key={article.id || idx}
                onClick={() => handleArticleClick(article)}
                className="p-4 glass-light rounded-xl hover:bg-white/10 transition-all cursor-pointer group border border-white/5 hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[#667eea] transition-colors">
                      {article.title}
                    </h3>
                    
                    {/* Summary */}
                    {article.summary && (
                      <p className="text-xs text-white/60 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-white/50">
                        <Clock className="w-3 h-3" />
                        {formatTime(article.publishedAt)}
                      </div>
                      {article.source && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-white/30" />
                          <span className="text-white/50">{article.source}</span>
                        </>
                      )}
                      {article.category && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-white/30" />
                          <span 
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ 
                              backgroundColor: `${getCategoryColor(article.category)}20`,
                              color: getCategoryColor(article.category)
                            }}
                          >
                            {article.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#667eea] transition-all group-hover:translate-x-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Article Summary Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl glass-heavy rounded-2xl p-6 max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-[#667eea]" />
                  <span className="text-xs text-white/50">Article Summary</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {articleSummary?.title || selectedArticle.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  {selectedArticle.source && (
                    <span>📰 {selectedArticle.source}</span>
                  )}
                  <div className="w-1 h-1 rounded-full bg-white/30" />
                  <span>⏰ {formatTime(selectedArticle.publishedAt)}</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSelectedArticle(null);
                  setArticleSummary(null);
                }}
                variant="ghost"
                size="icon"
                className="hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            {isSummarizing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#667eea] mb-3" />
                <p className="text-white/60">🤖 AI is reading and summarizing the article...</p>
                <p className="text-white/40 text-sm mt-2">Using MOLTBOT deep research</p>
              </div>
            ) : articleSummary ? (
              <div className="space-y-6">
                {/* Summary */}
                {articleSummary.summary && (
                  <div className="p-4 glass-light rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[#FBBC04]" />
                      <h3 className="font-semibold text-sm">📝 Summary</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{articleSummary.summary}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Key Points */}
                {articleSummary.key_points && articleSummary.key_points.length > 0 && (
                  <div className="p-4 glass-light rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
                      <h3 className="font-semibold text-sm">🎯 Key Points</h3>
                    </div>
                    <ul className="space-y-2">
                      {articleSummary.key_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                          <span className="text-[#34A853] mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Full Content */}
                {articleSummary.full_content && (
                  <div className="p-4 glass-light rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-[#667eea]" />
                      <h3 className="font-semibold text-sm">📄 Detailed Analysis</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{articleSummary.full_content}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Takeaways */}
                {articleSummary.takeaways && articleSummary.takeaways.length > 0 && (
                  <div className="p-4 glass-light rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-[#FBBC04]" />
                      <h3 className="font-semibold text-sm">💡 Key Takeaways</h3>
                    </div>
                    <ul className="space-y-2">
                      {articleSummary.takeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                          <span className="text-[#FBBC04]">✨</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Error Message */}
                {articleSummary.error && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-500 text-sm">
                      ⚠️ Content may be limited. Visit the original article for full details.
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
              <Button
                onClick={() => window.open(selectedArticle.url, '_blank')}
                className="flex-1 bg-[#667eea] hover:bg-[#667eea]/80"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Read Full Article
              </Button>
              <Button
                onClick={() => {
                  setSelectedArticle(null);
                  setArticleSummary(null);
                }}
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AINewsFeed;
