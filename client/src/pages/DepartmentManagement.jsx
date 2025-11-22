import React, { useState, useContext } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

const DepartmentManagement = () => {
    const { token } = useContext(AuthContext);
    
    // Forms State
    const [deptName, setDeptName] = useState('');
    const [deptType, setDeptType] = useState('Department');
    
    const [assignLoginId, setAssignLoginId] = useState('');
    const [assignDeptId, setAssignDeptId] = useState('');
    
    const [message, setMessage] = useState({ type: '', text: '' });

    // 1. Create Department
    const handleCreateDept = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/departments`, 
                { name: deptName, type: deptType }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: `Success: ${res.data.message} (ID: ${res.data.deptId})` });
            setDeptName('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Creation failed' });
        }
    };

    // 2. Assign Dept Admin
    const handleAssignAdmin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/departments/assign-admin`, 
                { login_id: assignLoginId, dept_id: assignDeptId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: res.data.message });
            setAssignLoginId('');
            setAssignDeptId('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Assignment failed' });
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Departments & Faculties</h1>
            
            {message.text && (
                <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* --- Card 1: Create Department --- */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-semibold text-indigo-600 mb-4">1. Create New Unit</h2>
                    <form onSubmit={handleCreateDept} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input 
                                type="text" 
                                value={deptName}
                                onChange={(e) => setDeptName(e.target.value)}
                                placeholder="e.g. Computer Science" 
                                className="w-full p-2 border rounded mt-1"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select 
                                value={deptType} 
                                onChange={(e) => setDeptType(e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                            >
                                <option value="Department">Department</option>
                                <option value="Faculty">Faculty</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                            Create Unit
                        </button>
                    </form>
                </div>

                {/* --- Card 2: Assign Admin --- */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-semibold text-purple-600 mb-4">2. Assign Dept Admin</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Note: You must first create a user with the role <strong>Dept_Admin</strong> in the "User Management" tab.
                    </p>
                    <form onSubmit={handleAssignAdmin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dept Admin Login ID</label>
                            <input 
                                type="text" 
                                value={assignLoginId}
                                onChange={(e) => setAssignLoginId(e.target.value)}
                                placeholder="e.g. 7654321" 
                                className="w-full p-2 border rounded mt-1"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department ID</label>
                            <input 
                                type="number" 
                                value={assignDeptId}
                                onChange={(e) => setAssignDeptId(e.target.value)}
                                placeholder="ID from creation step" 
                                className="w-full p-2 border rounded mt-1"
                                required 
                            />
                        </div>
                        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                            Assign Admin
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DepartmentManagement;