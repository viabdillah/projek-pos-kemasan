// src/pages/ProductionTasks.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LogUsageModal from '../components/LogUsageModal';

function ProductionTasks() {
  const [queueTasks, setQueueTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  
  // State untuk mengelola modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const [queueRes, allOrdersRes] = await Promise.all([
        fetch('http://localhost:5000/api/orders/production-queue', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        // Sementara kita filter dari semua order, nanti bisa dibuat API khusus
        fetch('http://localhost:5000/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      const queueData = await queueRes.json();
      const allOrdersData = await allOrdersRes.json();
      
      setQueueTasks(queueData);
      setInProgressTasks(allOrdersData.filter(order => order.status === 'Proses Produksi'));

    } catch (error) {
      console.error("Gagal mengambil tugas produksi:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const updateStatus = async (taskId, newStatus, successMessage) => {
    if (!window.confirm("Apakah Anda yakin ingin melanjutkan?")) return;
    try {
      await fetch(`http://localhost:5000/api/orders/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      alert(successMessage);
      fetchTasks(); // Refresh daftar tugas
    } catch (error) {
      alert('Gagal memulai produksi: ' + error.message);
    }
  };

  // Fungsi untuk membuka dan menutup modal
  const handleOpenLogModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsLogModalOpen(true);
  };
  const handleCloseLogModal = () => {
    setIsLogModalOpen(false);
    setSelectedOrderId(null);
  };

  if (isLoading) return <p>Memuat tugas produksi...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tugas Produksi</h1>
      
      {/* Bagian Antrian Produksi */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Antrian Baru</h2>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {queueTasks.length > 0 ? (
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">ID Pesanan & Pelanggan</th>
                  <th className="px-5 py-3 border-b-2 text-center text-xs font-semibold uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {queueTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-5 py-5 border-b text-sm">
                        <p className="font-semibold">#{task.id}</p>
                        <p className="text-gray-600">{task.customer_name}</p>
                    </td>
                    <td className="px-5 py-5 border-b text-sm text-center">
                      <Link to={`/order/${task.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Detail
                      </Link>
                      <button 
                        onClick={() => updateStatus(task.id, 'Proses Produksi', `Pesanan #${task.id} mulai diproduksi.`)} 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Mulai Produksi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="p-5 text-center text-gray-500">Tidak ada antrian baru.</p>}
        </div>
      </div>
      
      {/* Bagian Sedang Dikerjakan */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Sedang Dikerjakan</h2>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {inProgressTasks.length > 0 ? (
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">ID Pesanan & Pelanggan</th>
                  <th className="px-5 py-3 border-b-2 text-center text-xs font-semibold uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {inProgressTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-5 py-5 border-b text-sm">
                        <p className="font-semibold">#{task.id}</p>
                        <p className="text-gray-600">{task.customer_name}</p>
                    </td>
                    <td className="px-5 py-5 border-b text-sm text-center">
                      <Link to={`/order/${task.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Detail</Link>
                      <button onClick={() => handleOpenLogModal(task.id)} className="text-yellow-600 hover:text-yellow-800 font-semibold mr-4 py-1 px-3 border border-yellow-500 rounded hover:bg-yellow-100">Catat Pemakaian</button>
                      <button onClick={() => updateStatus(task.id, 'Siap Diambil', `Pesanan #${task.id} telah selesai.`)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded">Selesaikan Produksi</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="p-5 text-center text-gray-500">Tidak ada pekerjaan yang sedang berjalan.</p>}
        </div>
      </div>
      
      <LogUsageModal
        isOpen={isLogModalOpen}
        onClose={handleCloseLogModal}
        onSave={fetchTasks} // Refresh data setelah menyimpan log pemakaian
        orderId={selectedOrderId}
      />
    </div>
  );
}

export default ProductionTasks;