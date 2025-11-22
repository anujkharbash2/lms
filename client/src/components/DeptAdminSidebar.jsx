import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DeptAdminSidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const navItems = [
        { 
            path: '/deptadmin/dashboard', 
            name: 'Dashboard', 
            icon: (
                <svg className="w-5 h-5 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z"/>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z"/>
                </svg>
            )
        },
        { 
            path: '/deptadmin/courses', 
            name: 'My Courses', 
            icon: (
                <svg className="w-5 h-5 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
                </svg>
            )
        },
        { 
            path: '/deptadmin/users', 
            name: 'Faculty & Students', 
            icon: (
                <svg className="w-5 h-5 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 5.5M19.5 17h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05a2.5 2.5 0 1 0-2-4.45m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3 1 1 0 0 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
                </svg>
            )
        },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button 
                onClick={toggleSidebar}
                type="button" 
                className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
            </button>

            {/* Sidebar Wrapper */}
            <aside 
                className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } sm:translate-x-0 bg-gray-50 border-r border-gray-200`} 
                aria-label="Sidebar"
            >
                <div className="h-full flex flex-col px-3 py-4 overflow-y-auto bg-gray-50">
                    
                     {/* Header / User Info Section */}
                     <div className="mb-5 ps-2.5">
                        <div className="flex items-center mb-1">
                            <span className="text-2xl mr-2">🏛️</span>
                            <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-800">Dept Admin</span>
                        </div>
                        {/* User ID Display */}
                        <div className="flex items-center gap-2 ps-1">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="text-xs font-medium text-gray-500">
                                {user?.loginId || 'Admin'}
                            </span>
                        </div>
                    </div>

                    {/* Navigation List */}
                    <ul className="space-y-2 font-medium flex-grow">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center p-2 rounded-lg group transition duration-200 ${
                                            isActive 
                                                ? 'bg-gray-200 text-gray-900' 
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    <span className={({ isActive }) => isActive ? "text-gray-900" : "text-gray-500"}>
                                        {item.icon}
                                    </span>
                                    <span className="ms-3">{item.name}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {/* Logout Section */}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center p-2 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 group transition duration-200"
                        >
                            <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-red-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap text-left">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default DeptAdminSidebar;