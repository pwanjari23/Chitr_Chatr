import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { User, Mail, Lock, UserPlus, Image, AlertCircle, MessageSquare, Sparkles } from 'lucide-react';

const RegisterPage = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations
    if (!name || !email || !password) {
      setErrorMsg('Please populate all required fields');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must contain at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password, profilePic);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMsg(result.message || 'Registration failed, please try again');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* Main Glassmorphic Register Container */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl z-10 flex flex-col">
        
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 mb-4 animate-bounce-dots">
            <MessageSquare className="w-7.5 h-7.5 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-1">
            Create an Account
            <Sparkles className="w-5 h-5 text-brand-500 animate-pulse fill-brand-500/10" />
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1.5 max-w-[260px]">
            Join ChitrChatr to enjoy lag-free real-time chats
          </p>
        </div>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 mb-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wide uppercase mb-1 ml-1">
              Full Name
            </label>
            <div className="relative flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-xl px-3 py-2.5 border border-transparent focus-within:border-brand-500/40 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
              <User className="w-4.5 h-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-450"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wide uppercase mb-1 ml-1">
              Email Address
            </label>
            <div className="relative flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-xl px-3 py-2.5 border border-transparent focus-within:border-brand-500/40 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
              <Mail className="w-4.5 h-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-450"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wide uppercase mb-1 ml-1">
              Password
            </label>
            <div className="relative flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-xl px-3 py-2.5 border border-transparent focus-within:border-brand-500/40 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
              <Lock className="w-4.5 h-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-450"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 tracking-wide uppercase mb-1 ml-1 flex justify-between items-center">
              <span>Profile Image URL</span>
              <span className="text-[10px] text-gray-400 font-medium normal-case">(Optional)</span>
            </label>
            <div className="relative flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-xl px-3 py-2.5 border border-transparent focus-within:border-brand-500/40 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
              <Image className="w-4.5 h-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                className="w-full text-sm bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-450"
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
                <UserPlus className="w-4.5 h-4.5" />
                <span>Create New Account</span>
              </>
            )}
          </button>
        </form>

        {/* Navigation Switch */}
        <div className="text-center mt-6 text-xs">
          <span className="text-gray-500 dark:text-slate-400">Already registered? </span>
          <Link
            to="/login"
            className="text-brand-500 hover:underline font-bold transition-all duration-150"
          >
            Log In
          </Link>
        </div>

      </div>

    </div>
  );
};

export default RegisterPage;
