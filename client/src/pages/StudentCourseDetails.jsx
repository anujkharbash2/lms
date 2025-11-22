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

    // ... (Keep your existing Categorized Lessons logic here) ...
    const categorizedLessons = {
        'Lecture Notes': lessons.filter(l => l.category === 'Lecture Notes'),
        'Tutorial': lessons.filter(l => l.category === 'Tutorial'),
        'Exam Paper': lessons.filter(l => l.category === 'Exam Paper'),
        'Video': lessons.filter(l => l.category === 'Video'),
        'Other': lessons.filter(l => !['Lecture Notes','Tutorial','Exam Paper','Video'].includes(l.category))
    };

    if (loading) return <StudentLayout><div className="p-8">Loading...</div></StudentLayout>;
    if (error) return <StudentLayout><div className="p-8 text-red-600">{error}</div></StudentLayout>;

    return (
        <StudentLayout>
            <div className="flex flex-col md:flex-row h-full min-h-screen">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-white border-r p-4">
                    <div className="mb-6 p-4 bg-teal-50 rounded border border-teal-100">
                        <h2 className="text-sm font-bold text-teal-800 uppercase tracking-wider">
                            {courseData?.course_code || 'Course'}
                        </h2>
                        <p className="text-xs text-teal-600 mt-1">{courseData?.title}</p>
                    </div>
                    <nav className="space-y-2">
                        <button onClick={() => setActiveTab('info')} className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'info' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>ℹ️ Info & Instructor</button>
                        <button onClick={() => setActiveTab('materials')} className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'materials' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>📚 Materials</button>
                        <button onClick={() => setActiveTab('announcements')} className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'announcements' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>📢 Announcements</button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 bg-gray-50">
                    {activeTab === 'info' && courseData && (
                        <div className="max-w-3xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{courseData.title}</h2>
                            <p className="text-gray-600 mb-4">{courseData.description}</p>
                            <div className="bg-white p-6 rounded shadow border-l-4 border-teal-500">
                                <h3 className="text-xl font-semibold text-gray-800">{courseData.instructor_name || 'Not Assigned'}</h3>
                                <p className="text-gray-700 mt-2">📧 {courseData.instructor_email}</p>
                                <p className="text-gray-700">📍 {courseData.office_address}</p>
                            </div>
                        </div>
                    )}
                    {/* Keep Materials and Announcement sections as they were */}
                    {activeTab === 'materials' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Materials</h2>
                            {Object.keys(categorizedLessons).map(cat => (
                                categorizedLessons[cat].length > 0 && (
                                    <div key={cat} className="mb-6">
                                        <h3 className="text-lg font-bold text-teal-800 border-b pb-2 mb-2">{cat}</h3>
                                        {categorizedLessons[cat].map(l => (
                                            <div key={l.id} className="bg-white p-3 rounded shadow-sm mb-2 border">
                                                <span className="font-bold">#{l.sequence_order}</span> {l.title}
                                                <p className="text-sm text-gray-600 ml-6">{l.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                    {activeTab === 'announcements' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Announcements</h2>
                            {announcements.map(a => (
                                <div key={a.id} className="bg-yellow-50 p-4 rounded border border-yellow-200 mb-3">
                                    <h3 className="font-bold">{a.title}</h3>
                                    <p>{a.body}</p>
                                    <p className="text-xs text-gray-500 mt-2">{new Date(a.posted_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
};
export default StudentCourseDetails;