import React, { useState, useEffect, useContext } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE_URL = 'https://lms-backend-lyf8.onrender.com/api';
const API_URL = `${BASE_URL}/admin`;

const UserManagement = () => {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedRole, setSelectedRole] = useState('Student');
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Define standard styles from your snippets to keep code clean
    const inputClass = "w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-500 hover:border-slate-300 shadow-sm focus:shadow-md ring-4 ring-transparent focus:ring-slate-100";
    const labelClass = "block mb-2 text-sm text-slate-600 font-semibold";
    const buttonClass = "rounded-md bg-slate-800 py-2.5 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

    // Fetch Users AND Departments
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const [userRes, deptRes] = await Promise.all([
                    axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/departments-list`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setUsers(userRes.data);
                setDepartments(deptRes.data);
            } catch (error) {
                console.error('Data fetch error', error);
            }
        };
        fetchData();
    }, [token]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(false);
        
        let endpoint = '/students';
        if (selectedRole === 'Instructor') endpoint = '/instructors';
        if (selectedRole === 'Dept_Admin') endpoint = '/dept-admins';

        try {
            await axios.post(`${API_URL}${endpoint}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`Success: ${selectedRole} created successfully!`);
            setIsSuccess(true);
            // Refresh User List
            const res = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
            // Optional: Clear form (reset logic could go here)
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.message || 'Failed to create user'}`);
            setIsSuccess(false);
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <AdminLayout>
            <div className="w-full max-w-6xl mx-auto">
                
                {/* Page Header */}
                <div className="mb-8">
                    <h5 className="text-slate-800 text-2xl font-bold">User Management</h5>
                    <p className="text-slate-600 font-light">Create new users and manage existing access.</p>
                </div>

                {/* 1. CREATE USER CARD */}
                <div className="relative flex flex-col mb-8 bg-white shadow-sm border border-slate-200 rounded-lg w-full">
                    <div className="p-6">
                        <h5 className="mb-4 text-slate-800 text-xl font-semibold border-b border-slate-100 pb-2">
                            Add New User
                        </h5>

                        {/* Notification Message */}
                        {message && (
                            <div className={`p-4 mb-4 text-sm rounded-md ${isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className={labelClass}>Select Role</label>
                            <div className="relative">
                                <select 
                                    className={inputClass}
                                    value={selectedRole} 
                                    onChange={e => setSelectedRole(e.target.value)}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Instructor">Instructor</option>
                                    <option value="Dept_Admin">Department Admin</option>
                                </select>
                            </div>
                        </div>

                        <form onSubmit={handleCreateUser}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Common Fields */}
                                <div>
                                    <label className={labelClass}>Password</label>
                                    <input 
                                        name="password" 
                                        type="password" 
                                        placeholder="Temporary Password" 
                                        onChange={handleInputChange} 
                                        className={inputClass} 
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Department</label>
                                    <select 
                                        name="dept_id" 
                                        onChange={handleInputChange} 
                                        className={inputClass} 
                                        required
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.length > 0 ? departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                                        )) : <option disabled>No Departments Found</option>}
                                    </select>
                                </div>

                                {/* Role Specific Fields */}
                                {selectedRole === 'Student' && (
                                    <>
                                        <div>
                                            <label className={labelClass}>Full Name</label>
                                            <input name="full_name" placeholder="John Doe" onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Program</label>
                                            <input name="program" placeholder="e.g. M.Sc Computer Science" onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Enrollment Number</label>
                                            <input name="enrollment_number" placeholder="e.g. 2024CS01" onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email</label>
                                            <input name="email" type="email" placeholder="student@sau.int" onChange={handleInputChange} className={inputClass} required />
                                        </div>
                                    </>
                                )}

                                {(selectedRole === 'Instructor' || selectedRole === 'Dept_Admin') && (
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Full Name</label>
                                        <input 
                                            name="name" 
                                            placeholder={selectedRole === 'Instructor' ? "Dr. Instructor Name" : "Admin Name"} 
                                            onChange={handleInputChange} 
                                            className={inputClass} 
                                            required 
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button type="submit" className={`${buttonClass} w-full md:w-auto`}>
                                    + Create {selectedRole.replace('_', ' ')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* 2. USERS LIST TABLE */}
                <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-full">
                    <div className="p-4 border-b border-slate-100">
                        <h5 className="text-slate-800 text-lg font-semibold">
                            Registered Users
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
                                        Department
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((u, index) => (
                                        <tr key={u.id} className={`hover:bg-slate-50 transition-colors duration-200 ${index !== users.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                            <td className="px-6 py-4 align-middle text-xs whitespace-nowrap text-left text-slate-700 font-medium">
                                                {u.login_id}
                                            </td>
                                            <td className="px-6 py-4 align-middle text-xs whitespace-nowrap text-left">
                                                <span className={`px-2 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wide ${
                                                    u.role === 'Student' ? 'bg-blue-50 text-blue-600' :
                                                    u.role === 'Instructor' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-purple-50 text-purple-600'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 align-middle text-sm whitespace-nowrap text-left text-slate-600">
                                                {u.name}
                                            </td>
                                            <td className="px-6 py-4 align-middle text-sm whitespace-nowrap text-left text-slate-500">
                                                {u.department_name || 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 text-sm">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default UserManagement;