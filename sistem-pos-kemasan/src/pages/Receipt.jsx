// src/pages/Receipt.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Receipt() {
  const { id } = useParams();
  const { token } = useAuth(); // Token mungkin dibutuhkan jika API-nya private
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchAndPrint = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        setOrder(data);
        // Tunggu data di-render, lalu panggil print
        setTimeout(() => window.print(), 500);
      } catch (error) {
        console.error("Gagal mengambil data struk:", error);
      }
    };
    fetchAndPrint();
  }, [id, token]);

  if (!order) return <p>Memuat struk...</p>;
  
  const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

  return (
    <div className="p-8 max-w-2xl mx-auto font-mono">
      <h1 className="text-2xl font-bold text-center mb-4">BUKTI PEMBAYARAN</h1>
      <p className="text-center">POS Kemasan</p>
      <hr className="my-4 border-dashed" />
      <p><strong>No. Pesanan:</strong> #{order.id}</p>
      <p><strong>Pelanggan:</strong> {order.customer_name}</p>
      <p><strong>Tanggal:</strong> {new Date(order.created_at).toLocaleString('id-ID')}</p>
      <hr className="my-4 border-dashed" />
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="text-right">Jumlah</th>
            <th className="text-right">Harga</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map(item => (
            <tr key={item.id}>
              <td>{item.product_name} ({item.size})</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{formatCurrency(item.price_per_item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="my-4 border-dashed" />
      <div className="text-right">
        <p className="font-bold text-lg">TOTAL: {formatCurrency(order.total_price)}</p>
      </div>
      <p className="text-center mt-8">Terima kasih!</p>
    </div>
  );
}
export default Receipt;