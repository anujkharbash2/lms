import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-lg">
        
        {/* Icon / Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-slate-200 rounded-full opacity-20 blur-2xl"></div>
            <svg className="relative w-32 h-32 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>

        {/* Typography */}
        <h1 className="text-6xl font-extrabold text-slate-800 mb-2 tracking-tight">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto rounded-md border border-slate-300 py-2.5 px-6 text-center text-sm text-slate-600 transition-all hover:bg-white hover:border-slate-400 hover:shadow-sm focus:shadow-none active:bg-slate-50"
          >
            Go Back
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto rounded-md bg-slate-800 py-2.5 px-6 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none"
          >
            Go to Login / Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;