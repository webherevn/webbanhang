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
// 1. CẤU HÌNH QUAN TRỌNG CHO RENDER (PROXY & SSL)
// ============================================================
// Bắt buộc có dòng này để Session hoạt động trên Render
app.set('trust proxy', 1); 

// Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Cấu hình View Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware xử lý dữ liệu Form
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 2. CẤU HÌNH KHO LƯU SESSION (MONGODB STORE)
// ============================================================
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 * 7 // 7 ngày
});

store.on('error', function(error) {
  console.error('❌ LỖI KẾT NỐI SESSION STORE:', error);
});

// ============================================================
// 3. CẤU HÌNH COOKIE (ĐÃ SỬA ĐỂ KHẮC PHỤC LỖI GIỎ HÀNG)
// ============================================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'my secret key fashion shop', 
  resave: false,
  saveUninitialized: false, 
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
    
    // --- SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY ---
    // 1. Secure: true (Vì Render dùng HTTPS)
    // Lưu ý: Nếu chạy Localhost (http://localhost:3000) thì phải để false
    // Code dưới sẽ tự động nhận diện: Production -> True, Local -> False
    secure: process.env.NODE_ENV === 'production', 
    
    // 2. HttpOnly: true (Bảo mật)
    httpOnly: true,
    
    // 3. SameSite: 'lax' (Thay vì 'none')
    // 'lax' ổn định hơn cho web bán hàng thông thường, giúp trình duyệt không chặn cookie
    sameSite: 'lax' 
  }
}));

// ============================================================
// 4. MIDDLEWARE TOÀN CỤC (KHỞI TẠO GIỎ HÀNG)
// ============================================================
app.use((req, res, next) => {
  // Kiểm tra và khởi tạo giỏ hàng nếu chưa có
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
  }
  
  // Biến locals giúp hiển thị dữ liệu ở mọi file EJS (Navbar, Footer...)
  res.locals.isAuthenticated = req.session.isLoggedIn; // (Nếu sau này làm đăng nhập)
  res.locals.cart = req.session.cart;
  
  next();
});

// ============================================================
// 5. ĐĂNG KÝ ROUTES
// ============================================================
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);

// Xử lý lỗi 404 (Trang không tồn tại)
app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404' });
});

// Khởi động Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));