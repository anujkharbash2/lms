import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// NOTE: We will use the Instructor's GET lessons endpoint for now, 
// as Student viewing permissions are implicit.
// const API_URL_LESSONS = 'http://localhost:5000/api/instructor/lessons'; 
// const API_URL = 'http://localhost:5000/api/user/content';
const BASE_URL = 'https://lms-backend-sau.onrender.com/api/';
const API_URL = `${BASE_URL}/user/content`;
const API_URL_LESSONS = `${BASE_URL}/instructor/lessons`;




const StudentCourseDetails = () => {
    const { courseId } = useParams();
    const { token, user } = useContext(AuthContext);
    
    const [lessons, setLessons] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token && courseId) {
            fetchContent();
        }
    }, [token, courseId]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            // 1. Fetch Lessons (Secure Endpoint)
            const lessonRes = await axios.get(`${API_URL}/lessons/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLessons(lessonRes.data);

            // 2. Fetch Announcements (Secure Endpoint)
            const announcementRes = await axios.get(`${API_URL}/announcements/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(announcementRes.data);

        } catch (error) {
            console.error('Failed to fetch course content:', error);
            // Updated error message to reflect the security check failure
            setMessage(error.response?.data?.message || 'Failed to load content. You may not be enrolled.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading course content...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Course Viewer: Course ID {courseId}</h1>
            <p className="text-lg mb-4">{message}</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* --- Announcements Column --- */}
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit border-t-4 border-red-500">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Announcements ({announcements.length})</h2>
        {announcements.length === 0 ? (
            <p className="text-gray-500">No new announcements.</p>
        ) : (
            announcements.map((ann, index) => (
                <div key={index} className="mb-3 border-b pb-2">
                    <p className="font-semibold text-gray-800">{ann.title}</p>
                    <p className="text-sm text-gray-600">{ann.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Posted by {ann.instructor_name} on {new Date(ann.posted_at).toLocaleDateString()}
                    </p>
                </div>
            ))
        )}
    </div>

                {/* --- Lessons Column --- */}
                <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Lessons ({lessons.length})</h2>
                    {lessons.length === 0 ? (
                        <p className="text-gray-500">No course material available yet.</p>
                    ) : (
                        lessons.map(lesson => (
                            <div key={lesson.id} className="mb-4 p-4 border rounded-lg hover:bg-gray-50">
                                <h3 className="font-bold text-xl text-indigo-700 mb-2">
                                    {lesson.sequence_order}. {lesson.title}
                                </h3>
                                <div className="text-gray-700 border-l-4 pl-3 mt-2">
                                    {lesson.content} 
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
export default StudentCourseDetails;