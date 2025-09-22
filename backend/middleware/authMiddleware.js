// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  // Cek apakah ada header Authorization dan dimulai dengan 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil token dari header (setelah kata 'Bearer ')
      token = req.headers.authorization.split(' ')[1];
      
      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Simpan data user dari token ke object request agar bisa dipakai di rute selanjutnya
      req.user = decoded; 
      next(); // Lanjutkan ke fungsi rute berikutnya
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Tidak terotorisasi, token gagal' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Tidak terotorisasi, tidak ada token' });
  }
};

// Middleware untuk membatasi akses hanya untuk admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Akses ditolak, hanya untuk admin' });
  }
};

module.exports = { protect, isAdmin };