import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- FIX 1: Import useNavigate
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/user';

const InstructorDashboard = () => {
    const { token, user, logout } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate(); // <--- FIX 1: Initialize useNavigate

    useEffect(() => {
        const fetchCourses = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/courses/instructor`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data);
            } catch (error) {
                console.error('Failed to fetch instructor courses:', error);
                // Handle token expiration/auth error if needed
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
                    Welcome, Instructor {user?.loginId}
                </h1>
                <button 
                    onClick={logout} 
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                >
                    Logout
                </button>
            </div>
            
            <h2 className="text-2xl font-semibold mb-6">Your Assigned Courses</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <p>Loading courses...</p>
                ) : courses.length === 0 ? (
                    <p className="text-gray-500">You have no courses assigned.</p>
                ) : (
                    courses.map(course => (
                        <div key={course.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-purple-500">
                            
                            {/* FIX 2: Correctly structure the clickable heading */}
                            <button 
                                onClick={() => navigate(`/instructor/course/${course.id}`)} 
                                className="text-left w-full block"
                            > 
                                <h3 className="text-xl font-bold mb-2 text-purple-700 hover:underline">
                                    {course.title} (ID: {course.id})
                                </h3>
                            </button>
                            
                            {/* Removed the redundant h3 tag */}
                            
                            <p className="text-gray-600 mb-3">{course.description}</p>
                            <p className="text-sm font-medium text-gray-800">
                                Total Enrolled Students: <span className="text-purple-600">{course.enrolled_students_count}</span>
                            </p>
                            {/* Future link to manage lessons/announcements */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
export default InstructorDashboard;