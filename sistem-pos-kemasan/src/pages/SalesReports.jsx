// src/pages/SalesReports.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

function SalesReports() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('weekly'); // State for the selected period
  const chartRef = useRef(null);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tren Pendapatan',
      },
    },
    animation: {
      duration: 1000, // Durasi animasi dalam milidetik (1 detik)
      easing: 'easeInOutQuad', // Jenis efek transisi
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true); // Set loading true on each fetch
      try {
        const [summaryRes, chartRes] = await Promise.all([
          fetch(`http://localhost:5000/api/reports/sales-summary?period=${period}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/reports/sales-over-time?period=${period}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        const summaryData = await summaryRes.json();
        const salesOverTimeData = await chartRes.json();

        setSummary(summaryData);

        // Format labels differently for yearly view
        const labels = salesOverTimeData.map(d => {
          const date = new Date(d.date);
          return period === 'yearly'
            ? date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
            : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        });

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Pendapatan',
              data: salesOverTimeData.map(d => d.total),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.1
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [token, period]); // Re-run effect when the period changes

  const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  // Helper for button styling
  const getButtonClass = (buttonPeriod) => {
    return period === buttonPeriod
      ? 'bg-indigo-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-100';
  };

  const handleExcelDownload = async () => { // Jadikan fungsi ini async
      if (!summary || !chartData) return;

      // Tampilkan pesan loading atau nonaktifkan tombol
      alert('Mempersiapkan laporan, mohon tunggu...');

      try {
        // 1. Ambil data detail transaksi dari API baru
        const detailRes = await fetch(`http://localhost:5000/api/reports/sales-detail?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!detailRes.ok) throw new Error('Gagal mengambil detail transaksi');
        const detailedData = await detailRes.json();

        // 2. Siapkan semua worksheet
        const summaryWorksheet = XLSX.utils.json_to_sheet([
          { Kategori: "Total Pendapatan", Nilai: summary.totalRevenue },
          { Kategori: "Jumlah Pesanan", Nilai: summary.totalOrders },
          { Kategori: "Pelanggan Baru", Nilai: summary.newCustomers },
        ]);
        const chartDataWorksheet = XLSX.utils.json_to_sheet(
          chartData.labels.map((label, index) => ({
            Tanggal: label,
            Pendapatan: chartData.datasets[0].data[index],
          }))
        );
        // Worksheet baru dari data detail
        const detailWorksheet = XLSX.utils.json_to_sheet(detailedData);

        // 3. Buat Workbook dan tambahkan semua worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Ringkasan");
        XLSX.utils.book_append_sheet(workbook, detailWorksheet, "Detail Transaksi"); // Tambahkan sheet baru
        XLSX.utils.book_append_sheet(workbook, chartDataWorksheet, "Data Bagan");

        // 4. Unduh file
        XLSX.writeFile(workbook, `Laporan_Penjualan_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      } catch (error) {
          console.error('Gagal membuat file Excel:', error);
          alert('Terjadi kesalahan saat membuat laporan Excel.');
      }
  };

  // 5. Fungsi untuk mengunduh bagan sebagai gambar
  const handleChartDownload = () => {
    const chart = chartRef.current;
    if (chart) {
      const imageUrl = chart.toBase64Image('image/png', 1);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `Bagan_Penjualan_${period}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Laporan Penjualan</h1>
        {/* Filter Buttons */}
        <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
          <button onClick={() => setPeriod('weekly')} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${getButtonClass('weekly')}`}>Mingguan</button>
          <button onClick={() => setPeriod('monthly')} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${getButtonClass('monthly')}`}>Bulanan</button>
          <button onClick={() => setPeriod('yearly')} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${getButtonClass('yearly')}`}>Tahunan</button>
        </div>
      </div>

      {isLoading ? (
        <p>Memuat data laporan...</p>
      ) : (
        <>
          {/* Download Buttons */}
          <div className="flex space-x-3">
            <button onClick={handleExcelDownload} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Download Laporan (.xlsx)
            </button>
            <button onClick={handleChartDownload} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Download Bagan (.png)
            </button>
          </div>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Pendapatan</h3>
              <p className="text-3xl font-bold mt-2">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm font-semibold uppercase">Jumlah Pesanan</h3>
              <p className="text-3xl font-bold mt-2">{summary.totalOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm font-semibold uppercase">Pelanggan Baru</h3>
              <p className="text-3xl font-bold mt-2">{summary.newCustomers}</p>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            {chartData && (
              <Line 
                ref={chartRef}
                key={period}
                options={chartOptions} 
                data={chartData} 
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SalesReports;