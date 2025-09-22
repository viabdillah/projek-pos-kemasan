// src/components/UserModal.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'kasir', // Nilai default
  });
  const { token } = useAuth();
  const isEditing = user !== null;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Kosongkan password saat edit
        role: user.role,
      });
    }
  }, [user, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = isEditing 
      ? `http://localhost:5000/api/users/${user.id}`
      : 'http://localhost:5000/api/users';
    
    const method = isEditing ? 'PUT' : 'POST';

    // Untuk edit, jangan kirim password jika kosong
    const body = { ...formData };
    if (isEditing && !body.password) {
      delete body.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan data');
      }

      onSave(); // Panggil fungsi untuk refresh data di halaman utama
      onClose(); // Tutup modal
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md z-50">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nama</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
          </div>
          
          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder={isEditing ? 'Kosongkan jika tidak diubah' : ''} required={!isEditing} />
          </div>

          {/* Role Select */}
          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role</label>
            <select name="role" id="role" value={formData.role} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="kasir">Kasir</option>
              <option value="desainer">Desainer</option>
              <option value="operator">Operator</option>
              <option value="manajer">Manajer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
              Batal
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;