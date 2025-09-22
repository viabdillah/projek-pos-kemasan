// backend/routes/orders.js
const express = require('express');
const db = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Endpoint: POST /api/orders - Membuat pesanan baru
// Hanya bisa diakses oleh admin dan kasir
router.post('/', protect, authorize('admin', 'kasir'), async (req, res) => {
  const {
    customer_name,
    customer_phone,
    customer_address,
    total_price,
    items
  } = req.body;
  const created_by = req.user.id;
  
  if (!customer_name || !total_price || !items || items.length === 0) {
    return res.status(400).json({ message: 'Data pelanggan, total harga, dan item pesanan tidak boleh kosong.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Masukkan data ke tabel 'orders'
    const orderQuery = `
      INSERT INTO orders (customer_name, customer_phone, customer_address, total_price, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [orderResult] = await connection.query(orderQuery, [
      customer_name, customer_phone, customer_address, total_price, created_by
    ]);
    const orderId = orderResult.insertId;

    // 2. Masukkan setiap item ke 'order_items'
    const itemQuery = `
      INSERT INTO order_items (order_id, product_name, quantity, price_per_item, 
      project_product_name, project_label_name, halal_no, pirt_no, nib_no, has_design) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    for (const item of items) {
      await connection.query(itemQuery, [
        orderId, 
        item.product_name, 
        item.quantity, 
        item.price_per_item,
        item.project_product_name,
        item.project_label_name,
        item.halal_no,
        item.pirt_no,
        item.nib_no,
        item.has_design
      ]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Pesanan berhasil dibuat!', orderId: orderId });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error saat membuat pesanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    if (connection) connection.release();
  }
});

// GET /api/orders - Mendapatkan semua pesanan
// Diproteksi, hanya user yang login yang bisa akses
router.get('/', protect, async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id, 
        o.customer_name, 
        o.total_price, 
        o.status, 
        o.created_at, 
        u.name AS created_by_name 
      FROM orders AS o
      JOIN users AS u ON o.created_by = u.id
      ORDER BY o.created_at DESC
    `;
    
    const [orders] = await db.query(query);

    res.json(orders);
  } catch (error) {
    console.error('Error saat mengambil daftar pesanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});


// GET /api/orders/:id - Mendapatkan detail satu pesanan
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    // Ambil data pesanan utama
    const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    
    // Ambil semua item yang terkait dengan pesanan tersebut
    const [itemRows] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    
    // Gabungkan hasilnya
    const orderDetails = { ...orderRows[0], items: itemRows };
    
    res.json(orderDetails);
  } catch (error) {
    console.error('Error saat mengambil detail pesanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;