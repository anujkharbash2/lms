import React, { useState, useEffect, useContext } from 'react';
import DeptAdminLayout from '../components/DeptAdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DeptCourseManagement = () => {
    const { token } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    
    // Lists for Dropdowns
    const [instructors, setInstructors] = useState([]);
    const [students, setStudents] = useState([]);
    
    // Modals State
    const [activeModal, setActiveModal] = useState(null); // 'instructor' or 'student' or null
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('');

    // Course Form State
    const [formData, setFormData] = useState({
        title: '', course_code: '', description: '', 
        credits: 3, semester: 1, program: '', course_type: 'Core'
    });

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const [courseRes, userRes] = await Promise.all([
                    axios.get(`${BASE_URL}/deptadmin/courses`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BASE_URL}/deptadmin/users`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                setCourses(courseRes.data);
                
                // Separate Instructors and Students
                setInstructors(userRes.data.filter(u => u.role === 'Instructor'));
                setStudents(userRes.data.filter(u => u.role === 'Student'));

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [token]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Create Course
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE_URL}/deptadmin/courses`, formData, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            alert('Course Created!');
            window.location.reload(); 
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Failed'));
        }
    };

    // Open Modal Helper
    const openModal = (type, course) => {
        setActiveModal(type);
        setSelectedCourse(course);
        setSelectedUserId('');
    };

    // Handle Assignment (Instructor OR Student)
    const handleSubmitAssignment = async () => {
        if (!selectedUserId) return alert('Please select a user');
        
        try {
            let endpoint = '';
            let payload = {};

            // Find user object to get Login ID
            const userObj = [...instructors, ...students].find(u => u.id == selectedUserId);

            if (activeModal === 'instructor') {
                endpoint = '/deptadmin/courses/assign-instructor';
                payload = { course_id: selectedCourse.id, instructor_login_id: userObj.login_id };
            } else {
                endpoint = '/deptadmin/courses/enroll';
                payload = { course_id: selectedCourse.id, student_login_id: userObj.login_id };
            }
            
            await axios.post(`${BASE_URL}${endpoint}`, payload, { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            alert(`${activeModal === 'instructor' ? 'Instructor assigned' : 'Student enrolled'} successfully!`);
            setActiveModal(null);
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Failed'));
        }
    };

    return (
        <DeptAdminLayout>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Department Courses</h1>

            {/* Creation Form */}
            <div className="bg-white p-6 rounded shadow mb-8 border-t-4 border-blue-600">
                <h2 className="text-xl font-bold mb-4 text-blue-700">Add New Course</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                    <input name="title" placeholder="Course Title" onChange={handleChange} className="border p-2 rounded" required />
                    <input name="course_code" placeholder="Code (e.g. CS102)" onChange={handleChange} className="border p-2 rounded" required />
                    <input name="credits" type="number" placeholder="Credits" onChange={handleChange} className="border p-2 rounded" required />
                    <input name="semester" type="number" placeholder="Semester" onChange={handleChange} className="border p-2 rounded" required />
                    <input name="program" placeholder="Program (e.g. M.Tech)" onChange={handleChange} className="border p-2 rounded" required />
                    <select name="course_type" onChange={handleChange} className="border p-2 rounded">
                        <option value="Core">Core</option>
                        <option value="Elective">Elective</option>
                        <option value="Lab">Lab</option>
                    </select>
                    <textarea name="description" placeholder="Description" onChange={handleChange} className="col-span-2 border p-2 rounded"></textarea>
                    <button className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Create Course</button>
                </form>
            </div>

            {/* Course List */}
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-semibold mb-4">Current Curriculum</h3>
                {courses.length === 0 ? <p className="text-gray-500">No courses defined yet.</p> : (
                    <div className="space-y-3">
                        {courses.map(c => (
                            <div key={c.id} className="border p-4 rounded flex flex-col md:flex-row justify-between items-center hover:bg-gray-50">
                                <div className="mb-2 md:mb-0">
                                    <span className="font-bold text-lg text-gray-800">{c.course_code}</span>
                                    <span className="mx-2 text-gray-400">|</span>
                                    <span className="font-medium">{c.title}</span>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {c.program}, Sem {c.semester}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openModal('instructor', c)}
                                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-semibold hover:bg-purple-200"
                                    >
                                        + Instructor
                                    </button>
                                    <button 
                                        onClick={() => openModal('student', c)}
                                        className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold hover:bg-green-200"
                                    >
                                        + Student
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- UNIVERSAL MODAL --- */}
            {activeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-bold mb-4">
                            {activeModal === 'instructor' ? 'Assign Instructor' : 'Enroll Student'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Select for <span className="font-semibold">{selectedCourse?.title}</span>.
                        </p>
                        
                        <select 
                            className="w-full border p-2 rounded mb-4"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">-- Select User --</option>
                            {/* Dynamically render list based on modal type */}
                            {(activeModal === 'instructor' ? instructors : students).map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.login_id})
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                            <button onClick={handleSubmitAssignment} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </DeptAdminLayout>
    );
};
export default DeptCourseManagement;