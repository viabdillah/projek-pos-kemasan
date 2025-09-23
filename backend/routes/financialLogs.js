// backend/routes/financialLogs.js
const express = require('express');
const db = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/financial-logs - Mendapatkan semua catatan keuangan dengan filter
router.get('/', protect, authorize('admin', 'kasir'), async (req, res) => {
  try {
    const { period = 'daily' } = req.query; // Default ke harian
    const interval = getInterval(period);

    const query = `
      SELECT fl.*, u.name as user_name 
      FROM financial_logs fl 
      JOIN users u ON fl.user_id = u.id 
      WHERE fl.created_at >= DATE_SUB(NOW(), ${interval})
      ORDER BY fl.created_at DESC`;
      
    const [logs] = await db.query(query);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/financial-logs - Membuat catatan keuangan baru
router.post('/', protect, authorize('admin', 'kasir'), async (req, res) => {
  const { type, amount, description } = req.body;
  const user_id = req.user.id;

  if (!type || !amount || !description) {
    return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
  }

  try {
    const query = 'INSERT INTO financial_logs (type, amount, description, user_id) VALUES (?, ?, ?, ?)';
    await db.query(query, [type, amount, description, user_id]);
    res.status(201).json({ message: 'Catatan berhasil disimpan.' });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;