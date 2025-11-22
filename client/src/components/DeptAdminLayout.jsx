import React from 'react';
import DeptAdminSidebar from './DeptAdminSidebar';

const DeptAdminLayout = ({ children }) => {
    return (
        <div className="flex">
            <DeptAdminSidebar />
            <div className="flex-grow ml-64 p-8 bg-gray-50 min-h-screen">
                {children}
            </div>
        </div>
    );
};
export default DeptAdminLayout;