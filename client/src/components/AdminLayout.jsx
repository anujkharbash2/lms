import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-grow ml-64 p-8 bg-gray-50 min-h-screen">
                {/* Content area for individual pages */}
                {children}
            </div>
        </div>
    );
};
export default AdminLayout;