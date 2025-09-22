// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// --- Rute-rute di bawah ini diproteksi dan hanya bisa diakses oleh admin ---

// GET /api/users - Mendapatkan semua pengguna
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/users - Membuat pengguna baru
router.post('/', protect, isAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password || !role) {
     return res.status(400).json({ message: 'Mohon isi semua field' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/users/:id - Mengupdate pengguna
router.put('/:id', protect, isAdmin, async (req, res) => {
  const { name, email, role } = req.body;
  const { id } = req.params;

  try {
    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    res.json({ id, name, email, role });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/users/:id - Menghapus pengguna
router.delete('/:id', protect, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;