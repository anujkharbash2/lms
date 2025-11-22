import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-lyf8.onrender.com/api';

const StudentDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${BASE_URL}/user/courses/student`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [token]);

    return (
        <StudentLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, <span className="font-semibold text-teal-600">{user?.loginId}</span>.</p>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading your courses...</div>
            ) : (
                <>
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Enrolled Courses</h2>
                    
                    {courses.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                            You are not enrolled in any courses yet. Please contact your Department Admin.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => (
                                <div 
                                    key={course.id} 
                                    onClick={() => navigate(`/student/course/${course.id}`)}
                                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-teal-500 group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-1 rounded">
                                            {course.course_code || 'COURSE'}
                                        </span>
                                        <span className="text-gray-400 group-hover:text-teal-600">↗</span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-700">
                                        {course.title}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                        {course.description || 'No description available.'}
                                    </p>
                                    
                                    <div className="border-t pt-3 flex items-center text-sm text-gray-500">
                                        <span className="mr-2">👨‍🏫</span>
                                        {course.instructor_name || 'Instructor not assigned'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </StudentLayout>
    );
};

export default StudentDashboard;