import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DeptAdminLayout from '../components/DeptAdminLayout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

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
        { 
            title: "Manage Courses", 
            desc: "Create, edit, and assign courses for your department.", 
            link: "/deptadmin/courses",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            )
        },
        { 
            title: "Manage Faculty & Students", 
            desc: "Oversee instructors and students enrolled in your unit.", 
            link: "/deptadmin/users",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
            )
        },
    ];

    return (
        <DeptAdminLayout>
            <div className="w-full max-w-6xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-8">
                    <h5 className="text-slate-800 text-2xl font-bold">Department Overview</h5>
                    
                    {loading ? (
                        <div className="flex items-center mt-2 text-slate-500">
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500 mr-2"></div>
                             Loading details...
                        </div>
                    ) : deptInfo ? (
                        <p className="text-slate-600 font-light mt-1">
                            You are managing the <span className="font-semibold text-slate-800">{deptInfo.name}</span> ({deptInfo.type}).
                        </p>
                    ) : (
                        <div className="mt-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm inline-block">
                            Could not load department information.
                        </div>
                    )}
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {actions.map((action, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => navigate(action.link)}
                            className="relative flex flex-col bg-white shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-lg transition-all cursor-pointer p-6 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                {/* Icon Box */}
                                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-slate-800 shadow-md group-hover:scale-105 transition-transform duration-300">
                                    {action.icon}
                                </div>
                                {/* Arrow Icon */}
                                <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                            
                            <h5 className="mb-2 text-slate-800 text-xl font-semibold group-hover:text-indigo-700 transition-colors">
                                {action.title}
                            </h5>
                            <p className="text-slate-600 font-light leading-normal text-sm">
                                {action.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Optional: Quick Stats Placeholder */}
                {deptInfo && (
                    <div className="mt-8 relative flex flex-col min-w-0 break-words bg-white w-full shadow-sm rounded-lg border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h6 className="text-slate-800 text-lg font-semibold">Department Status</h6>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center p-4 border border-slate-100 rounded-lg bg-slate-50 max-w-sm">
                                <div className="p-2 bg-emerald-100 rounded-full mr-3">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">System Access</p>
                                    <p className="text-sm font-semibold text-slate-700">Active & Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DeptAdminLayout>
    );
};

export default DeptAdminDashboard;