import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#111215] text-gray-200 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1 w-full max-w-[1600px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
