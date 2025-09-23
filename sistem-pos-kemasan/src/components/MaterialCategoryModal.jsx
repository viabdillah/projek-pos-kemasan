// src/components/MaterialCategoryModal.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function MaterialCategoryModal({ isOpen, onClose, onSave, categoryToEdit }) {
  const [name, setName] = useState('');
  const { token } = useAuth();
  const isEditing = !!categoryToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(categoryToEdit.name);
    } else {
      setName('');
    }
  }, [categoryToEdit, isOpen, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? `http://localhost:5000/api/material-categories/${categoryToEdit.id}`
      : 'http://localhost:5000/api/material-categories';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan kategori');
      }
      onSave();
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Kategori</label>
            <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3" required />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Batal</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaterialCategoryModal;