const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
// --- THAY ĐỔI Ở ĐÂY: Dùng connect-mongo thay vì connect-mongodb-session ---
const MongoStore = require('connect-mongo'); 
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
app.set('trust proxy', 1); 
app.set('view engine', 'ejs');
app.set('views', 'views');

// Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// ============================================================
// 2. MIDDLEWARE XỬ LÝ DỮ LIỆU
// ============================================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 3. CẤU HÌNH SESSION (SỬ DỤNG CONNECT-MONGO MỚI)
// ============================================================
// Không cần tạo biến 'store' riêng lẻ lằng nhằng như cũ nữa
// Chúng ta cấu hình trực tiếp bên trong app.use(session)

app.use(session({
  secret: process.env.SESSION_SECRET || 'my secret key fashion shop', 
  resave: false,
  saveUninitialized: false, 
  
  // --- CẤU HÌNH STORE MỚI (KHẮC PHỤC LỖI BSON) ---
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    
    // --- SỬA DÒNG NÀY ---
    // Đổi tên từ 'sessions' thành 'sessions_new' (hoặc tên gì tùy bạn)
    // Để nó tạo bảng mới, tránh xung đột với dữ liệu rác cũ
    collectionName: 'sessions_new', 
    
    ttl: 14 * 24 * 60 * 60, 
    autoRemove: 'native'
  }),
  
  // Cấu hình Cookie
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 ngày (tính bằng mili giây)
    secure: process.env.NODE_ENV === 'production', // Render -> True
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

// Update config session for Render