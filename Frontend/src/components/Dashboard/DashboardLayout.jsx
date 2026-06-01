import React from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, isAdmin = false }) {
    return (
        <div className="min-h-screen bg-mystic text-white flex">
            <Sidebar isAdmin={isAdmin} />
            <main className="flex-1 ml-[260px] transition-all duration-300 min-h-screen overflow-x-hidden">
                <div className="p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
