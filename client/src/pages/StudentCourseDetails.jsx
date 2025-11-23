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
    
    // New State for Category Menu
    const [selectedCategory, setSelectedCategory] = useState('All');

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

    // Icons
    const icons = {
        info: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        materials: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
        announcements: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
    };

    if (loading) return <StudentLayout><div className="p-8">Loading...</div></StudentLayout>;

    return (
        <StudentLayout>
            <div className="flex flex-col lg:flex-row h-full min-h-[85vh]">
                
                {/* --- MAIN LEFT SIDEBAR (Course Navigation) --- */}
                <div className="w-full lg:w-64 bg-white border-r border-gray-200 flex-shrink-0 p-4">
                    <div className="mb-6 p-3 bg-teal-50 rounded border border-teal-100">
                        <div className="text-xs font-bold text-teal-800 uppercase mb-1">{courseData?.course_code}</div>
                        <h2 className="text-sm font-bold text-gray-800 leading-tight">{courseData?.title}</h2>
                    </div>
                    
                    <nav className="space-y-1">
                        <button onClick={() => setActiveTab('info')} className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded transition ${activeTab === 'info' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {icons.info} Info & Instructor
                        </button>
                        <button onClick={() => setActiveTab('materials')} className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded transition ${activeTab === 'materials' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {icons.materials} Course Materials
                        </button>
                        <button onClick={() => setActiveTab('announcements')} className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded transition ${activeTab === 'announcements' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {icons.announcements} Announcements
                        </button>
                    </nav>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 bg-white p-6 lg:p-8">
                    
                    {/* TAB: MATERIALS (With Inner Category Menu) */}
                    {activeTab === 'materials' && (
                        <div className="flex flex-col md:flex-row h-full gap-6">
                            
                            {/* INNER SIDEBAR: Categories Menu */}
                            <div className="w-full md:w-48 flex-shrink-0">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Categories</h3>
                                <div className="space-y-1">
                                    {categories.map(cat => (
                                        <button 
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`w-full text-left px-3 py-2 text-sm rounded transition ${
                                                selectedCategory === cat 
                                                    ? 'bg-teal-100 text-teal-800 font-semibold' 
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* CONTENT LIST */}
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                    {selectedCategory === 'All' ? 'All Materials' : selectedCategory}
                                </h2>
                                
                                {filteredLessons.length === 0 ? (
                                    <p className="text-gray-500 italic mt-4">No materials found in this category.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {/* --- LESSON MAPPING START --- */}
                                        {filteredLessons.map(l => (
                                            <div key={l.id} className="group bg-white p-4 rounded-lg border border-gray-200 hover:border-teal-400 hover:shadow-sm transition">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-4 w-full">
                                                        {/* Sequence Badge */}
                                                        <span className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">
                                                            {l.sequence_order}
                                                        </span>
                                                        
                                                        {/* Content Block */}
                                                        <div className="w-full">
                                                            <div className="flex justify-between">
                                                                <h4 className="font-semibold text-gray-800 group-hover:text-teal-700">{l.title}</h4>
                                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded whitespace-nowrap ml-2">{l.category}</span>
                                                            </div>
                                                            
                                                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded border border-gray-100">
                                                                {l.content}
                                                            </p>

                                                            {/* --- LINKS & FILES SECTION --- */}
                                                            {(l.external_link || l.file_url) && (
                                                                <div className="mt-3 flex gap-3 text-sm border-t pt-2 border-gray-100">
                                                                    {l.external_link && (
                                                                        <a href={l.external_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                                            Open Link
                                                                        </a>
                                                                    )}
                                                                    {l.file_url && (
                                                                        <a href={`${BASE_URL.replace('/api', '')}${l.file_url}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1">
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                                            Download File
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* --- LESSON MAPPING END --- */}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: INFO */}
                    {activeTab === 'info' && courseData && (
                        <div className="max-w-3xl">
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">{courseData.title}</h1>
                            <p className="text-gray-600 mb-6 leading-relaxed">{courseData.description}</p>
                            
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    👨‍🏫 Instructor Profile
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-lg font-semibold text-indigo-700">{courseData.instructor_name}</p>
                                    <p className="text-sm text-gray-600">📧 {courseData.instructor_email}</p>
                                    <p className="text-sm text-gray-600">📍 {courseData.office_address}</p>
                                    {courseData.bio && <p className="text-sm text-gray-500 italic mt-2">"{courseData.bio}"</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: ANNOUNCEMENTS */}
                    {activeTab === 'announcements' && (
                        <div className="max-w-3xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Announcements</h2>
                            {announcements.length === 0 ? <p className="text-gray-500">No announcements.</p> : (
                                announcements.map(a => (
                                    <div key={a.id} className="mb-4 p-5 bg-yellow-50 border-l-4 border-yellow-400 rounded shadow-sm">
                                        <div className="flex justify-between mb-2">
                                            <h3 className="font-bold text-gray-800">{a.title}</h3>
                                            <span className="text-xs text-yellow-700">{new Date(a.posted_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-700">{a.body}</p>
                                        {/* Announcement Attachments */}
                                        {(a.external_link || a.file_url) && (
                                            <div className="mt-3 pt-2 border-t border-yellow-200 flex gap-4 text-sm">
                                                {a.external_link && <a href={a.external_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">🔗 Link</a>}
                                                {a.file_url && <a href={`${BASE_URL.replace('/api', '')}${a.file_url}`} target="_blank" rel="noreferrer" className="text-green-700 hover:underline">📄 Attachment</a>}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentCourseDetails;