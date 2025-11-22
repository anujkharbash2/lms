import React, { useState, useEffect, useContext } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/admin';
const BASE_URL = 'https://lms-backend-sau.onrender.com/api/';
const API_URL = `${BASE_URL}/admin`;

const CourseManagement = () => {
    const { token } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    
    // Detailed Form State
    const [formData, setFormData] = useState({
        title: '', course_code: '', description: '', 
        credits: 3, semester: 1, program: '', 
        course_type: 'Core', dept_id: ''
    });

    // Fetch Courses AND Departments
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const [cRes, dRes] = await Promise.all([
                    axios.get(`${API_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/departments-list`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setCourses(cRes.data);
                setDepartments(dRes.data);
            } catch (error) { console.error(error); }
        };
        fetchData();
    }, [token]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/courses`, formData, { headers: { Authorization: `Bearer ${token}` } });
            alert('Course Created!');
            window.location.reload(); // Simple reload to refresh list
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Failed'));
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-6">Course Management</h1>

            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Add New Course</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                    
                    {/* Basic Info */}
                    <input name="title" placeholder="Course Title" onChange={handleChange} className="border p-2 rounded" required />
                    <input name="course_code" placeholder="Course Code (e.g. CS101)" onChange={handleChange} className="border p-2 rounded" required />
                    
                    {/* Academic Info */}
                    <input name="credits" type="number" placeholder="Credits" onChange={handleChange} className="border p-2 rounded" required />
                    <input name="semester" type="number" placeholder="Semester (1-8)" onChange={handleChange} className="border p-2 rounded" required />
                    
                    <input name="program" placeholder="Program (e.g. B.Tech CSE)" onChange={handleChange} className="border p-2 rounded" required />
                    
                    <select name="course_type" onChange={handleChange} className="border p-2 rounded">
                        <option value="Core">Core</option>
                        <option value="Elective">Elective</option>
                        <option value="Lab">Lab</option>
                    </select>

                    {/* Department Link */}
                    <select name="dept_id" onChange={handleChange} className="border p-2 rounded" required>
                        <option value="">-- Select Offering Department --</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <textarea name="description" placeholder="Description" onChange={handleChange} className="col-span-2 border p-2 rounded"></textarea>

                    <button className="col-span-2 bg-green-600 text-white py-2 rounded">Create Course</button>
                </form>
            </div>

            {/* List View */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Course List</h2>
                {courses.map(c => (
                    <div key={c.id} className="border-b p-3 flex justify-between">
                        <div>
                            <span className="font-bold">{c.course_code}: {c.title}</span>
                            <span className="text-sm text-gray-500 ml-2">({c.program}, Sem {c.semester})</span>
                        </div>
                        <span className="text-indigo-600 font-semibold">{c.dept_name}</span>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
};
export default CourseManagement;