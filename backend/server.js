// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');
const financialLogsRoutes = require('./routes/financialLogs');
const materialsRoutes = require('./routes/materials');
const materialCategoriesRoutes = require('./routes/materialCategories');

const app = express();

// Middleware
app.use(cors()); // Mengizinkan request dari domain lain
app.use(express.json()); // Mem-parsing body request JSON

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/financial-logs', financialLogsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/material-categories', materialCategoriesRoutes);

// Rute dasar untuk tes
app.get('/', (req, res) => {
  res.send('Server Backend POS Kemasan Berjalan!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});