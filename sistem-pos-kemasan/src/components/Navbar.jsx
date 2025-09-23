// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

function Navbar({ onMenuButtonClick }) {
  const { user } = useAuth(); // 2. Ambil data 'user' dari context

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center md:justify-end">
      {/* Tombol Hamburger Menu (Hanya tampil di mobile) */}
      <button 
        onClick={onMenuButtonClick} 
        className="md:hidden text-gray-600 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      </button>
      
      {/* Profil Pengguna (sekarang dinamis) */}
      <div className="hidden md:block">
        {/* 3. Tampilkan nama user jika ada */}
        <span className="text-gray-700">Halo, {user ? user.name : 'Pengguna'}!</span>
      </div>
    </nav>
  );
}

export default Navbar;