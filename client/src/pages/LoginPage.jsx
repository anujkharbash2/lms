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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const role = await login(loginId, password);
            
            // Redirect based on user role upon successful login
            if (role === 'Main_Admin') {
                navigate('/admin/dashboard');
            } else if (role === 'Dept_Admin') {
                navigate('/deptadmin/dashboard');
            } else if (role === 'Instructor') {
                navigate('/instructor/dashboard');
            } 
            else if (role === 'Student') {
                navigate('/student/dashboard');
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        // --- 1. Main Wrapper with Background ---
        <div 
            className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${BackgroundImage})` }} // <-- USE INLINE STYLE HERE
        >
            {/* Overlay to improve readability */}
            <div className="absolute inset-0 bg-black opacity-40"></div> 
            
            {/* Login Box (z-10 ensures it's above the overlay) */}
            <div className="z-10 p-8 max-w-md w-full bg-white bg-opacity-95 shadow-2xl rounded-xl backdrop-blur-sm">
                
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src={SAULogo} alt="SAU Logo" className="h-20 w-auto" />
                </div>
                
                <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
                    LMS Sign In
                </h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm" role="alert">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="loginId">
                            Login ID
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            id="loginId"
                            type="text"
                            placeholder="7-Digit ID"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            id="password"
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-center pt-2">
                        <button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- 2. Fixed Footer --- */}
            <footer className="z-10 absolute bottom-0 w-full p-3 bg-gray-900 bg-opacity-70 text-center text-gray-300 text-sm">
                &copy; {new Date().getFullYear()} Learning Management System | Powered by SAU IT
            </footer>
        </div>
    );
};
export default LoginPage;