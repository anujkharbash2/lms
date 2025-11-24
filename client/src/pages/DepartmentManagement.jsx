import React, { useState, useContext } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = 'https://lms-backend-lyf8.onrender.com/api';
const API_URL = `${BASE_URL}/admin`;

const DepartmentManagement = () => {
    const { token } = useContext(AuthContext);
    
    // Forms State
    const [deptName, setDeptName] = useState('');
    const [deptType, setDeptType] = useState('Department');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Standard Styles matching your User Management page
    const inputClass = "w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-500 hover:border-slate-300 shadow-sm focus:shadow-md ring-4 ring-transparent focus:ring-slate-100";
    const labelClass = "block mb-2 text-sm text-slate-600 font-semibold";
    const buttonClass = "rounded-md bg-slate-800 py-2.5 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

    // Create Department Handler
    const handleCreateDept = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
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

    return (
        <AdminLayout>
            <div className="w-full max-w-6xl mx-auto">
                
                {/* Page Header */}
                <div className="mb-8">
                    <h5 className="text-slate-800 text-2xl font-bold">Departments & Faculties</h5>
                    <p className="text-slate-600 font-light">Manage university units and organizational structure.</p>
                </div>

                {/* Card: Create Department */}
                <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-full max-w-2xl mx-auto">
                    
                    {/* Card Header */}
                    <div className="p-6 border-b border-slate-100">
                        <h5 className="text-slate-800 text-xl font-semibold">
                            Create New Unit
                        </h5>
                    </div>

                    <div className="p-6">
                        {/* Notification Message */}
                        {message.text && (
                            <div className={`p-4 mb-6 text-sm rounded-md border ${
                                message.type === 'success' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleCreateDept} className="space-y-6">
                            <div>
                                <label className={labelClass}>Unit Name</label>
                                <input 
                                    type="text" 
                                    value={deptName}
                                    onChange={(e) => setDeptName(e.target.value)}
                                    placeholder="e.g. Computer Science" 
                                    className={inputClass}
                                    required 
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Unit Type</label>
                                <div className="relative">
                                    <select 
                                        value={deptType} 
                                        onChange={(e) => setDeptType(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="Department">Department</option>
                                        <option value="Faculty">Faculty</option>
                                        
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className={`w-full ${buttonClass}`}>
                                    + Create Unit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DepartmentManagement;