// src/pages/PendingPickup.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function PendingPickup() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders/pickup-queue', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari server.');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Gagal mengambil tugas pengambilan:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFinalize = async (taskId) => {
    try {
      // 1. Ubah status menjadi 'Selesai'
      const response = await fetch(`http://localhost:5000/api/orders/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Selesai' }),
      });

      if (!response.ok) {
          throw new Error('Gagal memperbarui status pesanan.');
      }

      // 2. Buka halaman struk di tab baru
      window.open(`/receipt/${taskId}`, '_blank');
      
      // 3. Refresh daftar tugas di halaman ini
      fetchTasks();
    } catch (error) {
      alert(`Gagal menyelesaikan transaksi: ${error.message}`);
    }
  };

  if (isLoading) return <p>Memuat pesanan yang siap diambil...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pesanan Siap Diambil</h1>
      <div className="bg-white shadow-md rounded-lg">
        {tasks.length > 0 ? (
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID Pesanan & Pelanggan</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal Selesai Produksi</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="font-semibold">#{task.id}</p>
                    <p className="text-gray-600">{task.customer_name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {new Date(task.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    <Link to={`/order/${task.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Detail
                    </Link>
                    <button 
                      onClick={() => handleFinalize(task.id)} 
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Selesaikan & Cetak Struk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-5 text-center text-gray-500">Tidak ada pesanan yang siap diambil saat ini.</p>
        )}
      </div>
    </div>
  );
}

export default PendingPickup;