import React, { useState, useEffect, useContext, useCallback } from 'react';
import DeptAdminLayout from '../components/DeptAdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DeptUserManagement = () => {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('Student');
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    // Standard Styles
    const inputClass = "w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-500 hover:border-slate-300 shadow-sm focus:shadow-md ring-4 ring-transparent focus:ring-slate-100";
    const labelClass = "block mb-2 text-sm text-slate-600 font-semibold";
    const buttonClass = "rounded-md bg-slate-800 py-2.5 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

    // Fetch Users for THIS Department only
    const fetchUsers = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${BASE_URL}/deptadmin/users`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        let endpoint = '/deptadmin/users/student';
        if (selectedRole === 'Instructor') endpoint = '/deptadmin/users/instructor';

        try {
            const res = await axios.post(`${BASE_URL}${endpoint}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage({ type: 'success', text: `Success: User created with Login ID: ${res.data.loginId}` });
            setFormData({}); // Clear form
            fetchUsers(); // Refresh list
            
            // Optional: Reset form fields visually if they aren't controlled fully by state object keys
            e.target.reset(); 
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create user' });
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <DeptAdminLayout>
            <div className="w-full max-w-6xl mx-auto">
                
                {/* Page Header */}
                <div className="mb-8">
                    <h5 className="text-slate-800 text-2xl font-bold">My Department Users</h5>
                    <p className="text-slate-600 font-light">Manage faculty members and students within your unit.</p>
                </div>

                {/* CREATE USER CARD */}
                <div className="relative flex flex-col mb-8 bg-white shadow-sm border border-slate-200 rounded-lg w-full">
                    <div className="p-6 border-b border-slate-100">
                        <h5 className="text-slate-800 text-xl font-semibold">Add New Member</h5>
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

                        <div className="mb-6">
                            <label className={labelClass}>Select Role</label>
                            <div className="relative">
                                <select 
                                    className={inputClass} 
                                    value={selectedRole} 
                                    onChange={e => {
                                        setSelectedRole(e.target.value);
                                        setFormData({}); // Reset form data when switching roles
                                    }}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Instructor">Instructor</option>
                                </select>
                            </div>
                        </div>

                        <form onSubmit={handleCreateUser}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Common Field */}
                                <div>
                                    <label className={labelClass}>Temporary Password</label>
                                    <input 
                                        name="password" 
                                        type="password" 
                                        placeholder="••••••••" 
                                        onChange={handleInputChange} 
                                        className={inputClass} 
                                        required 
                                    />
                                </div>

                                {/* Student Specific Fields */}
                                {selectedRole === 'Student' && (
                                    <>
                                        <div>
                                            <label className={labelClass}>Full Name</label>
                                            <input name="full_name" placeholder="John Doe" onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Program</label>
                                            <input name="program" placeholder="e.g. B.Tech" onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Enrollment Number</label>
                                            <input name="enrollment_number" placeholder="e.g. 2023CS01" onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email</label>
                                            <input name="email" type="email" placeholder="student@sau.int" onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Branch (Optional)</label>
                                            <input name="branch" placeholder="e.g. CSE" onChange={handleInputChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Section (Optional)</label>
                                            <input name="section" placeholder="e.g. A" onChange={handleInputChange} className={inputClass} />
                                        </div>
                                    </>
                                )}

                                {/* Instructor Specific Fields */}
                                {selectedRole === 'Instructor' && (
                                    <>
                                        <div>
                                            <label className={labelClass}>Instructor Name</label>
                                            <input name="name" placeholder="Dr. Jane Smith" onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Office Address</label>
                                            <input name="office_address" placeholder="Room 304, Science Block" onChange={handleInputChange} className={inputClass} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button type="submit" className={`${buttonClass} w-full md:w-auto`}>
                                    + Create {selectedRole}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* USER LIST TABLE */}
                <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-full">
                    <div className="p-4 border-b border-slate-100">
                        <h5 className="text-slate-800 text-lg font-semibold">
                            Faculty & Students List
                        </h5>
                    </div>
                    <div className="block w-full overflow-x-auto">
                        <table className="items-center w-full bg-transparent border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-bold text-left bg-slate-50 text-slate-500 border-slate-100">
                                        Login ID
                                    </th>
                                    <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-bold text-left bg-slate-50 text-slate-500 border-slate-100">
                                        Role
                                    </th>
                                    <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-bold text-left bg-slate-50 text-slate-500 border-slate-100">
                                        Name
                                    </th>
                                    <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-bold text-left bg-slate-50 text-slate-500 border-slate-100">
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((u, index) => (
                                        <tr key={u.id} className={`hover:bg-slate-50 transition-colors duration-200 ${index !== users.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                            <td className="px-6 py-4 align-middle text-xs whitespace-nowrap text-left font-mono text-slate-600">
                                                {u.login_id}
                                            </td>
                                            <td className="px-6 py-4 align-middle text-xs whitespace-nowrap text-left">
                                                <span className={`px-2 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wide ${
                                                    u.role === 'Student' 
                                                        ? 'bg-green-50 text-green-600' 
                                                        : 'bg-purple-50 text-purple-600'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 align-middle text-sm whitespace-nowrap text-left text-slate-700 font-medium">
                                                {u.name}
                                            </td>
                                            <td className="px-6 py-4 align-middle text-sm whitespace-nowrap text-left text-slate-500">
                                                {u.role === 'Student' ? (
                                                    <span>{u.program} <span className="text-slate-300 mx-1">|</span> {u.email}</span>
                                                ) : (
                                                    <span>{u.office_address || 'No Office Assigned'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-500 text-sm">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                No users found in your department.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DeptAdminLayout>
    );
};

export default DeptUserManagement;