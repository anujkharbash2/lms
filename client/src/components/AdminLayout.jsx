import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="p-4 sm:ml-64">
            <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
                {/* Content area for individual pages */}
                {children}
            </div>
            </div>
        </div>
    );
};
export default AdminLayout;