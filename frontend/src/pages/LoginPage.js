import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Lock, Mail, User, AlertCircle } from 'lucide-react';
import OpenClaw from '@/components/ui/icons/OpenClaw';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Hardcoded judge credentials
const JUDGE_EMAIL = 'judge@gemini3hackathon.dev';
const JUDGE_PASSWORD = 'Gemini3Hackathon2026!';

export default function LoginPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionToken = localStorage.getItem('judge_session_token');
        if (sessionToken) {
          const response = await fetch(`${API}/auth/check-judge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: sessionToken })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
              navigate('/', { replace: true, state: { user: { email: data.email } } });
              return;
            }
          }
        }
      } catch (e) {
        console.error('Auth check failed:', e);
      }
      setChecking(false);
    };
    checkAuth();
  }, [navigate]);

  const handleJudgeLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      // Simple credential check
      if (email === JUDGE_EMAIL && password === JUDGE_PASSWORD) {
        // Create session token
        const sessionToken = 'judge_' + Date.now() + '_' + Math.random().toString(36);
        localStorage.setItem('judge_session_token', sessionToken);
        localStorage.setItem('judge_email', email);
        
        // Navigate to main app
        navigate('/', { replace: true, state: { user: { email } } });
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/60">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Code Mentor</h1>
          <p className="text-white/60">Gemini 3 Hackathon - Judge Access</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Judge Login</CardTitle>
            <CardDescription className="text-white/60">
              Sign in to access the demo application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJudgeLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="judge@gemini3hackathon.dev"
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-300 text-center">
                🏆 Hackathon Judges Access Only
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-6">
          Google DeepMind Gemini 3 Hackathon 2026
        </p>
      </div>
    </div>
  );
}
    return (
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
        <div className="text-zinc-400 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Checking authentication...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] text-zinc-100 flex items-center justify-center p-4">
      {/* Subtle texture overlay */}
      <div className="texture-noise" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-[#1f2022] bg-[#141416]/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <OpenClaw size={48} />
            </div>
            <CardTitle className="heading text-2xl font-semibold">
              OpenClaw Setup
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {instanceLock?.locked 
                ? 'This is a private instance. Only the owner can sign in.'
                : 'Sign in with Google to configure and access your personal OpenClaw instance.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {instanceLock?.locked ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-red-900/60 bg-red-950/40 text-red-300 px-4 py-4 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">Private Instance</span>
                  </div>
                  <p className="text-red-400/80">
                    This OpenClaw instance is private and access is restricted.
                  </p>
                </div>
                <button
                  onClick={handleLogin}
                  className="text-xs text-zinc-600 hover:text-zinc-400 underline underline-offset-2"
                >
                  Instance owner? Sign in here
                </button>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleLogin}
                  data-testid="google-login-button"
                  className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium h-12 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
                
                <p className="text-xs text-zinc-500 text-center">
                  Your OpenClaw instance will be private and only accessible by you.
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <p className="text-xs text-zinc-600 text-center mt-6">
          Powered by{' '}
          <a
            href="https://github.com/openclaw/openclaw"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-500 hover:text-zinc-400 underline underline-offset-2"
          >
            OpenClaw
          </a>
        </p>
      </motion.div>
    </div>
  );
}
