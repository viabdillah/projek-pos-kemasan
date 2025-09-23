// src/pages/ManageMaterialCategories.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MaterialCategoryModal from '../components/MaterialCategoryModal';

function ManageMaterialCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { token } = useAuth();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/material-categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Gagal mengambil data kategori:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (categoryId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/material-categories/${categoryId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
        fetchCategories();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (isLoading) return <p>Memuat kategori...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Kelola Kategori Bahan</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          + Tambah Kategori
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Nama Kategori</th>
              <th className="px-5 py-3 border-b-2 text-center text-xs font-semibold uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-5 py-5 border-b text-sm">{cat.name}</td>
                <td className="px-5 py-5 border-b text-sm text-center">
                  <button onClick={() => handleOpenModal(cat)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MaterialCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={fetchCategories}
        categoryToEdit={editingCategory}
      />
    </div>
  );
}

export default ManageMaterialCategories;