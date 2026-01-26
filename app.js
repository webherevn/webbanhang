const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');

// Import Routes
const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

// Khởi tạo App
dotenv.config();
const app = express();

// ============================================================
// 1. CẤU HÌNH RENDER & VIEW
// ============================================================
app.set('trust proxy', 1); // Bắt buộc cho Render
app.set('view engine', 'ejs');
app.set('views', 'views');

// Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// ============================================================
// 2. MIDDLEWARE XỬ LÝ DỮ LIỆU (QUAN TRỌNG)
// ============================================================
// Xử lý dữ liệu từ Form (req.body) - PHẢI CÓ DÒNG NÀY ĐỂ CART HOẠT ĐỘNG
app.use(express.urlencoded({ extended: true }));

// [THÊM MỚI] Xử lý dữ liệu JSON (Phòng khi dùng fetch api/axios sau này)
app.use(express.json()); 

app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 3. CẤU HÌNH SESSION & COOKIE
// ============================================================
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 * 7 
});

store.on('error', function(error) {
  console.error('❌ LỖI SESSION STORE:', error);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'my secret key fashion shop', 
  resave: false,
  saveUninitialized: false, 
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // Render: Production -> True (HTTPS), Local -> False (HTTP)
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    sameSite: 'lax' 
  }
}));

// ============================================================
// 4. BIẾN TOÀN CỤC (NAVBAR, CART)
// ============================================================
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
  }
  res.locals.isAuthenticated = req.session.isLoggedIn; 
  res.locals.cart = req.session.cart;
  next();
});

// ============================================================
// 5. ROUTES
// ============================================================
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);

app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));