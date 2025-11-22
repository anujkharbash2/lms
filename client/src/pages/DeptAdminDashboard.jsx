import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DeptAdminLayout from '../components/DeptAdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Use your API URL
const BASE_URL = 'https://lms-backend-lyf8.onrender.com/api';

const DeptAdminDashboard = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [deptInfo, setDeptInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/deptadmin/info`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDeptInfo(res.data);
            } catch (error) {
                console.error("Error fetching dept info:", error);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchInfo();
    }, [token]);

    const actions = [
        { title: "Manage Courses", desc: "Create and assign courses for your department.", link: "/deptadmin/courses", color: "border-blue-500" },
        { title: "Manage Users", desc: "Add Instructors and Students to your department.", link: "/deptadmin/users", color: "border-green-500" },
    ];

    return (
        <DeptAdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Department Overview</h1>
                {loading ? (
                    <p>Loading your department details...</p>
                ) : deptInfo ? (
                    <p className="text-gray-600 mt-2">
                        You are managing the <span className="font-bold text-indigo-700">{deptInfo.name}</span> ({deptInfo.type}).
                    </p>
                ) : (
                    <p className="text-red-500">Could not load department info.</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {actions.map((action, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => navigate(action.link)}
                        className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border-l-4 ${action.color}`}
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{action.title}</h3>
                        <p className="text-gray-600">{action.desc}</p>
                    </div>
                ))}
            </div>
        </DeptAdminLayout>
    );
};
export default DeptAdminDashboard;