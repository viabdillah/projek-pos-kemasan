// src/components/LogUsageModal.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function LogUsageModal({ isOpen, onClose, onSave, orderId }) {
  const [materials, setMaterials] = useState([]); // Daftar semua bahan baku
  const [usageItems, setUsageItems] = useState([{ material_id: '', quantity_used: '' }]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const fetchMaterials = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/materials', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          setMaterials(data);
          if (data.length > 0) {
            setUsageItems([{ material_id: data[0].id, quantity_used: '' }]);
          }
        } catch (error) {
          console.error("Gagal mengambil daftar bahan baku:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMaterials();
    }
  }, [isOpen, token]);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...usageItems];
    newItems[index][name] = value;
    setUsageItems(newItems);
  };

  const addItem = () => {
    setUsageItems([...usageItems, { material_id: materials[0]?.id || '', quantity_used: '' }]);
  };

  const removeItem = (index) => {
    const newItems = usageItems.filter((_, i) => i !== index);
    setUsageItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/materials/log-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId, items: usageItems }),
      });
      if (!response.ok) throw new Error('Gagal menyimpan data pemakaian.');
      alert('Pemakaian bahan baku berhasil dicatat!');
      onSave(); // Memberi tahu parent untuk refresh
      onClose(); // Tutup modal
    } catch (error) {
      alert(error.message);
    }
  };

  if (!isOpen) return null;
  if (isLoading) return <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"><p className="text-white">Memuat...</p></div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Catat Pemakaian Bahan untuk Pesanan #{orderId}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {usageItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select name="material_id" value={item.material_id} onChange={(e) => handleItemChange(index, e)} className="flex-grow border rounded-md p-2">
                  {materials.map(mat => <option key={mat.id} value={mat.id}>{mat.name} ({mat.unit})</option>)}
                </select>
                <input type="number" name="quantity_used" value={item.quantity_used} onChange={(e) => handleItemChange(index, e)} placeholder="Jumlah" className="w-24 border rounded-md p-2" required />
                <button type="button" onClick={() => removeItem(index)} className="text-red-500 font-bold" disabled={usageItems.length <= 1}>X</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-4 text-sm bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded">+ Tambah Bahan</button>
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Batal</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LogUsageModal;