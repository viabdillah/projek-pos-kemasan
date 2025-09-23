// src/pages/DesignTasks.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function DesignTasks() {
  const [queueTasks, setQueueTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // Ambil data untuk kedua antrian secara bersamaan
      const [queueRes, inProgressRes] = await Promise.all([
        fetch('http://localhost:5000/api/orders/design-queue', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/orders/design-in-progress', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);
      
      if (!queueRes.ok || !inProgressRes.ok) {
        throw new Error('Gagal mengambil data tugas desain');
      }
      
      const queueData = await queueRes.json();
      const inProgressData = await inProgressRes.json();
      
      setQueueTasks(queueData);
      setInProgressTasks(inProgressData);

    } catch (error) {
      console.error("Gagal mengambil tugas desain:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const updateStatus = async (task, newStatus, successMessage) => {
    if (!window.confirm("Apakah Anda yakin ingin melanjutkan?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${task.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal memperbarui status');
      }

      alert(successMessage);
      fetchTasks(); // Refresh kedua daftar tugas
    } catch (error) {
      alert(`Gagal memperbarui status pesanan: ${error.message}`);
    }
  };

  if (isLoading) return <p>Memuat tugas...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tugas Desain</h1>
      
      {/* Bagian Antrian Baru */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Antrian Baru</h2>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          {queueTasks.length > 0 ? (
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">ID Pesanan & Pelanggan</th>
                  <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Catatan Desain</th>
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
                    <td className="px-5 py-5 border-b text-sm">
                      {task.has_design ? 
                        <span className="text-green-600 font-semibold">Sudah Ada Desain</span> : 
                        <span className="text-blue-600 font-semibold">Belum Ada Desain</span>}
                    </td>
                    <td className="px-5 py-5 border-b text-sm text-center">
                      <Link to={`/order/${task.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Detail</Link>
                      <button onClick={() => updateStatus(task, task.has_design ? 'Antrian Produksi' : 'Proses Desain', `Pesanan #${task.id} dikonfirmasi.`)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded">Konfirmasi</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="p-5 text-center text-gray-500">Tidak ada tugas baru di antrian.</p>}
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
                      <button onClick={() => updateStatus(task, 'Antrian Produksi', `Desain untuk pesanan #${task.id} telah selesai.`)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">Selesaikan Desain</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="p-5 text-center text-gray-500">Tidak ada desain yang sedang dikerjakan.</p>}
        </div>
      </div>
    </div>
  );
}

export default DesignTasks;