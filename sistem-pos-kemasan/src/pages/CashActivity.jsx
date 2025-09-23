// src/pages/CashActivity.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Komponen Form kita pindahkan ke dalam file ini agar lebih ringkas
function ManualLogForm({ onSave }) {
  const [formData, setFormData] = useState({ type: 'pengeluaran', amount: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // API ini perlu kita buat (menggunakan tabel financial_logs)
      const response = await fetch('http://localhost:5000/api/financial-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Gagal menyimpan catatan.');
      alert('Catatan berhasil disimpan!');
      setFormData({ type: 'pengeluaran', amount: '', description: '' });
      onSave(); // Memberi tahu parent untuk refresh
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Catat Transaksi Manual</h2>
      {/* ... Isi form seperti di FinancialLogs.jsx ... */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Keterangan</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Contoh: Beli Air Galon" className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Contoh: 20000" className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Tipe</label>
            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2">
              <option value="pengeluaran">Pengeluaran</option>
              <option value="pemasukan">Pemasukan</option>
            </select>
        </div>
      </div>
      <button type="submit" className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
      </button>
    </form>
  );
}


function CashActivity() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/reports/financial-transactions?period=weekly', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Aktivitas Kas</h1>
        <Link to="/new-order" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          + Buat Pesanan Penjualan
        </Link>
      </div>

      <ManualLogForm onSave={fetchTransactions} />

      <div className="bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold p-4 border-b">Riwayat Transaksi Terpadu (7 Hari Terakhir)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Tanggal</th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">Keterangan</th>
                <th className="px-5 py-3 border-b-2 text-right text-xs font-semibold uppercase">Pemasukan</th>
                <th className="px-5 py-3 border-b-2 text-right text-xs font-semibold uppercase">Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="text-center p-5">Memuat data...</td></tr>
              ) : transactions.map((trx, index) => (
                <tr key={index}>
                  <td className="px-5 py-5 border-b text-sm">{new Date(trx.date).toLocaleString('id-ID')}</td>
                  <td className="px-5 py-5 border-b text-sm">{trx.description}</td>
                  <td className="px-5 py-5 border-b text-sm text-right text-green-600 font-semibold">
                    {trx.type === 'pemasukan' ? formatCurrency(trx.amount) : '-'}
                  </td>
                  <td className="px-5 py-5 border-b text-sm text-right text-red-600 font-semibold">
                    {trx.type === 'pengeluaran' ? formatCurrency(trx.amount) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CashActivity;