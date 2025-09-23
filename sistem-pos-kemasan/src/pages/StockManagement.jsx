// src/pages/StockManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

function StockManagement() {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/materials', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil data bahan baku.');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Stok Bahan Baku</h1>
        {/* Tombol untuk menambah stok baru bisa ditambahkan di sini nanti */}
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-4 text-center">Memuat data stok...</p>
          ) : (
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Nama Bahan</th>
                  <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Sisa Stok</th>
                  <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Satuan</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td className="px-5 py-5 border-b text-sm">{material.name}</td>
                    <td className="px-5 py-5 border-b text-sm">
                      <span className={`font-semibold ${material.stock <= material.low_stock_threshold ? 'text-red-600' : 'text-gray-900'}`}>
                        {material.stock}
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b text-sm">{material.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockManagement;