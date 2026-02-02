import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, ExternalLink, CheckCircle2, AlertCircle, Play, Settings } from 'lucide-react';
import OpenClaw from '@/components/ui/icons/OpenClaw';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

export default function OpenClawView({ user }) {
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkOpenClawStatus();
  }, []);

  const checkOpenClawStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch(`${API}/openclaw/status`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await response.json();
        setStatus(data);
        if (data.google_authenticated) {
          setIsGoogleAuthenticated(true);
        }
      }
    } catch (e) {
      console.error('Status check failed:', e);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleAuthLoading(true);
    try {
      // Trigger Google OAuth flow
      const response = await fetch(`${API}/openclaw/google-auth-url`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to get auth URL');
      
      const data = await response.json();
      
      if (data.auth_url) {
        // Redirect to Google OAuth
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to initiate Google sign-in');
      setGoogleAuthLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/60">Checking OpenClaw status...</p>
        </div>
      </div>
    );
  }

  if (!isGoogleAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 mb-6">
            <OpenClaw className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Welcome to OpenClaw</h1>
          <p className="text-white/60 text-lg">
            AI-powered development environment with intelligent code assistance
          </p>
        </motion.div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-400" />
              Authentication Required
            </CardTitle>
            <CardDescription className="text-white/60">
              Sign in with Google to access OpenClaw features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign-In Section */}
            <div className="p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Sign in with Google</h3>
                  <p className="text-sm text-white/60 mb-4">
                    Connect your Google account to enable OpenClaw features and synchronization
                  </p>
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={googleAuthLoading}
                    className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-900 font-semibold"
                  >
                    {googleAuthLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                        </svg>
                        Sign in with Google
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-6 border-t border-white/10">
                <p className="text-sm font-medium text-white/80">What you'll get:</p>
                {[
                  'AI-powered code completion and suggestions',
                  'Intelligent code refactoring',
                  'Real-time collaboration features',
                  'Cloud-based development environment',
                  'Integrated debugging tools'
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">Secure Authentication</p>
                <p className="text-xs text-white/60">
                  We use Google's secure OAuth 2.0 protocol. We never see your password, 
                  and you can revoke access anytime from your Google account settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-white/40">
            By signing in, you agree to OpenClaw's terms of service
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, show OpenClaw dashboard (you can expand this)
  return (
    <div>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            OpenClaw Ready
          </CardTitle>
          <CardDescription className="text-white/60">
            Your OpenClaw environment is configured and ready to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <OpenClaw className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-white/60">OpenClaw dashboard coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
