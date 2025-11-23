import React from 'react';
import InstructorSidebar from './InstructorSidebar';

const InstructorLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <InstructorSidebar />
            <div className="p-4 sm:ml-64">
                {/* Using same dashed border style as StudentLayout for consistency */}
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg min-h-[85vh]">
                    {children}
                </div>
            </div>
        </div>
    );
};
export default InstructorLayout;