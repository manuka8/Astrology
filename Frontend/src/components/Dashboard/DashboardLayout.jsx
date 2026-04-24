import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex bg-mystic min-h-screen">
            <Sidebar />
            <main className="flex-grow ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
