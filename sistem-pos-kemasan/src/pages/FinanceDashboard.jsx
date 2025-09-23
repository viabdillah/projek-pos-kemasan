// src/pages/FinanceDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

// Import Chart.js
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
);

function FinanceDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const [period, setPeriod] = useState('monthly');

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/reports/financial-transactions?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Gagal mengambil data dari server');
      const data = await response.json();
      setTransactions(data);

      // --- Proses data untuk ringkasan dan bagan ---
      let totalIncome = 0;
      let totalExpense = 0;
      const dailyData = {};

      data.forEach(trx => {
        if (trx.type === 'pemasukan') {
          totalIncome += parseFloat(trx.amount);
        } else {
          totalExpense += parseFloat(trx.amount);
        }

        const dateKey = period === 'yearly'
          ? new Date(trx.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
          : new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { income: 0, expense: 0 };
        }
        if (trx.type === 'pemasukan') {
          dailyData[dateKey].income += parseFloat(trx.amount);
        } else {
          dailyData[dateKey].expense += parseFloat(trx.amount);
        }
      });

      setSummary({ income: totalIncome, expense: totalExpense, net: totalIncome - totalExpense });

      const labels = Object.keys(dailyData).reverse();
      setChartData({
        labels,
        datasets: [
          {
            label: 'Pemasukan',
            data: labels.map(label => dailyData[label].income),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
          {
            label: 'Pengeluaran',
            data: labels.map(label => dailyData[label].expense),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      });

    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, period]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleExcelDownload = () => {
    if (transactions.length === 0) return;
    const summaryWorksheet = XLSX.utils.json_to_sheet([
        { Kategori: `Total Pemasukan (${periodText[period]})`, Nilai: summary.income },
        { Kategori: `Total Pengeluaran (${periodText[period]})`, Nilai: summary.expense },
        { Kategori: "Laba/Rugi Bersih", Nilai: summary.net },
    ]);
    const detailWorksheet = XLSX.utils.json_to_sheet(transactions.map(trx => ({
        Tanggal: new Date(trx.date).toLocaleString('id-ID'),
        Tipe: trx.type,
        Jumlah: trx.amount,
        Keterangan: trx.description,
        'Dicatat Oleh': trx.user_name
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Ringkasan Keuangan");
    XLSX.utils.book_append_sheet(workbook, detailWorksheet, "Detail Transaksi");
    XLSX.writeFile(workbook, `Laporan_Keuangan_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  const chartOptions = {
    responsive: true,
    plugins: { 
      legend: { position: 'top' },
      title: { display: false }
    },
    animation: { duration: 1000, easing: 'easeOutBounce' },
    scales: { y: { beginAtZero: true } },
  };

  const getButtonClass = (buttonPeriod) => {
    return period === buttonPeriod
      ? 'bg-indigo-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-100';
  };
  
  const periodText = {
      weekly: '7 Hari Terakhir',
      monthly: '30 Hari Terakhir',
      yearly: '1 Tahun Terakhir'
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Laporan Keuangan</h1>
        <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
          <button onClick={() => setPeriod('weekly')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${getButtonClass('weekly')}`}>Mingguan</button>
          <button onClick={() => setPeriod('monthly')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${getButtonClass('monthly')}`}>Bulanan</button>
          <button onClick={() => setPeriod('yearly')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${getButtonClass('yearly')}`}>Tahunan</button>
        </div>
      </div>
      
      {isLoading ? <p>Memuat laporan...</p> : (
        <>
          <div className="flex justify-end flex-wrap gap-2">
              <button onClick={handleExcelDownload} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Download Laporan (.xlsx)</button>
          </div>

          {/* Kartu Ringkasan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500 text-sm font-semibold uppercase">Total Pemasukan ({periodText[period]})</h3><p className="text-3xl font-bold mt-2 text-green-600">{formatCurrency(summary.income)}</p></div>
            <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500 text-sm font-semibold uppercase">Total Pengeluaran ({periodText[period]})</h3><p className="text-3xl font-bold mt-2 text-red-600">{formatCurrency(summary.expense)}</p></div>
            <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500 text-sm font-semibold uppercase">Laba / Rugi Bersih</h3><p className={`text-3xl font-bold mt-2 ${summary.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(summary.net)}</p></div>
          </div>

          {/* Bagan Keuangan */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-4">Grafik Keuangan ({periodText[period]})</h3>
            {chartData && <Bar options={chartOptions} data={chartData} />}
          </div>
        </>
      )}
    </div>
  );
}

export default FinanceDashboard;