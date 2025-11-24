import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Use the environment variable for production safety
const BASE_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-lyf8.onrender.com/api';
const API_URL = `${BASE_URL}/instructor`;

const InstructorCourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Forms State
    const [lessonForm, setLessonForm] = useState({ 
        title: '', content: '', sequence_order: '', category: 'Lecture Notes',
        external_link: '', file: null 
    });
    const [announcementForm, setAnnouncementForm] = useState({ 
        title: '', body: '',
        external_link: '', file: null 
    });
    
    // Student Modal State
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [studentList, setStudentList] = useState([]);
    
    const [message, setMessage] = useState({ type: '', text: '' });

    // Standard Styles (Preserved from your theme)
    const inputClass = "w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-500 hover:border-slate-300 shadow-sm focus:shadow-md ring-4 ring-transparent focus:ring-slate-100";
    const fileInputClass = "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200";
    const labelClass = "block mb-2 text-sm text-slate-600 font-semibold";
    const buttonClass = "rounded-md bg-slate-800 py-2.5 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";
    const secondaryButtonClass = "rounded-md bg-white py-2.5 px-4 border border-slate-200 text-center text-sm text-slate-600 transition-all shadow-sm hover:shadow-md hover:bg-slate-50 focus:shadow-none active:bg-slate-100";

    const fetchContent = useCallback(async () => {
        setLoading(true);
        try {
            const lessonRes = await axios.get(`${API_URL}/lessons/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLessons(lessonRes.data);
        } catch (error) {
            console.error('Failed to fetch content:', error);
            setMessage({ type: 'error', text: 'Failed to load content. Check if you are assigned to this course.' });
        } finally {
            setLoading(false);
        }
    }, [courseId, token]);

    useEffect(() => {
        if (token && courseId) {
            fetchContent();
        }
    }, [token, courseId, fetchContent]);

    // --- Fetch Students ---
    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${API_URL}/course/${courseId}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudentList(res.data);
            setShowStudentModal(true);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error fetching student list: ' + (error.response?.data?.message || 'Unknown error') });
        }
    };

    // Generic File Handler
    const handleFileChange = (e, setForm, form) => {
        setForm({ ...form, file: e.target.files[0] });
    };

    // --- 1. Lesson Submit (Using FormData) ---
    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        const formData = new FormData();
        formData.append('course_id', courseId);
        formData.append('title', lessonForm.title);
        formData.append('content', lessonForm.content);
        formData.append('sequence_order', lessonForm.sequence_order);
        formData.append('category', lessonForm.category);
        if (lessonForm.external_link) formData.append('external_link', lessonForm.external_link);
        if (lessonForm.file) formData.append('file', lessonForm.file);

        try {
            await axios.post(`${API_URL}/lessons`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ type: 'success', text: 'Lesson created successfully!' });
            setLessonForm({ title: '', content: '', sequence_order: '', category: 'Lecture Notes', external_link: '', file: null });
            // Reset file input manually if needed, usually react state handles it but file inputs are tricky
            fetchContent(); 
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error creating lesson.' });
        }
    };
    
    // --- 2. Announcement Submit (Using FormData) ---
    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('course_id', courseId);
        formData.append('title', announcementForm.title);
        formData.append('body', announcementForm.body);
        if (announcementForm.external_link) formData.append('external_link', announcementForm.external_link);
        if (announcementForm.file) formData.append('file', announcementForm.file);

        try {
            await axios.post(`${API_URL}/announcements`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ type: 'success', text: 'Announcement posted successfully!' });
            setAnnouncementForm({ title: '', body: '', external_link: '', file: null });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error posting announcement.' });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-slate-500 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mb-2"></div>
                Loading course details...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Manage Course</h1>
                        <p className="text-slate-600 font-light mt-1">Course ID: <span className="font-semibold">{courseId}</span></p>
                    </div>
                    <button onClick={fetchStudents} className={secondaryButtonClass}>
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            View Enrolled Students
                        </span>
                    </button>
                </div>

                {/* Notification */}
                {message.text && (
                    <div className={`p-4 mb-6 text-sm rounded-md border ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- COL 1: FORMS --- */}
                    <div className="lg:col-span-1 space-y-8">
                        
                        {/* Lesson Form */}
                        <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg">
                            <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                                <h5 className="text-slate-800 text-lg font-semibold flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    Create Lesson
                                </h5>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleLessonSubmit} className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Lesson Title</label>
                                        <input type="text" required value={lessonForm.title} onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})} className={inputClass} placeholder="e.g. Chapter 1" />
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-1">
                                            <label className={labelClass}>Seq</label>
                                            <input type="number" required value={lessonForm.sequence_order} onChange={(e) => setLessonForm({...lessonForm, sequence_order: e.target.value})} className={inputClass} placeholder="#" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelClass}>Category</label>
                                            <div className="relative">
                                                <select value={lessonForm.category} onChange={(e) => setLessonForm({...lessonForm, category: e.target.value})} className={inputClass}>
                                                    <option value="Lecture Notes">Lecture Notes</option>
                                                    <option value="Tutorial">Tutorial</option>
                                                    <option value="Exam Paper">Exam Paper</option>
                                                    <option value="Video">Video</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea placeholder="Content description..." required rows="3" value={lessonForm.content} onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})} className={inputClass} />
                                    </div>

                                    <div>
                                        <label className={labelClass}>External Link (Optional)</label>
                                        <input type="url" placeholder="https://" value={lessonForm.external_link} onChange={(e) => setLessonForm({...lessonForm, external_link: e.target.value})} className={inputClass} />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Upload File (Optional)</label>
                                        <input type="file" onChange={(e) => handleFileChange(e, setLessonForm, lessonForm)} className={fileInputClass} />
                                    </div>

                                    <button type="submit" className={buttonClass + " w-full"}>Add Lesson</button>
                                </form>
                            </div>
                        </div>

                        {/* Announcement Form */}
                        <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg">
                             <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                                <h5 className="text-slate-800 text-lg font-semibold flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                                    Announcement
                                </h5>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input type="text" required value={announcementForm.title} onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})} className={inputClass} placeholder="Update Title" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Message</label>
                                        <textarea placeholder="Write your announcement..." required rows="3" value={announcementForm.body} onChange={(e) => setAnnouncementForm({...announcementForm, body: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Link (Optional)</label>
                                        <input type="url" placeholder="https://" value={announcementForm.external_link} onChange={(e) => setAnnouncementForm({...announcementForm, external_link: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Attachment (Optional)</label>
                                        <input type="file" onChange={(e) => handleFileChange(e, setAnnouncementForm, announcementForm)} className={fileInputClass} />
                                    </div>
                                    <button type="submit" className={buttonClass + " w-full"}>Post Update</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* --- COL 2: LESSON LIST --- */}
                    <div className="lg:col-span-2">
                        <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg min-h-[500px]">
                            <div className="p-6 border-b border-slate-100">
                                <h5 className="text-slate-800 text-lg font-semibold">Course Content</h5>
                            </div>
                            <div className="p-6">
                                {lessons.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                        <p>No lessons created yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {lessons.map(lesson => (
                                            <div key={lesson.id} className="group relative flex flex-col bg-white border border-slate-100 rounded-lg p-4 hover:shadow-md hover:border-slate-200 transition-all">
                                                
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                                                            {lesson.sequence_order}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h6 className="text-slate-800 font-semibold text-base">{lesson.title}</h6>
                                                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full inline-block ${
                                                                    lesson.category === 'Video' ? 'bg-red-50 text-red-600' : 
                                                                    lesson.category === 'Exam Paper' ? 'bg-yellow-50 text-yellow-600' :
                                                                    'bg-indigo-50 text-indigo-600'
                                                                }`}>
                                                                    {lesson.category || 'Material'}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-500 text-sm mt-2">{lesson.content}</p>
                                                            
                                                            {/* Attachments & Links Display */}
                                                            <div className="flex gap-3 mt-3 text-sm">
                                                                {lesson.external_link && (
                                                                    <a href={lesson.external_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                                        External Link
                                                                    </a>
                                                                )}
                                                                {lesson.file_url && (
                                                                    <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${lesson.file_url}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                                        Download File
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            
                {/* --- ENROLLED STUDENTS MODAL --- */}
                {showStudentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-slate-900/50 backdrop-blur-sm">
                        <div className="relative w-full max-w-2xl mx-auto my-6">
                            <div className="border-0 rounded-lg shadow-xl relative flex flex-col w-full bg-white outline-none focus:outline-none max-h-[80vh]">
                                <div className="flex items-start justify-between p-5 border-b border-slate-100 rounded-t">
                                    <h3 className="text-xl font-semibold text-slate-800">Enrolled Students</h3>
                                    <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <div className="relative p-0 flex-auto overflow-y-auto">
                                    <table className="items-center w-full bg-transparent border-collapse">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-xs uppercase font-bold text-left text-slate-500">Name</th>
                                                <th className="px-6 py-3 text-xs uppercase font-bold text-left text-slate-500">Enrollment No</th>
                                                <th className="px-6 py-3 text-xs uppercase font-bold text-left text-slate-500">Email</th>
                                                <th className="px-6 py-3 text-xs uppercase font-bold text-left text-slate-500">Join Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentList.length === 0 ? (
                                                <tr><td colSpan="4" className="p-6 text-center text-slate-500">No students enrolled yet.</td></tr>
                                            ) : (
                                                studentList.map((s, i) => (
                                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{s.full_name}</td>
                                                        <td className="px-6 py-4 text-xs font-mono text-slate-600">{s.enrollment_number}</td>
                                                        <td className="px-6 py-4 text-sm text-indigo-600">{s.email}</td>
                                                        <td className="px-6 py-4 text-xs text-slate-500">
                                                            {new Date(s.enrolled_date).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-end p-4 border-t border-slate-100 rounded-b">
                                    <button onClick={() => setShowStudentModal(false)} className="bg-slate-800 text-white font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorCourseDetails;