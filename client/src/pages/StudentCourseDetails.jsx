import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-lyf8.onrender.com/api';

const StudentCourseDetails = () => {
    const { courseId } = useParams();
    const { token } = useContext(AuthContext);
    
    const [activeTab, setActiveTab] = useState('info');
    const [courseData, setCourseData] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Icons
    const icons = {
        info: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        materials: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
        announcements: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [infoRes, lessRes, annRes] = await Promise.all([
                    axios.get(`${BASE_URL}/user/content/course/${courseId}/details`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BASE_URL}/user/content/lessons/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BASE_URL}/user/content/announcements/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                setCourseData(infoRes.data);
                setLessons(lessRes.data);
                setAnnouncements(annRes.data);
            } catch (err) { 
                console.error(err);
                setError('Failed to load data. Ensure backend is running.');
            } finally { 
                setLoading(false); 
            }
        };
        if (token && courseId) fetchData();
    }, [token, courseId]);

    // Categorize Lessons
    const categorizedLessons = {
        'Lecture Notes': lessons.filter(l => l.category === 'Lecture Notes'),
        'Video': lessons.filter(l => l.category === 'Video'),
        'Tutorial': lessons.filter(l => l.category === 'Tutorial'),
        'Exam Paper': lessons.filter(l => l.category === 'Exam Paper'),
        'Other': lessons.filter(l => !['Lecture Notes','Tutorial','Exam Paper','Video'].includes(l.category))
    };

    if (loading) return (
        <StudentLayout>
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mb-4"></div>
                    <p className="text-slate-500">Loading course content...</p>
                </div>
            </div>
        </StudentLayout>
    );

    if (error) return (
        <StudentLayout>
            <div className="p-8">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        </StudentLayout>
    );

    return (
        <StudentLayout>
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
                
                {/* --- LEFT SIDEBAR (Navigation) --- */}
                <div className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-shrink-0">
                    <div className="p-6 border-b border-slate-100">
                        <div className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded uppercase tracking-wide mb-2">
                            {courseData?.course_code}
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">
                            {courseData?.title}
                        </h2>
                    </div>
                    
                    <nav className="p-4 space-y-1">
                        <button 
                            onClick={() => setActiveTab('info')} 
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                                activeTab === 'info' 
                                    ? 'bg-slate-800 text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            {icons.info}
                            Info & Instructor
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('materials')} 
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                                activeTab === 'materials' 
                                    ? 'bg-slate-800 text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            {icons.materials}
                            Course Materials
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('announcements')} 
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                                activeTab === 'announcements' 
                                    ? 'bg-slate-800 text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            {icons.announcements}
                            Announcements
                            {announcements.length > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {announcements.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        
                        {/* 1. INFO TAB */}
                        {activeTab === 'info' && courseData && (
                            <div className="animate-fadeIn">
                                <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 mb-8">
                                    <h1 className="text-3xl font-bold text-slate-800 mb-4">{courseData.title}</h1>
                                    <p className="text-slate-600 leading-relaxed text-lg">{courseData.description}</p>
                                    
                                    <div className="mt-6 flex items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-4">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Semester {courseData.semester}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                            Credits: {courseData.credits}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                        <h3 className="font-semibold text-slate-800">Instructor Details</h3>
                                    </div>
                                    <div className="p-6 flex items-start gap-4">
                                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-2xl shadow-inner">
                                            👨‍🏫
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-800">{courseData.instructor_name || 'Not Assigned'}</h4>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-slate-600 flex items-center gap-2 text-sm">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                    {courseData.instructor_email || 'No Email'}
                                                </p>
                                                <p className="text-slate-600 flex items-center gap-2 text-sm">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                    {courseData.office_address || 'No Office Listed'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. MATERIALS TAB */}
                        {activeTab === 'materials' && (
                            <div className="animate-fadeIn space-y-8">
                                <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                                    <h2 className="text-2xl font-bold text-slate-800">Learning Materials</h2>
                                </div>

                                {Object.keys(categorizedLessons).map(cat => (
                                    categorizedLessons[cat].length > 0 && (
                                        <div key={cat}>
                                            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4">{cat}</h3>
                                            <div className="grid gap-4">
                                                {categorizedLessons[cat].map(l => (
                                                    <div key={l.id} className="group bg-white p-5 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                                                        <div className="flex items-start gap-4">
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                                                                {l.sequence_order}
                                                            </div>
                                                            <div className="flex-grow">
                                                                <h4 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                                    {l.title}
                                                                </h4>
                                                                <div className="mt-2 text-slate-600 text-sm bg-slate-50 p-3 rounded border border-slate-100 font-mono whitespace-pre-wrap">
                                                                    {l.content}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                                {lessons.length === 0 && (
                                    <p className="text-center text-slate-500 py-10 italic">No materials uploaded yet.</p>
                                )}
                            </div>
                        )}

                        {/* 3. ANNOUNCEMENTS TAB */}
                        {activeTab === 'announcements' && (
                            <div className="animate-fadeIn">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Announcements</h2>
                                
                                <div className="space-y-4">
                                    {announcements.length === 0 ? (
                                        <div className="bg-white p-8 rounded border border-dashed border-slate-300 text-center text-slate-500">
                                            No announcements posted for this course.
                                        </div>
                                    ) : (
                                        announcements.map(a => (
                                            <div key={a.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-indigo-500">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-bold text-slate-800">{a.title}</h3>
                                                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                        {new Date(a.posted_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed">
                                                    {a.body}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentCourseDetails;