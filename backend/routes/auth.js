// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // <-- Import bcrypt
const db = require('../config/db'); // <-- Import koneksi database
const router = express.Router();

// Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => { // <-- Jadikan async
  const { email, password } = req.body;

  try {
    // 1. Cari user berdasarkan email di database
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    // Jika user tidak ditemukan
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = rows[0];

    // 2. Bandingkan password yang diinput dengan yang ada di database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // 3. Jika cocok, buatkan token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Kirim token dan data user (tanpa password)
    res.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });

  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;