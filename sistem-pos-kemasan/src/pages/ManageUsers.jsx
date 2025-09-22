// src/pages/ManageUsers.jsx - VERSI FINAL DENGAN MODAL
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import UserModal from '../components/UserModal'; // <-- IMPORT MODAL

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // State untuk mengelola modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    // Fungsi ini tidak berubah
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil data pengguna');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId) => {
    // Fungsi ini tidak berubah
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Gagal menghapus pengguna');
        fetchUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Fungsi untuk membuka dan menutup modal
  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  if (isLoading) return <p>Memuat data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          + Tambah Pengguna
        </button>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.email}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm capitalize">{user.role}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tampilkan Modal jika isModalOpen bernilai true */}
      {isModalOpen && (
        <UserModal 
          user={editingUser}
          onClose={handleCloseModal}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
}

export default ManageUsers;