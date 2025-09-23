// backend/routes/reports.js
const express = require('express');
const db = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Helper function to get the SQL interval string based on the period
const getInterval = (period) => {
  switch (period) {
    case 'monthly':
      return 'INTERVAL 30 DAY';
    case 'yearly':
      return 'INTERVAL 1 YEAR';
    case 'weekly':
    default:
      return 'INTERVAL 7 DAY';
  }
};

// GET /api/reports/sales-summary - Mendapatkan ringkasan KPI penjualan
router.get('/sales-summary', protect, authorize('admin', 'manajer'), async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const interval = getInterval(period);

    const summaryQuery = `
      SELECT
        COUNT(id) AS totalOrders,
        SUM(total_price) AS totalRevenue,
        COUNT(DISTINCT customer_name) AS newCustomers
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), ${interval})
    `;
    
    const [[summary]] = await db.query(summaryQuery);

    res.json({
      totalOrders: summary.totalOrders || 0,
      totalRevenue: summary.totalRevenue || 0,
      newCustomers: summary.newCustomers || 0,
    });
  } catch (error) {
    console.error("Error mengambil ringkasan penjualan:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET /api/reports/sales-over-time - Data penjualan untuk bagan
router.get('/sales-over-time', protect, authorize('admin', 'manajer'), async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const interval = getInterval(period);
    
    let groupBy = 'DATE(created_at)'; // Harian untuk mingguan/bulanan
    if (period === 'yearly') {
      groupBy = 'CONCAT(YEAR(created_at), "-", LPAD(MONTH(created_at), 2, "0"))'; // Bulanan untuk tahunan
    }

    const query = `
      SELECT
        ${groupBy} AS date,
        SUM(total_price) AS total
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), ${interval})
      GROUP BY ${groupBy}
      ORDER BY date ASC
    `;

    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error("Error mengambil data penjualan per waktu:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET /api/reports/sales-detail - Mendapatkan detail semua transaksi untuk diunduh
router.get('/sales-detail', protect, authorize('admin', 'manajer'), async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const interval = getInterval(period);

    const query = `
      SELECT
        o.id AS 'ID Pesanan',
        o.customer_name AS 'Nama Pelanggan',
        u.name AS 'Kasir',
        oi.product_name AS 'Jenis Kemasan',
        oi.size AS 'Ukuran',
        oi.quantity AS 'Jumlah',
        oi.price_per_item AS 'Harga Satuan',
        (oi.quantity * oi.price_per_item) AS 'Subtotal',
        oi.project_product_name AS 'Nama Produk di Kemasan',
        oi.project_label_name AS 'Label/Merek',
        oi.halal_no AS 'No. Halal',
        oi.pirt_no AS 'No. P-IRT',
        oi.nib_no AS 'No. NIB',
        o.status AS 'Status Pesanan',
        o.created_at AS 'Tanggal Transaksi'
      FROM orders AS o
      JOIN order_items AS oi ON o.id = oi.order_id
      JOIN users AS u ON o.created_by = u.id
      WHERE o.created_at >= DATE_SUB(NOW(), ${interval})
      ORDER BY o.created_at DESC;
    `;
    
    const [details] = await db.query(query);
    res.json(details);
  } catch (error)
 {
    console.error("Error mengambil detail penjualan:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// GET /api/reports/financial-transactions - Menggabungkan semua transaksi keuangan
router.get('/financial-transactions', protect, authorize('admin', 'manajer'), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const interval = getInterval(period);

    const query = `
      -- Ambil data dari Penjualan yang sudah Selesai
      (SELECT
        o.created_at AS date,
        'pemasukan' AS type,
        o.total_price AS amount,
        CONCAT('Penjualan dari Pesanan #', o.id, ' - ', o.customer_name) AS description,
        u.name AS user_name
      FROM orders AS o
      JOIN users AS u ON o.created_by = u.id
      WHERE o.status = 'Selesai' AND o.created_at >= DATE_SUB(NOW(), ${interval}))

      UNION ALL

      -- Ambil data dari Catatan Keuangan Manual (versi sederhana)
      (SELECT
        f.created_at AS date,
        f.type AS type,
        f.amount AS amount,
        f.description AS description, -- <-- Diubah dari fc.name
        u.name AS user_name
      FROM financial_logs AS f -- <-- Menggunakan tabel yang benar
      JOIN users AS u ON f.user_id = u.id -- <-- Menghapus join ke financial_categories
      WHERE f.created_at >= DATE_SUB(NOW(), ${interval}))

      ORDER BY date DESC;
    `;

    const [transactions] = await db.query(query);
    res.json(transactions);
  } catch (error) {
    console.error("Error mengambil transaksi keuangan:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;