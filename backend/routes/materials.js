// backend/routes/materials.js
const express = require('express');
const db = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/materials - Get a list of all materials
// Accessible by production and management roles
router.get('/', protect, authorize('admin', 'manajer', 'operator', 'desainer'), async (req, res) => {
  try {
    const [materials] = await db.query('SELECT * FROM materials ORDER BY name ASC');
    res.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST /api/materials/log-usage - Log material usage for an order
// Primarily for operators
router.post('/log-usage', protect, authorize('admin', 'operator'), async (req, res) => {
  const { order_id, items } = req.body; // items is an array: [{ material_id, quantity_used, notes }]
  const user_id = req.user.id;

  if (!order_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order ID and items are required.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction(); // Start transaction

    for (const item of items) {
      // 1. Decrease the stock in the 'materials' table
      await connection.query(
        'UPDATE materials SET stock = stock - ? WHERE id = ?',
        [item.quantity_used, item.material_id]
      );

      // 2. Insert a record into the 'material_logs' table
      await connection.query(
        'INSERT INTO material_logs (material_id, order_id, user_id, quantity_change, notes) VALUES (?, ?, ?, ?, ?)',
        [item.material_id, order_id, user_id, -item.quantity_used, item.notes || `Usage for Order #${order_id}`]
      );
    }

    await connection.commit(); // Commit transaction if all queries succeed
    res.status(200).json({ message: 'Material usage logged successfully.' });

  } catch (error) {
    if (connection) await connection.rollback(); // Rollback on error
    console.error("Error logging material usage:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    if (connection) connection.release(); // Release connection back to the pool
  }
});

module.exports = router;