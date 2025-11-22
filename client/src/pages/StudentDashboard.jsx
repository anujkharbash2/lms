import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // CORRECTED: Import useNavigate
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/user';
//https://lms-backend-lyf8.onrender.com/

const BASE_URL = 'https://lms-backend-lyf8.onrender.com/api/';
const API_URL = `${BASE_URL}/user`;


const StudentDashboard = () => {
    const { token, user, logout } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate(); // CORRECTED: Initialize useNavigate

    useEffect(() => {
        const fetchCourses = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/courses/student`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data);
            } catch (error) {
                console.error('Failed to fetch student courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome, Student {user?.loginId}
                </h1>
                <button 
                    onClick={logout} 
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                >
                    Logout
                </button>
            </div>
            
            <h2 className="text-2xl font-semibold mb-6">Your Enrolled Courses</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <p>Loading courses...</p>
                ) : courses.length === 0 ? (
                    <p className="text-gray-500">You are not enrolled in any courses yet.</p>
                ) : (
                    courses.map(course => (
                        <div key={course.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-blue-500">
                            {/* Removed duplicate h3 tag */}
                            <button onClick={() => navigate(`/student/course/${course.id}`)} className="text-left w-full block">
                                <h3 className="text-xl font-bold mb-2 text-blue-700 hover:underline">
                                    {course.title}
                                </h3>
                            </button>
                            <p className="text-gray-600 mb-3 text-sm">{course.description}</p>
                            <p className="text-sm font-medium text-gray-800">
                                Instructor: <span className="text-blue-600">{course.instructor_name || 'Not Assigned'}</span>
                            </p>
                            {/* Future link to view content */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
export default StudentDashboard;