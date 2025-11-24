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
    
    // Category Filter State
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Standard Styles
    const tabButtonClass = (isActive) => `w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${isActive ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`;
    const categoryButtonClass = (isActive) => `w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`;

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
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        if (token && courseId) fetchData();
    }, [token, courseId]);

    // Get Unique Categories for the Menu
    const categories = ['All', ...new Set(lessons.map(l => l.category || 'Other'))];

    // Filter Lessons based on selection
    const filteredLessons = selectedCategory === 'All' 
        ? lessons 
        : lessons.filter(l => (l.category || 'Other') === selectedCategory);

    // Sorting: Ensure lessons are in sequence
    filteredLessons.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));

    if (loading) return (
        <StudentLayout>
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading course content...</p>
                </div>
            </div>
        </StudentLayout>
    );

    if (error) return (
        <StudentLayout>
            <div className="p-8">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
                    <p className="font-bold">Error Loading Course</p>
                    <p>{error}</p>
                </div>
            </div>
        </StudentLayout>
    );

    return (
        <StudentLayout>
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
                
                {/* --- MAIN LEFT SIDEBAR (Navigation) --- */}
                <div className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-shrink-0 z-10">
                    <div className="p-6 border-b border-slate-100">
                        <div className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded uppercase tracking-wide mb-2">
                            {courseData?.course_code}
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">
                            {courseData?.title}
                        </h2>
                    </div>
                    
                    <nav className="p-4 space-y-1">
                        <button onClick={() => setActiveTab('info')} className={tabButtonClass(activeTab === 'info')}>
                            {icons.info} Info & Instructor
                        </button>
                        <button onClick={() => setActiveTab('materials')} className={tabButtonClass(activeTab === 'materials')}>
                            {icons.materials} Course Materials
                        </button>
                        <button onClick={() => setActiveTab('announcements')} className={tabButtonClass(activeTab === 'announcements')}>
                            {icons.announcements} Announcements
                            {announcements.length > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {announcements.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
                        
                        {/* TAB 1: INFO */}
                        {activeTab === 'info' && courseData && (
                            <div className="animate-fadeIn">
                                <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 mb-8">
                                    <h1 className="text-3xl font-bold text-slate-800 mb-4">{courseData.title}</h1>
                                    <p className="text-slate-600 leading-relaxed text-lg">{courseData.description}</p>
                                    
                                    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="font-semibold text-slate-800">Semester:</span> {courseData.semester}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="font-semibold text-slate-800">Credits:</span> {courseData.credits}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="font-semibold text-slate-800">Program:</span> {courseData.program}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="font-semibold text-slate-800">Type:</span> {courseData.course_type}
                                        </div>
                                    </div>
                                </div>

                                {/* Instructor Card */}
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                           Instructor Profile
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="text-xl font-bold text-slate-800 mb-1">{courseData.instructor_name || 'Not Assigned'}</h4>
                                        <div className="space-y-2 mt-4">
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                </div>
                                                {courseData.Bio || 'Faculty at SAU'}
                                            </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                </div>
                                                {courseData.instructor_email || 'No Email'}
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                </div>
                                                {courseData.office_address || 'No Office Listed'}
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                </div>
                                                 {courseData.website ? (
    <a 
      href={courseData.website} 
      target="_blank" 
      rel="noopener noreferrer"
      className="underline hover:text-blue-600"
    >
      {courseData.website}
    </a>
  ) : (
    'NA'
  )}
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: MATERIALS (With Categories) */}
                        {activeTab === 'materials' && (
                            <div className="animate-fadeIn flex flex-col md:flex-row gap-8 h-full">
                                
                                {/* Category Sidebar */}
                                <div className="w-full md:w-56 flex-shrink-0">
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sticky top-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                                            Filter Content
                                        </h3>
                                        <div className="space-y-1">
                                            {categories.map(cat => (
                                                <button 
                                                    key={cat}
                                                    onClick={() => setSelectedCategory(cat)}
                                                    className={categoryButtonClass(selectedCategory === cat)}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Content List */}
                                <div className="flex-1 min-h-[400px]">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-800">
                                            {selectedCategory === 'All' ? 'All Learning Materials' : `${selectedCategory}s`}
                                        </h2>
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                            {filteredLessons.length} items
                                        </span>
                                    </div>

                                    {filteredLessons.length === 0 ? (
                                        <div className="bg-white p-12 text-center rounded-lg border border-dashed border-slate-300">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-4">
                                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            </div>
                                            <p className="text-slate-500">No materials found for this category.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredLessons.map(l => (
                                                <div key={l.id} className="group bg-white rounded-lg border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                                                    <div className="flex items-start gap-4">
                                                        {/* Badge */}
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                            {l.sequence_order}
                                                        </div>
                                                        
                                                        <div className="flex-grow">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                                <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                                    {l.title}
                                                                </h4>
                                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border self-start sm:self-auto ${
                                                                    l.category === 'Video' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                    l.category === 'Exam Paper' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                                }`}>
                                                                    {l.category || 'General'}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap bg-slate-50/50 p-3 rounded-md border border-slate-100">
                                                                {l.content}
                                                            </div>

                                                            {/* Links / Files */}
                                                            {(l.external_link || l.file_url) && (
                                                                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
                                                                    {l.external_link && (
                                                                        <a href={l.external_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                                            Open Link
                                                                        </a>
                                                                    )}
                                                                    {l.file_url && (
                                                                        <a href={`${BASE_URL.replace('/api', '')}${l.file_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors bg-emerald-50 px-3 py-1.5 rounded hover:bg-emerald-100">
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                                            Download File
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: ANNOUNCEMENTS */}
                        {activeTab === 'announcements' && (
                            <div className="animate-fadeIn max-w-4xl mx-auto">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Course Announcements</h2>
                                {announcements.length === 0 ? (
                                    <div className="bg-white p-8 rounded border border-dashed border-slate-300 text-center text-slate-500">
                                        No announcements posted yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {announcements.map(a => (
                                            <div key={a.id} className="bg-white rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-amber-400 p-6 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-bold text-slate-800">{a.title}</h3>
                                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                        {new Date(a.posted_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                    {a.body}
                                                </p>
                                                
                                                {/* Attachments for Announcements */}
                                                {(a.external_link || a.file_url) && (
                                                    <div className="mt-4 flex flex-wrap gap-3 pt-3 border-t border-slate-100">
                                                        {a.external_link && (
                                                            <a href={a.external_link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                                                Attached Link
                                                            </a>
                                                        )}
                                                        {a.file_url && (
                                                            <a href={`${BASE_URL.replace('/api', '')}${a.file_url}`} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                                Attached File
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentCourseDetails;