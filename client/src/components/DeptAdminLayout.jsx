import React from 'react';
import DeptAdminSidebar from './DeptAdminSidebar';



const DeptAdminLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <DeptAdminSidebar />
            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
                {children}
            </div>

            </div>
            
        </div>
    );
};
export default DeptAdminLayout;