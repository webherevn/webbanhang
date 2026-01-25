// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin.routes');

dotenv.config();
const app = express();
// --- BẮT BUỘC PHẢI CÓ DÒNG NÀY ---
app.set('trust proxy', 1);
// Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// View Engine
app.set('view engine', 'ejs');

// ... (Các dòng require ở trên cùng)
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// ... (Sau đoạn app.set view engine)

// Cấu hình kho lưu Session trên MongoDB
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions'
});

// Kích hoạt Middleware Session
app.use(session({
  secret: 'my secret key fashion shop', // Chuỗi bí mật để mã hóa
  resave: false,
  saveUninitialized: false,
  store: store
}));

// Middleware để biến session cart thành biến cục bộ cho mọi view (để hiển thị số lượng trên Navbar)
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
  }
  res.locals.cart = req.session.cart;
  next();
});

// ... (Đến đoạn app.use routes)

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