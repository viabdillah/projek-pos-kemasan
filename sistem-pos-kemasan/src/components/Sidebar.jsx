// src/components/Sidebar.jsx

import { useAuth } from '../context/AuthContext'; // 1. IMPORT USEAUTH

function Sidebar({ isOpen }) {
  const { logout, user } = useAuth(); // 2. PANGGIL DAN AMBIL FUNGSI LOGOUT
  

  return (
    // Pastikan className di sini mengandung 'flex flex-col h-full'
    <aside 
      className={`
        w-64 bg-gray-800 text-white p-4 flex flex-col h-full
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="text-2xl font-bold mb-5">POS Kemasan</div>
      <ul>
        <li className="mb-2"><a href="#" className="hover:bg-gray-700 p-2 rounded block">Dashboard</a></li>
        <li className="mb-2"><a href="#" className="hover:bg-gray-700 p-2 rounded block">Pesanan</a></li>
        <li className="mb-2"><a href="#" className="hover:bg-gray-700 p-2 rounded block">Desain</a></li>
        {/* Tampilkan link ini hanya jika role user adalah 'admin' */}
        
        {user && user.role === 'admin' && (
          <li className="mb-2">
            <a href="/manage-users" className="hover:bg-gray-700 p-2 rounded block">
              Manajemen Pengguna
            </a>
          </li>
        )}

       {user && (user.role === 'admin' || user.role === 'kasir') && (
          <li className="mb-2">
            <a href="/new-order" className="hover:bg-gray-700 p-2 rounded block font-bold">
              + Pesanan Baru
            </a>
          </li>
        )}

        <li className="mb-2">
          <a href="/orders" className="hover:bg-gray-700 p-2 rounded block">
            Daftar Pesanan
          </a>
        </li>
      </ul>

      {/* div ini akan mendorong tombol logout ke bawah */}
      <div className="mt-auto">
         <button 
           onClick={logout} // Sekarang 'logout' sudah dikenali
           className="w-full text-left hover:bg-red-700 p-2 rounded block"
         >
           Logout
         </button>
      </div>
    </aside>
  );
}

export default Sidebar;