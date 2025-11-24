import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SAULogo from '../assets/saulogo.png'; 
import BackgroundImage from '../assets/lms_bg.jpg';

const LoginPage = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useContext(AuthContext);
    const navigate = useNavigate();

    // Standardized Input Style (Matches Dashboards)
    const inputClass = "w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2.5 transition duration-300 ease focus:outline-none focus:border-slate-500 hover:border-slate-300 shadow-sm focus:shadow-md ring-4 ring-transparent focus:ring-slate-100";
    const labelClass = "block mb-2 text-sm text-slate-600 font-semibold";
    const buttonClass = "w-full rounded-md bg-slate-800 py-2.5 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const role = await login(loginId, password);
            
            // Redirect based on user role
            if (role === 'Main_Admin') {
                navigate('/admin/dashboard');
            } else if (role === 'Dept_Admin') {
                navigate('/deptadmin/dashboard');
            } else if (role === 'Instructor') {
                navigate('/instructor/dashboard');
            } else if (role === 'Student') {
                navigate('/student/dashboard');
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div> 
            
            {/* Login Card */}
            <div className="z-10 p-8 max-w-md w-full bg-white shadow-2xl rounded-xl border border-slate-200/50">
                
                {/* Header / Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-sm p-2">
                        <img src={SAULogo} alt="SAU Logo" className="h-full w-auto object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Welcome Back
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Sign in to access the LMS Portal
                    </p>
                </div>
                
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}
                
                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClass} htmlFor="loginId">
                            Login ID
                        </label>
                        <input
                            className={inputClass}
                            id="loginId"
                            type="text"
                            placeholder="Enter your 7-digit ID"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClass} htmlFor="password">
                            Password
                        </label>
                        <input
                            className={inputClass}
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="pt-2">
                        <button
                            className={buttonClass}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Authenticating...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                     <a href="#" className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-2 transition-colors">
                        Forgot your password?
                     </a>
                </div>
            </div>

            {/* Footer */}
            <footer className="z-10 absolute bottom-4 w-full text-center text-slate-400 text-xs font-medium">
                &copy; {new Date().getFullYear()} SAU Learning Management System
            </footer>
        </div>
    );
};

export default LoginPage;