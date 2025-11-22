import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Configuration for the Dashboard Cards
  const adminActions = [
    { 
      title: "Departments & Faculties", 
      description: "Create units and assign Department Admins.", 
      link: "/admin/departments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
        </svg>
      )
    },
    { 
      title: "User Management", 
      description: "Register Students, Instructors, and Staff.", 
      link: "/admin/users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      )
    },
    { 
      title: "Course Management", 
      description: "Create courses, assign codes, and credits.", 
      link: "/admin/courses",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Header / Welcome Section */}
        <div className="mb-8">
            <h5 className="text-slate-800 text-2xl font-bold">Dashboard Overview</h5>
            <p className="text-slate-600 font-light mt-1">
                Welcome back, <span className="font-semibold text-slate-800">{user?.loginId || 'Admin'}</span>. 
                Manage the university system below.
            </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {adminActions.map((action, index) => (
            <div 
                key={index}
                onClick={() => navigate(action.link)}
                className="relative flex flex-col bg-white shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-lg transition-all cursor-pointer p-6 group"
            >
                <div className="flex justify-between items-start mb-4">
                    {/* Icon Box - Dark Slate Background */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-md bg-slate-800 shadow-md group-hover:scale-105 transition-transform duration-300">
                        {action.icon}
                    </div>
                    {/* Arrow Icon */}
                    <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                </div>
                
                <h5 className="mb-2 text-slate-800 text-xl font-semibold group-hover:text-slate-600 transition-colors">
                {action.title}
                </h5>
                <p className="text-slate-600 font-light leading-normal text-sm">
                {action.description}
                </p>
            </div>
            ))}
        </div>

        {/* System Information / Static Panel */}
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full shadow-sm rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
                <h6 className="text-slate-800 text-lg font-semibold">System Status</h6>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-4 border border-slate-100 rounded-lg bg-slate-50">
                        <div className="p-2 bg-green-100 rounded-full mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Database</p>
                            <p className="text-sm font-semibold text-slate-700">Connected</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4 border border-slate-100 rounded-lg bg-slate-50">
                        <div className="p-2 bg-blue-100 rounded-full mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Server Time</p>
                            <p className="text-sm font-semibold text-slate-700">{new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4 border border-slate-100 rounded-lg bg-slate-50">
                        <div className="p-2 bg-purple-100 rounded-full mr-3">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Version</p>
                            <p className="text-sm font-semibold text-slate-700">v1.0.0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;