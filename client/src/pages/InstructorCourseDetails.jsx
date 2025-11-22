import React, { useState, useEffect, useContext } from 'react';
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
    
    // Forms
    const [lessonForm, setLessonForm] = useState({ 
        title: '', content: '', sequence_order: '', category: 'Lecture Notes' 
    });
    const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });
    
    // Student Modal State
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [studentList, setStudentList] = useState([]);
    
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token && courseId) {
            fetchContent();
        }
    }, [token, courseId]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const lessonRes = await axios.get(`${API_URL}/lessons/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLessons(lessonRes.data);
        } catch (error) {
            console.error('Failed to fetch content:', error);
            setMessage('Failed to load content. Check if you are assigned to this course.');
        } finally {
            setLoading(false);
        }
    };

    // --- NEW: Fetch Students ---
    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${API_URL}/course/${courseId}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudentList(res.data);
            setShowStudentModal(true);
        } catch (error) {
            alert('Error fetching student list: ' + (error.response?.data?.message || 'Unknown error'));
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
            setLessonForm({ title: '', content: '', sequence_order: '', category: 'Lecture Notes' });
            fetchContent(); 
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
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error posting announcement.');
        }
    };

    if (loading) return <div className="p-8 text-gray-600">Loading course details...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Header with Student View Button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Course {courseId}</h1>
                <button 
                    onClick={fetchStudents}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow transition"
                >
                    👥 View Enrolled Students
                </button>
            </div>

            <p className={`mb-4 p-2 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} ${!message && 'hidden'}`}>
                {message}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* --- Column 1: Create Lesson Form (Updated with Category) --- */}
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit border-t-4 border-indigo-600">
                    <h2 className="text-xl font-semibold mb-4 text-indigo-700">Create New Lesson</h2>
                    <form onSubmit={handleLessonSubmit} className="space-y-4">
                        <input 
                            type="text" placeholder="Lesson Title" required
                            value={lessonForm.title} 
                            onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})} 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none" 
                        />
                        
                        <div className="flex gap-2">
                            <input 
                                type="number" placeholder="Seq" required
                                value={lessonForm.sequence_order} 
                                onChange={(e) => setLessonForm({...lessonForm, sequence_order: e.target.value})} 
                                className="w-1/3 p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none" 
                            />
                            <select 
                                value={lessonForm.category}
                                onChange={(e) => setLessonForm({...lessonForm, category: e.target.value})}
                                className="w-2/3 p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none"
                            >
                                <option value="Lecture Notes">Lecture Notes</option>
                                <option value="Tutorial">Tutorial</option>
                                <option value="Exam Paper">Exam Paper</option>
                                <option value="Video">Video</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <textarea 
                            placeholder="Content / URL / Description" required rows="5"
                            value={lessonForm.content} 
                            onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})} 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none" 
                        />
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold transition">
                            Add Lesson
                        </button>
                    </form>
                </div>

                {/* --- Column 2: Lesson List --- */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-600">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Existing Lessons</h2>
                    {lessons.length === 0 ? (
                        <p className="text-gray-500 italic">No lessons created yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {lessons.map(lesson => (
                                <div key={lesson.id} className="p-4 border rounded flex justify-between items-center hover:bg-gray-50 transition">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-600 text-lg">#{lesson.sequence_order}</span>
                                            <span className="text-lg font-semibold text-gray-800">{lesson.title}</span>
                                        </div>
                                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded mt-1 inline-block">
                                            {lesson.category || 'Other'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="text-sm text-yellow-600 hover:text-yellow-800">Edit</button>
                                        <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* --- Announcement Form --- */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-600">
                <h2 className="text-xl font-semibold mb-4 text-purple-700">Post Announcement</h2>
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    <input 
                        type="text" placeholder="Announcement Title" required
                        value={announcementForm.title} 
                        onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 outline-none" 
                    />
                    <textarea 
                        placeholder="Announcement Body" required rows="3"
                        value={announcementForm.body} 
                        onChange={(e) => setAnnouncementForm({...announcementForm, body: e.target.value})} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 outline-none" 
                    />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded font-semibold transition">
                        Post Announcement
                    </button>
                </form>
            </div>

            {/* --- ENROLLED STUDENTS MODAL --- */}
            {showStudentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-2xl font-bold text-gray-800">Enrolled Students</h3>
                            <button onClick={() => setShowStudentModal(false)} className="text-gray-500 hover:text-red-600 text-2xl">&times;</button>
                        </div>
                        
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-3 border-b font-semibold text-gray-700">Name</th>
                                        <th className="p-3 border-b font-semibold text-gray-700">Enrollment No</th>
                                        <th className="p-3 border-b font-semibold text-gray-700">Email</th>
                                        <th className="p-3 border-b font-semibold text-gray-700">Join Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentList.length === 0 ? (
                                        <tr><td colSpan="4" className="p-4 text-center text-gray-500">No students enrolled yet.</td></tr>
                                    ) : (
                                        studentList.map((s, i) => (
                                            <tr key={i} className="border-b hover:bg-gray-50">
                                                <td className="p-3">{s.full_name}</td>
                                                <td className="p-3 font-mono text-sm">{s.enrollment_number}</td>
                                                <td className="p-3 text-blue-600">{s.email}</td>
                                                <td className="p-3 text-gray-500 text-sm">
                                                    {new Date(s.enrolled_date).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-4 text-right">
                            <button 
                                onClick={() => setShowStudentModal(false)} 
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorCourseDetails;