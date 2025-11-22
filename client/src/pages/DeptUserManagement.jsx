import React, { useState, useEffect, useContext } from 'react';
import DeptAdminLayout from '../components/DeptAdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Use your API URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DeptUserManagement = () => {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('Student');
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');

    // Fetch Users for THIS Department only
    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/deptadmin/users`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('');
        
        let endpoint = '/deptadmin/users/student';
        if (selectedRole === 'Instructor') endpoint = '/deptadmin/users/instructor';

        try {
            // Note: We do NOT send dept_id. The backend injects it automatically.
            const res = await axios.post(`${BASE_URL}${endpoint}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage(`Success: User created with ID: ${res.data.loginId}`);
            setFormData({}); // Clear form
            fetchUsers(); // Refresh list
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.message || 'Failed'}`);
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <DeptAdminLayout>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Department Users</h1>
            
            {/* Create User Form */}
            <div className="bg-white p-6 rounded shadow mb-8 border-t-4 border-indigo-600">
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Add New Member</h2>
                {message && <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

                <div className="mb-4">
                    <label className="block font-bold mb-1">Role</label>
                    <select className="border p-2 rounded w-full" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                        <option value="Student">Student</option>
                        <option value="Instructor">Instructor</option>
                    </select>
                </div>

                <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
                    <input name="password" type="password" placeholder="Temporary Password" onChange={handleInputChange} className="border p-2 rounded" required />
                    
                    {/* Conditional Fields */}
                    {selectedRole === 'Student' && (
                        <>
                            <input name="full_name" placeholder="Full Name" onChange={handleInputChange} className="border p-2 rounded" required />
                            <input name="program" placeholder="Program (e.g. B.Tech)" onChange={handleInputChange} className="border p-2 rounded" required />
                            <input name="enrollment_number" placeholder="Enrollment No" onChange={handleInputChange} className="border p-2 rounded" required />
                            <input name="email" type="email" placeholder="Email" onChange={handleInputChange} className="border p-2 rounded" required />
                            <input name="branch" placeholder="Branch" onChange={handleInputChange} className="border p-2 rounded" />
                            <input name="section" placeholder="Section" onChange={handleInputChange} className="border p-2 rounded" />
                        </>
                    )}
                    {selectedRole === 'Instructor' && (
                        <>
                            <input name="name" placeholder="Instructor Name" onChange={handleInputChange} className="border p-2 rounded" required />
                            <input name="office_address" placeholder="Office Address" onChange={handleInputChange} className="border p-2 rounded" />
                        </>
                    )}

                    <button className="col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Create Member</button>
                </form>
            </div>

            {/* User List Table */}
            <div className="bg-white p-6 rounded shadow overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">Faculty & Students</h3>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3">ID</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Program/Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map(u => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-indigo-600">{u.login_id}</td>
                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${u.role === 'Student' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>{u.role}</span></td>
                                <td className="p-3">{u.name}</td>
                                <td className="p-3 text-sm text-gray-600">{u.program || u.email}</td>
                            </tr>
                        )) : <tr><td colSpan="4" className="p-4 text-center text-gray-500">No users found in your department.</td></tr>}
                    </tbody>
                </table>
            </div>
        </DeptAdminLayout>
    );
};
export default DeptUserManagement;