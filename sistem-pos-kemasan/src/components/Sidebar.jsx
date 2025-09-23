// src/components/Sidebar.jsx
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Sidebar({ isOpen }) {
  const { user, logout } = useAuth();

  return (
    <aside 
      className={`
        w-64 bg-gray-800 text-white p-4 flex flex-col h-full
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="text-2xl font-bold mb-5 text-center">POS Kemasan</div>
      
      <nav className="flex-grow">
        <ul>
          {/* Menu Umum */}
          <li className="mb-2"><Link to="/" className="hover:bg-gray-700 p-2 rounded block">Dashboard</Link></li>
          <li className="mb-2"><Link to="/orders" className="hover:bg-gray-700 p-2 rounded block">Daftar Pesanan</Link></li>

          {/* Menu Kasir & Admin */}
          {user && (user.role === 'admin' || user.role === 'kasir') && (
            <>
              <li className="mb-2"><Link to="/new-order" className="hover:bg-gray-700 p-2 rounded block font-bold text-green-400">+ Pesanan Baru</Link></li>
              <li className="mb-2"><Link to="/pending-pickup" className="hover:bg-gray-700 p-2 rounded block">Siap Diambil</Link></li>
              <li className="mb-2"><Link to="/cash-activity" className="hover:bg-gray-700 p-2 rounded block">Aktivitas Kas</Link></li>
            </>
          )}
          
          {/* Menu Desainer & Admin */}
          {user && (user.role === 'admin' || user.role === 'desainer') && (
            <li className="mb-2"><Link to="/design-tasks" className="hover:bg-gray-700 p-2 rounded block">Tugas Desain</Link></li>
          )}

          {/* Menu Operator & Admin */}
          {user && (user.role === 'admin' || user.role === 'operator') && (
            <>
              <li className="mb-2"><Link to="/production-tasks" className="hover:bg-gray-700 p-2 rounded block">Tugas Produksi</Link></li>
              <li className="mb-2"><Link to="/stock-management" className="hover:bg-gray-700 p-2 rounded block">Manajemen Stok</Link></li>
              <li className="mb-2"><Link to="/material-categories" className="hover:bg-gray-700 p-2 rounded block">Kelola Kategori Bahan</Link></li>
            </>
          )}

          {/* Menu Manajer & Admin */}
          {user && (user.role === 'admin' || user.role === 'manajer') && (
            <>
              <li className="mb-2"><Link to="/reports/sales" className="hover:bg-gray-700 p-2 rounded block">Laporan Penjualan</Link></li>
              <li className="mb-2"><Link to="/finance" className="hover:bg-gray-700 p-2 rounded block">Laporan Keuangan</Link></li>
            </>
          )}

          {/* Menu khusus Admin */}
          {user && user.role === 'admin' && (
            <li className="mb-2"><Link to="/manage-users" className="hover:bg-gray-700 p-2 rounded block">Manajemen Pengguna</Link></li>
          )}
        </ul>
      </nav>

      <div className="mt-auto">
         <button onClick={logout} className="w-full text-left hover:bg-red-700 p-2 rounded block">Logout</button>
      </div>
    </aside>
  );
}

export default Sidebar;