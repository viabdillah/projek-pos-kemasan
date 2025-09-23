// backend/routes/materialCategories.js
const express = require('express');
const db = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/material-categories - Mendapatkan semua kategori
router.get('/', protect, authorize('admin', 'manajer', 'operator'), async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM material_categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/material-categories - Membuat kategori baru
router.post('/', protect, authorize('admin', 'manajer'), async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nama kategori tidak boleh kosong.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO material_categories (name) VALUES (?)',
      [name]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Nama kategori sudah ada.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/material-categories/:id - Mengupdate kategori
router.put('/:id', protect, authorize('admin', 'manajer'), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE material_categories SET name = ? WHERE id = ?',
      [name, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }
    res.json({ id, name });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/material-categories/:id - Menghapus kategori
router.post('/', protect, authorize('admin', 'operator'), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM material_categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }
    res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Kategori tidak bisa dihapus karena masih digunakan oleh bahan baku.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;