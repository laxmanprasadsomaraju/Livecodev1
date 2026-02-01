import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Package, ExternalLink, Check, Download, Loader2, 
  Star, Zap, X, ChevronDown, ChevronUp, Sparkles, Info,
  BookOpen, Code, Box, Filter
} from 'lucide-react';
import packagesData from '../data/remotion-packages.json';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Package keyword mapping for AI recommendations
const PACKAGE_KEYWORDS = {
  '@remotion/three': ['3d', 'threejs', 'webgl', 'three.js', 'product', 'render', 'cube', 'sphere', 'model'],
  '@remotion/captions': ['subtitle', 'caption', 'text overlay', 'tiktok', 'srt', 'vtt'],
  '@remotion/transitions': ['transition', 'fade', 'slide', 'wipe', 'effect', 'scene change'],
  '@remotion/lottie': ['lottie', 'after effects', 'bodymovin', 'json animation'],
  '@remotion/gif': ['gif', 'animated gif', 'meme'],
  '@remotion/media-utils': ['audio', 'visualization', 'waveform', 'sound', 'music', 'equalizer'],
  '@remotion/shapes': ['shape', 'circle', 'rect', 'square', 'triangle', 'star', 'polygon', 'svg'],
  '@remotion/paths': ['path', 'svg path', 'draw', 'morph', 'line'],
  '@remotion/motion-blur': ['blur', 'motion blur', 'fast', 'speed'],
  '@remotion/noise': ['noise', 'perlin', 'organic', 'particle', 'random'],
  '@remotion/openai-whisper': ['speech', 'transcription', 'voice', 'whisper', 'speech to text'],
  '@remotion/tailwind': ['tailwind', 'css', 'styling', 'utility classes'],
  '@remotion/google-fonts': ['font', 'google font', 'typography', 'text style'],
  '@remotion/animated-emoji': ['emoji', 'emoticon', 'expression'],
  '@remotion/layout-utils': ['layout', 'text fit', 'measure', 'responsive'],
  '@remotion/rounded-text-box': ['text box', 'tiktok style', 'rounded', 'background text'],
  '@remotion/rive': ['rive', 'interactive animation'],
  '@remotion/player': ['embed', 'player', 'preview', 'web player'],
  '@remotion/lambda': ['lambda', 'aws', 'cloud render', 'serverless'],
  '@remotion/cloudrun': ['cloud run', 'gcp', 'google cloud']
};

// Recommend packages based on user description
const recommendPackages = (description) => {
  const desc = description.toLowerCase();
  const recommendations = [];
  
  for (const [packageName, keywords] of Object.entries(PACKAGE_KEYWORDS)) {
    const matchedKeywords = keywords.filter(keyword => desc.includes(keyword));
    if (matchedKeywords.length > 0) {
      recommendations.push({
        package: packageName,
        relevance: matchedKeywords.length,
        reason: `Detected: ${matchedKeywords.join(', ')}`
      });
    }
  }
  
  // Sort by relevance
  recommendations.sort((a, b) => b.relevance - a.relevance);
  return recommendations.slice(0, 6);
};

// Individual Package Card
const PackageCard = ({ pkg, onInstall, isInstalled, isInstalling }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getCategoryIcon = (category) => {
    const cat = packagesData.categories.find(c => c.id === category);
    return cat ? cat.icon : '📦';
  };
  
  const getCategoryColor = (category) => {
    const cat = packagesData.categories.find(c => c.id === category);
    return cat ? cat.color : '#64748b';
  };
  
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return '#34d399';
      case 'intermediate': return '#fbbf24';
      case 'advanced': return '#f87171';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-white/10 p-5 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(pkg.category)}</span>
          <div>
            <h3 className="text-white font-mono text-sm font-bold">{pkg.name}</h3>
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: `${getCategoryColor(pkg.category)}20`,
                color: getCategoryColor(pkg.category)
              }}
            >
              {pkg.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pkg.popular && (
            <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
              <Star className="w-3 h-3" /> Popular
            </span>
          )}
          {pkg.essential && (
            <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" /> Essential
            </span>
          )}
        </div>
      </div>
      
      {/* Description */}
      <p className="text-white/60 text-sm mb-4 leading-relaxed">{pkg.description}</p>
      
      {/* APIs Preview */}
      <div className="mb-4 space-y-2">
        {pkg.components.length > 0 && (
          <div>
            <span className="text-xs text-blue-400 font-semibold">Components:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {pkg.components.slice(0, 3).map((comp, idx) => (
                <span key={idx} className="text-xs bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded font-mono">
                  {comp}
                </span>
              ))}
              {pkg.components.length > 3 && (
                <span className="text-xs text-white/40">+{pkg.components.length - 3}</span>
              )}
            </div>
          </div>
        )}
        {pkg.functions.length > 0 && (
          <div>
            <span className="text-xs text-emerald-400 font-semibold">Functions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {pkg.functions.slice(0, 3).map((func, idx) => (
                <span key={idx} className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  {func}
                </span>
              ))}
              {pkg.functions.length > 3 && (
                <span className="text-xs text-white/40">+{pkg.functions.length - 3}</span>
              )}
            </div>
          </div>
        )}
        {pkg.hooks.length > 0 && (
          <div>
            <span className="text-xs text-purple-400 font-semibold">Hooks:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {pkg.hooks.map((hook, idx) => (
                <span key={idx} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded font-mono">
                  {hook}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Use Case */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
        <span className="text-xs text-purple-400 font-semibold">USE CASE:</span>
        <p className="text-xs text-purple-200 mt-1">{pkg.useCase}</p>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="bg-black/20 rounded-lg p-3 mb-4 space-y-2">
          <div>
            <span className="text-xs text-white/50">Install Command:</span>
            <code className="block text-xs bg-black/30 text-emerald-300 p-2 rounded mt-1 font-mono">
              {pkg.install}
            </code>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onInstall(pkg)}
          disabled={isInstalled || isInstalling}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            isInstalled 
              ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
              : isInstalling
                ? 'bg-purple-500/30 text-white cursor-wait'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white'
          }`}
        >
          {isInstalled ? (
            <>
              <Check className="w-4 h-4" />
              Installed
            </>
          ) : isInstalling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Installing...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Install
            </>
          )}
        </button>
        
        <a
          href={pkg.docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-all"
        >
          <BookOpen className="w-4 h-4" />
          Docs
        </a>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Difficulty Badge */}
      <div className="mt-3 flex justify-end">
        <span 
          className="text-xs font-semibold uppercase"
          style={{ color: getDifficultyColor(pkg.difficulty) }}
        >
          {pkg.difficulty}
        </span>
      </div>
    </div>
  );
};

// Main Package Explorer Component
const PackageExplorer = ({ onPackagesChange, projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [installedPackages, setInstalledPackages] = useState(new Set());
  const [installingPackages, setInstallingPackages] = useState(new Set());
  const [aiDescription, setAiDescription] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommender, setShowRecommender] = useState(false);
  const [quickInstallMode, setQuickInstallMode] = useState(null);
  
  // Filter packages
  const filteredPackages = useMemo(() => {
    return packagesData.packages.filter(pkg => {
      const matchesSearch = 
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || pkg.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);
  
  // Handle AI recommendations
  const handleGetRecommendations = () => {
    if (!aiDescription.trim()) return;
    const recs = recommendPackages(aiDescription);
    setRecommendations(recs);
  };
  
  // Install package
  const handleInstall = async (pkg) => {
    if (installedPackages.has(pkg.name) || installingPackages.has(pkg.name)) return;
    
    setInstallingPackages(prev => new Set([...prev, pkg.name]));
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/remotion/install-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_name: pkg.name,
          install_command: pkg.install,
          project_id: projectId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInstalledPackages(prev => new Set([...prev, pkg.name]));
        if (onPackagesChange) {
          onPackagesChange([...installedPackages, pkg.name]);
        }
      } else {
        console.error('Install failed:', result.error);
      }
    } catch (error) {
      console.error('Installation error:', error);
    } finally {
      setInstallingPackages(prev => {
        const next = new Set(prev);
        next.delete(pkg.name);
        return next;
      });
    }
  };
  
  // Quick install preset
  const handleQuickInstall = async (preset) => {
    setQuickInstallMode(preset);
    const packages = packagesData.quickInstall[preset];
    
    for (const pkgName of packages) {
      const pkg = packagesData.packages.find(p => p.name === pkgName);
      if (pkg && !installedPackages.has(pkg.name)) {
        await handleInstall(pkg);
      }
    }
    
    setQuickInstallMode(null);
  };
  
  // Install all recommendations
  const handleInstallRecommendations = async () => {
    for (const rec of recommendations) {
      const pkg = packagesData.packages.find(p => p.name === rec.package);
      if (pkg && !installedPackages.has(pkg.name)) {
        await handleInstall(pkg);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Remotion Package Explorer</h2>
            <p className="text-white/50 text-sm">Browse, search, and install 36+ packages</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search packages... (e.g., '3D', 'captions', 'transitions')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            All ({packagesData.packages.length})
          </button>
          {packagesData.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
              style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
            >
              <span>{cat.icon}</span>
              {cat.id}
            </button>
          ))}
        </div>
        
        {/* Quick Install & AI Recommender */}
        <div className="flex flex-wrap gap-3">
          {/* Quick Install Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Quick Install:</span>
            <button
              onClick={() => handleQuickInstall('minimal')}
              disabled={quickInstallMode !== null}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-all disabled:opacity-50"
            >
              {quickInstallMode === 'minimal' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Minimal'}
            </button>
            <button
              onClick={() => handleQuickInstall('standard')}
              disabled={quickInstallMode !== null}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
            >
              {quickInstallMode === 'standard' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Standard'}
            </button>
            <button
              onClick={() => handleQuickInstall('full')}
              disabled={quickInstallMode !== null}
              className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-all disabled:opacity-50"
            >
              {quickInstallMode === 'full' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Full Suite'}
            </button>
          </div>
          
          {/* AI Recommender Toggle */}
          <button
            onClick={() => setShowRecommender(!showRecommender)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showRecommender 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Recommender
          </button>
        </div>
        
        {/* AI Recommender Panel */}
        {showRecommender && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Describe your video, get package recommendations</span>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g., '3D product showcase with animated subtitles and transitions'"
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleGetRecommendations}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all"
              >
                Get Recommendations
              </button>
            </div>
            
            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Recommended packages:</span>
                  <button
                    onClick={handleInstallRecommendations}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-all"
                  >
                    Install All Recommended
                  </button>
                </div>
                {recommendations.map((rec, idx) => {
                  const pkg = packagesData.packages.find(p => p.name === rec.package);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-black/20 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm">{rec.package}</span>
                        <span className="text-xs text-white/40">({rec.reason})</span>
                      </div>
                      <button
                        onClick={() => pkg && handleInstall(pkg)}
                        disabled={installedPackages.has(rec.package)}
                        className={`text-xs px-2 py-1 rounded ${
                          installedPackages.has(rec.package)
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                        }`}
                      >
                        {installedPackages.has(rec.package) ? '✓ Installed' : 'Install'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Results Info */}
      <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-sm text-white/50">
          Found {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''}
        </span>
        {installedPackages.size > 0 && (
          <span className="text-sm text-emerald-400">
            {installedPackages.size} installed
          </span>
        )}
      </div>
      
      {/* Package Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPackages.map(pkg => (
            <PackageCard
              key={pkg.name}
              pkg={pkg}
              onInstall={handleInstall}
              isInstalled={installedPackages.has(pkg.name)}
              isInstalling={installingPackages.has(pkg.name)}
            />
          ))}
        </div>
        
        {/* No Results */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-white font-medium mb-2">No packages found</p>
            <p className="text-white/50 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageExplorer;
