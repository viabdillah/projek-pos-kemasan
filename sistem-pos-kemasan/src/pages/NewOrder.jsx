// src/pages/NewOrder.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function NewOrder() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Cek apakah ada data awal yang dikirim dari halaman lain (fitur 'Buat Ulang')
  const initialData = location.state?.initialOrderData || {
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    items: [{ 
      product_name: '', quantity: 1, price_per_item: 0,
      project_product_name: '', project_label_name: '', halal_no: '', 
      pirt_no: '', nib_no: '', has_design: false 
    }]
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData);

  // Handler untuk input biasa (info pelanggan)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler khusus untuk mengubah data di dalam array 'items'
  const handleItemChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newItems = [...formData.items];
    newItems[index][name] = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Fungsi untuk menambah baris item baru
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        product_name: '', quantity: 1, price_per_item: 0,
        project_product_name: '', project_label_name: '', halal_no: '', 
        pirt_no: '', nib_no: '', has_design: false 
      }]
    }));
  };

  // Fungsi untuk menghapus baris item
  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Fungsi untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const totalPrice = formData.items.reduce((total, item) => {
      return total + (Number(item.quantity) * Number(item.price_per_item));
    }, 0);

    const finalData = { ...formData, total_price: totalPrice };
    
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat pesanan');
      }

      alert('Pesanan baru berhasil dibuat!');
      navigate('/'); // Arahkan ke dashboard atau daftar pesanan

    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Buat Pesanan Baru</h1>

      {/* Informasi Pelanggan */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Informasi Pelanggan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Pembeli</label>
            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
            <input type="text" name="customer_phone" value={formData.customer_phone} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Alamat</label>
            <textarea name="customer_address" value={formData.customer_address} onChange={handleInputChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
          </div>
        </div>
      </div>

      {/* Item Pesanan Kemasan */}
      <div className="space-y-6">
        {formData.items.map((item, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow-md relative">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Item #{index + 1}</h3>
            {formData.items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-2xl">&times;</button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 font-semibold text-gray-600">Detail Kemasan</div>
              <input type="text" name="product_name" placeholder="Jenis Kemasan" value={item.product_name} onChange={(e) => handleItemChange(index, e)} className="border border-gray-300 rounded-md py-2 px-3" required />
              <input type="number" name="quantity" placeholder="Jumlah" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="border border-gray-300 rounded-md py-2 px-3" required />
              <input type="number" name="price_per_item" placeholder="Harga Satuan" value={item.price_per_item} onChange={(e) => handleItemChange(index, e)} className="border border-gray-300 rounded-md py-2 px-3" required />
              
              <div className="md:col-span-3 mt-4 font-semibold text-gray-600">Detail Proyek untuk Item Ini</div>
              <input type="text" name="project_product_name" placeholder="Nama Produk di Kemasan" value={item.project_product_name} onChange={(e) => handleItemChange(index, e)} className="border border-gray-300 rounded-md py-2 px-3" />
              <input type="text" name="project_label_name" placeholder="Nama Label/Merek" value={item.project_label_name} onChange={(e) => handleItemChange(index, e)} className="border border-gray-300 rounded-md py-2 px-3" />
              <input type="text" name="halal_no" placeholder="No. Halal" value={item.halal_no} onChange={(e) => handleItemChange(index, e)} className="border border-gray-300 rounded-md py-2 px-3" />
              <input type="text" name="pirt_no" placeholder="No. P-IRT" value={item.pirt_no} onChange={(e) => handleItemChange(index, e)} className="border border-gray-300 rounded-md py-2 px-3" />
              <input type="text" name="nib_no" placeholder="No. NIB" value={item.nib_no} onChange={(e) => handleItemChange(index, e)} className="border border-gray-300 rounded-md py-2 px-3" />
              <div className="md:col-span-3">
                <label className="flex items-center">
                  <input type="checkbox" name="has_design" checked={item.has_design} onChange={(e) => handleItemChange(index, e)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                  <span className="ml-2 text-gray-700">Sudah ada desain?</span>
                </label>
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={addItem} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded w-full">
          + Tambah Item Lain
        </button>
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Buat Pesanan'}
        </button>
      </div>
    </form>
  );
}

export default NewOrder;