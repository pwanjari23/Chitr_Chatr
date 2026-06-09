import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Sparkles } from 'lucide-react';

const ProtectedRoutes = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <Sparkles className="absolute w-6 h-6 text-brand-500 animate-pulse" />
        </div>
        <h4 className="font-bold text-gray-700 dark:text-gray-200 tracking-wide text-sm">Securing Session...</h4>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
