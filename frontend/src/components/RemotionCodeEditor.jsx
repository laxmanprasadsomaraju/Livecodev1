import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Save, Play, AlertCircle, CheckCircle, Package, Download, 
  RefreshCw, Loader2, Code, Eye, Zap, Terminal, Check, X
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RemotionCodeEditor = ({ 
  initialCode = '', 
  videoConfig = {}, 
  onCodeChange,
  projectId = 'shared'
}) => {
  const [code, setCode] = useState(initialCode);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validation, setValidation] = useState(null);
  const [showPackages, setShowPackages] = useState(false);
  const [requiredPackages, setRequiredPackages] = useState([]);
  const [installedPackages, setInstalledPackages] = useState([]);
  const [isInstallingPackages, setIsInstallingPackages] = useState(false);
  const [installProgress, setInstallProgress] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const editorRef = useRef(null);

  // Update code when initialCode changes
  useEffect(() => {
    if (initialCode && initialCode !== code) {
      setCode(initialCode);
    }
  }, [initialCode]);

  // Auto-validate on code change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (code) {
        validateCode(code, false);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [code]);

  // Load installed packages on mount
  useEffect(() => {
    checkInstalledPackages();
  }, [projectId]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (onCodeChange) {
      onCodeChange(value);
    }
  };

  const validateCode = async (codeToValidate = code, showLoading = true) => {
    if (showLoading) setIsValidating(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/remotion/code/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToValidate })
      });
      
      const result = await response.json();
      setValidation(result);
      
      if (result.required_packages) {
        setRequiredPackages(result.required_packages);
      }
      
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      setValidation({
        success: false,
        is_valid: false,
        error: error.message
      });
    } finally {
      if (showLoading) setIsValidating(false);
    }
  };

  const checkInstalledPackages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/remotion/installed-packages/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setInstalledPackages(result.packages || []);
      }
    } catch (error) {
      console.error('Error checking packages:', error);
    }
  };

  const installAllPackages = async () => {
    setIsInstallingPackages(true);
    setInstallProgress({ current: 0, total: requiredPackages.length });
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/remotion/packages/install-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          categories: ['core', 'media_animation', 'graphics', 'text_captions']
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInstallProgress({ 
          current: result.total_installed, 
          total: result.total_requested,
          complete: true 
        });
        await checkInstalledPackages();
        
        setTimeout(() => {
          setInstallProgress(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Package installation error:', error);
      setInstallProgress(null);
    } finally {
      setIsInstallingPackages(false);
    }
  };

  const saveCode = async () => {
    setSavedSuccess(false);
    setIsSaving(true);
    
    try {
      // Validate first
      const validationResult = await validateCode(code, false);
      
      if (!validationResult.is_valid) {
        alert('Code has validation errors. Please fix them before saving.');
        setIsSaving(false);
        return;
      }
      
      // Save
      const response = await fetch(`${BACKEND_URL}/api/remotion/code/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          filename: 'MyComposition.tsx',
          project_id: projectId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert('Save failed: ' + result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save code: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MyComposition.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const missingPackages = requiredPackages.filter(pkg => !installedPackages.includes(pkg));

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Code className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-white">Code Editor</span>
          
          {/* Validation Status */}
          {validation && (
            <div className="flex items-center space-x-2">
              {validation.is_valid ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Valid</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    {(validation.syntax_errors?.length || 0) + (validation.ai_errors?.length || 0)} Errors
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Package Status */}
          <button
            onClick={() => setShowPackages(!showPackages)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm"
          >
            <Package className="w-4 h-4" />
            <span>{installedPackages.length} packages</span>
            {missingPackages.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-xs">
                {missingPackages.length} missing
              </span>
            )}
          </button>

          {/* Validate */}
          <button
            onClick={() => validateCode(code, true)}
            disabled={isValidating}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>Validate</span>
          </button>

          {/* Save */}
          <button
            onClick={saveCode}
            disabled={isSaving || !validation?.is_valid}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
          </button>

          {/* Download */}
          <button
            onClick={downloadCode}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Package Panel */}
      {showPackages && (
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Required Packages</h3>
              {missingPackages.length > 0 && (
                <button
                  onClick={installAllPackages}
                  disabled={isInstallingPackages}
                  className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-xs"
                >
                  {isInstallingPackages ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Package className="w-3 h-3" />
                  )}
                  <span>Install All Missing</span>
                </button>
              )}
            </div>

            {/* Install Progress */}
            {installProgress && (
              <div className="p-3 rounded-lg bg-cyan-900/30 border border-cyan-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-cyan-300">Installing packages...</span>
                  <span className="text-sm text-cyan-400">
                    {installProgress.current}/{installProgress.total}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ 
                      width: `${(installProgress.current / installProgress.total) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Package List */}
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {requiredPackages.map(pkg => {
                const isInstalled = installedPackages.includes(pkg);
                return (
                  <div
                    key={pkg}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                      isInstalled
                        ? 'bg-green-900/30 border border-green-700'
                        : 'bg-red-900/30 border border-red-700'
                    }`}
                  >
                    <span className={isInstalled ? 'text-green-300' : 'text-red-300'}>
                      {pkg}
                    </span>
                    {isInstalled ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validation && !validation.is_valid && (
        <div className="px-4 py-3 bg-red-900/20 border-b border-red-800">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Validation Errors</span>
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {[...(validation.syntax_errors || []), ...(validation.ai_errors || [])].map((error, idx) => (
                <div key={idx} className="text-xs text-red-300 flex items-start space-x-2">
                  <span className="text-red-500">•</span>
                  <span>
                    {error.line > 0 && `Line ${error.line}: `}
                    {error.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* Video Config Info */}
      {videoConfig && Object.keys(videoConfig).length > 0 && (
        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>
              <span className="text-gray-500">Resolution:</span> {videoConfig.width}x{videoConfig.height}
            </span>
            <span>
              <span className="text-gray-500">FPS:</span> {videoConfig.fps}
            </span>
            <span>
              <span className="text-gray-500">Frames:</span> {videoConfig.durationInFrames}
            </span>
            <span>
              <span className="text-gray-500">Duration:</span> {(videoConfig.durationInFrames / videoConfig.fps).toFixed(1)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemotionCodeEditor;
