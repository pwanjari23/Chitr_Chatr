import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Mail, Lock, LogIn, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMsg(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* Main Glassmorphic Login Container */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl z-10 flex flex-col">
        
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 mb-4">
            <MessageSquare className="w-7.5 h-7.5 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-1">
            Welcome to ChitrChatr
            <Sparkles className="w-5 h-5 text-brand-500 animate-pulse fill-brand-500/10" />
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1.5 max-w-[260px]">
            Log in to connect with friends instantly in real time
          </p>
        </div>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 mb-5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wide uppercase mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-xl px-3 py-3 border border-transparent focus-within:border-brand-500/40 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
              <Mail className="w-4.5 h-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wide uppercase mb-1.5 ml-1">
              Password
            </label>
            <div className="relative flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-xl px-3 py-3 border border-transparent focus-within:border-brand-500/40 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
              <Lock className="w-4.5 h-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm shadow-xl shadow-brand-500/15 hover:shadow-brand-500/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-gray-300 dark:disabled:bg-slate-800 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4.5 h-4.5" />
                <span>Log In Session</span>
              </>
            )}
          </button>
        </form>

        {/* Navigation Switch */}
        <div className="text-center mt-8 text-xs">
          <span className="text-gray-500 dark:text-slate-400">New user here? </span>
          <Link
            to="/register"
            className="text-brand-500 hover:underline font-bold transition-all duration-150"
          >
            Create an Account
          </Link>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
