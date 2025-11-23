import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorLayout from '../components/InstructorLayout'; // <-- NEW LAYOUT
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-lyf8.onrender.com/api';

const InstructorDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${BASE_URL}/user/courses/instructor`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data);
            } catch (error) {
                console.error('Failed to fetch instructor courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [token]);

    return (
        <InstructorLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome, <span className="font-semibold text-purple-600">{user?.name}</span>.</p>
            </div>
            
            {loading ? (
                <div className="text-center py-10">Loading courses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.length === 0 ? <p>No courses assigned.</p> : courses.map(course => (
                        <div key={course.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-t-4 border-purple-500">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded">
                                    {course.course_code || 'COURSE'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                            <button 
                                onClick={() => navigate(`/instructor/course/${course.id}`)} 
                                className="w-full bg-gray-50 text-gray-700 py-2 rounded hover:bg-purple-50 hover:text-purple-700 font-medium border border-gray-200"
                            >
                                Manage Course &rarr;
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </InstructorLayout>
    );
};
export default InstructorDashboard;