import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-lyf8.onrender.com/api';

const StudentDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${BASE_URL}/user/courses/student`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [token]);

    return (
        <StudentLayout>
            <div className="w-full max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-8">
                    <h5 className="text-slate-800 text-2xl font-bold">My Dashboard</h5>
                    <p className="text-slate-600 font-light">
                        Welcome back, <span className="font-semibold text-slate-800">{user?.loginId}</span>. Here are your enrolled courses.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                        <p className="mt-2 text-slate-500">Loading your courses...</p>
                    </div>
                ) : (
                    <>
                        {courses.length === 0 ? (
                            <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-full p-10 text-center items-center justify-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h6 className="text-slate-800 text-lg font-semibold">No Courses Found</h6>
                                <p className="text-slate-500 mt-1 max-w-md">
                                    You are not enrolled in any courses yet. Please contact your Department Admin for enrollment.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <div 
                                        key={course.id} 
                                        onClick={() => navigate(`/student/course/${course.id}`)}
                                        className="relative flex flex-col bg-white shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-lg transition-all cursor-pointer h-full group"
                                    >
                                        <div className="p-5 flex flex-col h-full">
                                            
                                            {/* Card Header: Code & Arrow */}
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600 tracking-wider">
                                                    {course.course_code || 'COURSE'}
                                                </span>
                                                <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h5 className="mb-2 text-slate-800 text-xl font-semibold group-hover:text-blue-700 transition-colors">
                                                {course.title}
                                            </h5>

                                            {/* Description */}
                                            <p className="text-slate-600 leading-relaxed font-light text-sm mb-6 flex-grow line-clamp-3">
                                                {course.description || 'No description provided for this course.'}
                                            </p>

                                            {/* Footer: Instructor Info */}
                                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-slate-500 text-sm">
                                                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="truncate">
                                                    {course.instructor_name || 'Instructor not assigned'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;