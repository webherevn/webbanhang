// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin.routes');

dotenv.config();
const app = express();

// Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// View Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
// ... các dòng import ở trên
const shopRoutes = require('./routes/shop.routes'); // <--- THÊM DÒNG NÀY

// ...
app.use('/admin', adminRoutes);
app.use('/', shopRoutes); // <--- THÊM DÒNG NÀY (Để xử lý trang chủ)

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));