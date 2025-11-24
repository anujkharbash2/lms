import React, { useState, useEffect, useContext, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = 'https://lms-backend-lyf8.onrender.com/api';
const API_URL = `${BASE_URL}/admin`;

const CourseManagement = () => {
    const { token } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Standard Styles
    const inputClass = "w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-500 hover:border-slate-300 shadow-sm focus:shadow-md ring-4 ring-transparent focus:ring-slate-100";
    const labelClass = "block mb-2 text-sm text-slate-600 font-semibold";
    const buttonClass = "rounded-md bg-slate-800 py-2.5 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

    // Form State
    const initialFormState = {
        title: '', course_code: '', description: '', 
        credits: 3, semester: 1, program: '', 
        course_type: 'Core', dept_id: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // Fetch Data Function
    const fetchData = useCallback(async () => {
        if (!token) return;
        try {
            const [cRes, dRes] = await Promise.all([
                axios.get(`${API_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/departments-list`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setCourses(cRes.data);
            setDepartments(dRes.data);
        } catch (error) { console.error(error); }
    }, [token]);

    // Initial Load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        try {
            await axios.post(`${API_URL}/courses`, formData, { headers: { Authorization: `Bearer ${token}` } });
            setMessage({ type: 'success', text: 'Course created successfully!' });
            setFormData(initialFormState); // Reset form
            fetchData(); // Refresh list without reload
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create course' });
        }
    };

    return (
        <AdminLayout>
            <div className="w-full max-w-6xl mx-auto">
                
                {/* Page Header */}
                <div className="mb-8">
                    <h5 className="text-slate-800 text-2xl font-bold">Course Management</h5>
                    <p className="text-slate-600 font-light">Create and manage academic courses.</p>
                </div>

                {/* CREATE COURSE CARD */}
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
                                
                                {/* Basic Info */}
                                <div>
                                    <label className={labelClass}>Course Title</label>
                                    <input 
                                        name="title" 
                                        value={formData.title}
                                        placeholder="e.g. Data Structures" 
                                        onChange={handleChange} 
                                        className={inputClass} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Course Code</label>
                                    <input 
                                        name="course_code" 
                                        value={formData.course_code}
                                        placeholder="e.g. CS101" 
                                        onChange={handleChange} 
                                        className={inputClass} 
                                        required 
                                    />
                                </div>
                                
                                {/* Academic Info */}
                                <div>
                                    <label className={labelClass}>Credits</label>
                                    <input 
                                        name="credits" 
                                        type="number" 
                                        value={formData.credits}
                                        onChange={handleChange} 
                                        className={inputClass} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Semester</label>
                                    <input 
                                        name="semester" 
                                        type="number" 
                                        value={formData.semester}
                                        placeholder="1-8" 
                                        onChange={handleChange} 
                                        className={inputClass} 
                                        required 
                                    />
                                </div>
                                
                                <div>
                                    <label className={labelClass}>Program</label>
                                    <input 
                                        name="program" 
                                        value={formData.program}
                                        placeholder="e.g. B.Tech CSE" 
                                        onChange={handleChange} 
                                        className={inputClass} 
                                        required 
                                    />
                                </div>
                                
                                <div>
                                    <label className={labelClass}>Course Type</label>
                                    <div className="relative">
                                        <select 
                                            name="course_type" 
                                            value={formData.course_type}
                                            onChange={handleChange} 
                                            className={inputClass}
                                        >
                                            <option value="Core">Core</option>
                                            <option value="Elective">Elective</option>
                                            <option value="Lab">Lab</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Department Link */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Offering Department</label>
                                    <div className="relative">
                                        <select 
                                            name="dept_id" 
                                            value={formData.dept_id}
                                            onChange={handleChange} 
                                            className={inputClass} 
                                            required
                                        >
                                            <option value="">-- Select Department --</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Description</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description}
                                        placeholder="Brief description of the course..." 
                                        onChange={handleChange} 
                                        className={inputClass}
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-6 text-right">
                                <button type="submit" className={buttonClass}>
                                    + Create Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* COURSE LIST */}
                <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-full">
                    <div className="p-4 border-b border-slate-100">
                        <h5 className="text-slate-800 text-lg font-semibold">Existing Courses</h5>
                    </div>
                    
                    <div className="block w-full overflow-x-auto">
                        <div className="flex flex-col">
                            {courses.length > 0 ? courses.map((c, index) => (
                                <div 
                                    key={c.id} 
                                    className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 hover:bg-slate-50 transition-colors ${index !== courses.length - 1 ? 'border-b border-slate-100' : ''}`}
                                >
                                    <div className="flex items-start gap-4 mb-2 md:mb-0">
                                        {/* Badge */}
                                        <div className="flex-shrink-0">
                                            <span className="inline-block bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">
                                                {c.course_code}
                                            </span>
                                        </div>
                                        {/* Details */}
                                        <div>
                                            <h6 className="text-slate-800 font-semibold text-sm">{c.title}</h6>
                                            <p className="text-slate-500 text-xs mt-1">
                                                {c.program} • Sem {c.semester} • <span className="text-indigo-600">{c.course_type}</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Right Side Dept Info */}
                                    <div className="text-right pl-12 md:pl-0">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            {c.dept_name}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    No courses found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default CourseManagement;