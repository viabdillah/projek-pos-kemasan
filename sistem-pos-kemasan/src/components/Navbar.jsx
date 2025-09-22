// src/components/Navbar.jsx

function Navbar({ onMenuButtonClick }) {
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

      {/* Elemen Navbar lain (Contoh: Profil Pengguna) */}
      <div className="hidden md:block">
        <span className="text-gray-700">Halo, Pengguna!</span>
      </div>
    </nav>
  );
}

export default Navbar;