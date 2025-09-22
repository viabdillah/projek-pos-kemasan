// src/layouts/MainLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

function MainLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar onMenuButtonClick={toggleSidebar} />

        {/* Area Konten Halaman */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay untuk menutup sidebar saat diklik di luar (opsional tapi bagus) */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
        ></div>
      )}
    </div>
  );
}

export default MainLayout;