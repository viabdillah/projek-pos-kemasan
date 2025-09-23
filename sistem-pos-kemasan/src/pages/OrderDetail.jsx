// src/pages/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OrderDetail() {
  const { id } = useParams(); // Mengambil 'id' dari URL, misal: /order/1 -> id = 1
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Gagal mengambil detail pesanan');
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id, token]);
  
  const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (isLoading) return <p>Memuat detail pesanan...</p>;
  if (!order) return <p>Pesanan tidak ditemukan.</p>;

  return (
    <div className="space-y-6">
      <Link to="/orders" className="text-indigo-600 hover:text-indigo-800">&larr; Kembali ke Daftar Pesanan</Link>
      <h1 className="text-3xl font-bold text-gray-800">Detail Pesanan #{order.id}</h1>

      {/* Ringkasan Pesanan */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Ringkasan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-sm text-gray-500">Nama Pelanggan</p><p className="font-medium">{order.customer_name}</p></div>
          <div><p className="text-sm text-gray-500">Telepon</p><p className="font-medium">{order.customer_phone || '-'}</p></div>
          <div><p className="text-sm text-gray-500">Total Harga</p><p className="font-medium">{formatCurrency(order.total_price)}</p></div>
          <div><p className="text-sm text-gray-500">Status</p><p className="font-medium capitalize">{order.status}</p></div>
          <div className="col-span-2"><p className="text-sm text-gray-500">Alamat</p><p className="font-medium">{order.customer_address || '-'}</p></div>
          <div><p className="text-sm text-gray-500">Tanggal Pesan</p><p className="font-medium">{formatDate(order.created_at)}</p></div>
        </div>
      </div>

      {/* Rincian Item */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Rincian Item</h2>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={item.id} className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Item #{index + 1}: {item.product_name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                <div><p className="text-sm text-gray-500">Ukuran</p><p className="font-medium">{item.size || '-'}</p></div>
                <div><p className="text-sm text-gray-500">Jumlah</p><p className="font-medium">{item.quantity}</p></div>
                <div><p className="text-sm text-gray-500">Harga Satuan</p><p className="font-medium">{formatCurrency(item.price_per_item)}</p></div>
                <div className="col-span-full mt-2"><p className="text-sm font-semibold text-gray-600">Detail Proyek Item</p></div>
                <div><p className="text-sm text-gray-500">Nama Produk</p><p className="font-medium">{item.project_product_name || '-'}</p></div>
                <div><p className="text-sm text-gray-500">Nama Label</p><p className="font-medium">{item.project_label_name || '-'}</p></div>
                <div><p className="text-sm text-gray-500">No. Halal</p><p className="font-medium">{item.halal_no || '-'}</p></div>
                <div><p className="text-sm text-gray-500">No. P-IRT</p><p className="font-medium">{item.pirt_no || '-'}</p></div>
                <div><p className="text-sm text-gray-500">No. NIB</p><p className="font-medium">{item.nib_no || '-'}</p></div>
                <div><p className="text-sm text-gray-500">Desain</p><p className="font-medium">{item.has_design ? 'Sudah Ada' : 'Belum Ada'}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;