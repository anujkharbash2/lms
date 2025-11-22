import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/instructor';
const BASE_URL = 'https://lms-backend-sau.onrender.com/api/';
const API_URL = `${BASE_URL}/instructor`;

const InstructorCourseDetails = () => {
    const { courseId } = useParams(); // Get course ID from URL
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext);
    
    const [lessons, setLessons] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lessonForm, setLessonForm] = useState({ title: '', content: '', sequence_order: '' });
    const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token && courseId) {
            fetchContent();
        }
    }, [token, courseId]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            // Fetch Lessons
            const lessonRes = await axios.get(`${API_URL}/lessons/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLessons(lessonRes.data);

            // Fetch Announcements (Note: We need to create a GET announcements endpoint later)
            // For now, let's skip announcement fetching until we create a GET route.
            
        } catch (error) {
            console.error('Failed to fetch course content:', error);
            setMessage('Failed to load content. Check if you are assigned to this course.');
            // navigate('/instructor/dashboard'); // Redirect on severe error
        } finally {
            setLoading(false);
        }
    };

    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await axios.post(`${API_URL}/lessons`, { ...lessonForm, course_id: courseId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Lesson created successfully!');
            setLessonForm({ title: '', content: '', sequence_order: '' });
            fetchContent(); // Refresh list
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error creating lesson.');
        }
    };
    
    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await axios.post(`${API_URL}/announcements`, { ...announcementForm, course_id: courseId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Announcement posted successfully!');
            setAnnouncementForm({ title: '', body: '' });
            // Re-fetch announcements (or just append locally for now)
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error posting announcement.');
        }
    };


    if (loading) return <div className="p-8">Loading course details...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Content for Course {courseId}</h1>
            <p className={`mb-4 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* --- Column 1: Create Lesson Form --- */}
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-indigo-600">Create New Lesson</h2>
                    <form onSubmit={handleLessonSubmit} className="space-y-4">
                        <input type="text" placeholder="Lesson Title" value={lessonForm.title} onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})} className="w-full p-2 border rounded" required />
                        <input type="number" placeholder="Order (e.g., 1, 2)" value={lessonForm.sequence_order} onChange={(e) => setLessonForm({...lessonForm, sequence_order: e.target.value})} className="w-full p-2 border rounded" required />
                        <textarea placeholder="Lesson Content (HTML/Text)" value={lessonForm.content} onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})} rows="5" className="w-full p-2 border rounded" required />
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Add Lesson</button>
                    </form>
                </div>

                {/* --- Column 2: Lesson List --- */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Existing Lessons</h2>
                    {lessons.length === 0 ? (
                        <p className="text-gray-500">No lessons created yet.</p>
                    ) : (
                        lessons.map(lesson => (
                            <div key={lesson.id} className="p-3 border-b flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <span className="font-bold text-lg mr-2">{lesson.sequence_order}.</span>
                                    <span className="text-lg">{lesson.title}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                    <button className="text-sm text-yellow-600 mr-2">Edit</button>
                                    <button className="text-sm text-red-600">Delete</button>
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* --- Announcement Form (Below Lessons) --- */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-indigo-600">Post Announcement</h2>
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    <input type="text" placeholder="Announcement Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})} className="w-full p-2 border rounded" required />
                    <textarea placeholder="Announcement Body" value={announcementForm.body} onChange={(e) => setAnnouncementForm({...announcementForm, body: e.target.value})} rows="3" className="w-full p-2 border rounded" required />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded">Post Announcement</button>
                </form>
            </div>
        </div>
    );
};
export default InstructorCourseDetails;