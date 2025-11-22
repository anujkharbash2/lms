import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = 'https://lms-backend-lyf8.onrender.com/api';
const API_URL = `${BASE_URL}/user`;

const InstructorDashboard = () => {
    const { token, user, logout } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/courses/instructor`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data);
            } catch (error) {
                console.error('Failed to fetch instructor courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="w-full max-w-6xl mx-auto">
                
                {/* Top Navigation Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-200 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                             
                            Instructor Portal
                        </h1>
                        <p className="text-slate-500 mt-1 font-light">
                            Welcome back, <span className="font-semibold text-slate-800">{user?.loginId}</span>.
                        </p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Logout
                    </button>
                </div>
                
                {/* Content Area */}
                <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10"></path></svg>
                        Your Assigned Courses
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                            <p className="mt-2 text-slate-500">Loading your curriculum...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="bg-white p-10 rounded-lg shadow-sm border border-slate-200 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No Courses Assigned</h3>
                            <p className="text-slate-500 mt-1">You haven't been assigned any courses yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => (
                                <div 
                                    key={course.id} 
                                    onClick={() => navigate(`/instructor/course/${course.id}`)}
                                    className="group relative flex flex-col bg-white shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-lg transition-all cursor-pointer h-full overflow-hidden"
                                >
                                    {/* Card Top Decoration */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                                    <div className="p-6 flex flex-col h-full">
                                        {/* Header: Code & ID */}
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                ID: {course.id}
                                            </span>
                                            <span className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">
                                            {course.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                                            {course.description || "No description available."}
                                        </p>

                                        {/* Footer: Stats */}
                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center text-sm text-slate-600">
                                                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                                <span className="font-medium mr-1">{course.enrolled_students_count}</span> Students
                                            </div>
                                            <span className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Manage Course →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;