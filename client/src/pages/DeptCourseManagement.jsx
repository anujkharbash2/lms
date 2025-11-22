import React, { useState, useEffect, useContext, useCallback } from 'react';
import DeptAdminLayout from '../components/DeptAdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-lyf8.onrender.com/api';

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
    const [message, setMessage] = useState({ type: '', text: '' });

    // Standard Styles
    const inputClass = "w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-500 hover:border-slate-300 shadow-sm focus:shadow-md ring-4 ring-transparent focus:ring-slate-100";
    const labelClass = "block mb-2 text-sm text-slate-600 font-semibold";
    const buttonClass = "rounded-md bg-slate-800 py-2.5 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

    // Course Form State
    const initialFormState = {
        title: '', course_code: '', description: '', 
        credits: 3, semester: 1, program: '', course_type: 'Core'
    };
    const [formData, setFormData] = useState(initialFormState);

    // 1. Fetch Data
    const fetchData = useCallback(async () => {
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
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Create Course
    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            await axios.post(`${BASE_URL}/deptadmin/courses`, formData, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setMessage({ type: 'success', text: 'Course Created Successfully!' });
            setFormData(initialFormState);
            fetchData(); // Refresh list without reload
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create course' });
        }
    };

    // Open Modal Helper
    const openModal = (type, course) => {
        setActiveModal(type);
        setSelectedCourse(course);
        setSelectedUserId('');
    };

    // Handle Assignment
    const handleSubmitAssignment = async () => {
        if (!selectedUserId) return alert('Please select a user');
        
        try {
            let endpoint = '';
            let payload = {};

            // Find user object
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
            <div className="w-full max-w-6xl mx-auto">
                
                {/* Page Header */}
                <div className="mb-8">
                    <h5 className="text-slate-800 text-2xl font-bold">Manage Department Courses</h5>
                    <p className="text-slate-600 font-light">Create curriculum and assign faculty to courses.</p>
                </div>

                {/* CREATION FORM CARD */}
                <div className="relative flex flex-col mb-8 bg-white shadow-sm border border-slate-200 rounded-lg w-full">
                    <div className="p-6 border-b border-slate-100">
                        <h5 className="text-slate-800 text-xl font-semibold">Add New Course</h5>
                    </div>
                    
                    <div className="p-6">
                        {/* Message Alert */}
                        {message.text && (
                            <div className={`p-4 mb-6 text-sm rounded-md border ${
                                message.type === 'success' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleCreate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Course Title</label>
                                    <input name="title" value={formData.title} placeholder="e.g. Advanced Algorithms" onChange={handleChange} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Course Code</label>
                                    <input name="course_code" value={formData.course_code} placeholder="e.g. CS102" onChange={handleChange} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Credits</label>
                                    <input name="credits" type="number" value={formData.credits} onChange={handleChange} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Semester</label>
                                    <input name="semester" type="number" value={formData.semester} onChange={handleChange} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Program</label>
                                    <input name="program" value={formData.program} placeholder="e.g. M.Tech" onChange={handleChange} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Course Type</label>
                                    <div className="relative">
                                        <select name="course_type" value={formData.course_type} onChange={handleChange} className={inputClass}>
                                            <option value="Core">Core</option>
                                            <option value="Elective">Elective</option>
                                            <option value="Lab">Lab</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Description</label>
                                    <textarea name="description" value={formData.description} rows="3" placeholder="Course description..." onChange={handleChange} className={inputClass}></textarea>
                                </div>
                            </div>
                            <div className="mt-6 text-right">
                                <button type="submit" className={buttonClass}>+ Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* COURSE LIST */}
                <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-full">
                    <div className="p-4 border-b border-slate-100">
                        <h5 className="text-slate-800 text-lg font-semibold">Current Curriculum</h5>
                    </div>
                    
                    <div className="block w-full overflow-x-auto">
                        {courses.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No courses defined yet.</div>
                        ) : (
                            <div className="flex flex-col">
                                {courses.map((c, index) => (
                                    <div key={c.id} className={`flex flex-col md:flex-row justify-between items-center p-4 hover:bg-slate-50 transition-colors ${index !== courses.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                        
                                        {/* Course Info */}
                                        <div className="flex items-start gap-4 mb-4 md:mb-0 w-full md:w-auto">
                                            <div className="flex-shrink-0 mt-1">
                                                <span className="inline-block bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">
                                                    {c.course_code}
                                                </span>
                                            </div>
                                            <div>
                                                <h6 className="text-slate-800 font-semibold text-base">{c.title}</h6>
                                                <p className="text-slate-500 text-xs mt-1">
                                                    {c.program} • Sem {c.semester} • <span className="text-slate-700 font-medium">{c.course_type}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 w-full md:w-auto justify-end">
                                            <button 
                                                onClick={() => openModal('instructor', c)}
                                                className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md text-xs font-bold uppercase hover:bg-indigo-100 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                Assign Instructor
                                            </button>
                                            <button 
                                                onClick={() => openModal('student', c)}
                                                className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-md text-xs font-bold uppercase hover:bg-emerald-100 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                                                Enroll Student
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- UNIVERSAL MODAL --- */}
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-slate-900/50 backdrop-blur-sm">
                        <div className="relative w-full max-w-md mx-auto my-6">
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                
                                {/* Modal Header */}
                                <div className="flex items-start justify-between p-5 border-b border-slate-100 rounded-t">
                                    <h3 className="text-xl font-semibold text-slate-800">
                                        {activeModal === 'instructor' ? 'Assign Instructor' : 'Enroll Student'}
                                    </h3>
                                    <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold uppercase text-sm outline-none focus:outline-none">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                
                                {/* Modal Body */}
                                <div className="relative p-6 flex-auto">
                                    <p className="my-2 text-slate-500 text-sm leading-relaxed mb-4">
                                        Select a user to assign to <span className="font-bold text-slate-700">{selectedCourse?.title}</span> ({selectedCourse?.course_code}).
                                    </p>
                                    
                                    <label className={labelClass}>Select {activeModal === 'instructor' ? 'Instructor' : 'Student'}</label>
                                    <div className="relative">
                                        <select 
                                            className={inputClass}
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(e.target.value)}
                                        >
                                            <option value="">-- Choose User --</option>
                                            {(activeModal === 'instructor' ? instructors : students).map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name} ({u.login_id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex items-center justify-end p-4 border-t border-slate-100 rounded-b gap-3">
                                    <button 
                                        className="text-slate-500 background-transparent font-bold uppercase px-6 py-2 text-xs outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 hover:text-slate-700" 
                                        type="button" 
                                        onClick={() => setActiveModal(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="bg-slate-800 text-white active:bg-slate-600 font-bold uppercase text-xs px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" 
                                        type="button" 
                                        onClick={handleSubmitAssignment}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DeptAdminLayout>
    );
};

export default DeptCourseManagement;