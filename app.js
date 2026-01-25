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
// Bắt buộc có để Express nhận diện đúng giao thức HTTPS từ Render
app.set('trust proxy', 1); 

// Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Cấu hình View Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 2. CẤU HÌNH KHO LƯU SESSION (MONGODB STORE)
// ============================================================
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions', // Tên collection sẽ xuất hiện trong DB
  expires: 1000 * 60 * 60 * 24 * 7 // Tự xóa sau 7 ngày
});

// Bắt lỗi kết nối Store (Rất quan trọng để debug)
store.on('error', function(error) {
  console.error('❌ LỖI KẾT NỐI SESSION STORE:', error);
});

// ============================================================
// 3. CẤU HÌNH COOKIE PHIÊN LÀM VIỆC (ĐÃ TỐI ƯU CHO RENDER)
// ============================================================
app.use(session({
  secret: 'my secret key fashion shop', // Khóa bí mật
  resave: false,
  saveUninitialized: false, // Chỉ tạo session khi có dữ liệu (như thêm giỏ hàng)
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
    // --- CẤU HÌNH BẢO MẬT HTTPS ---
    secure: true,      // Render chạy HTTPS nên bắt buộc True để trình duyệt chấp nhận
    httpOnly: true,    // Chống hacker đọc cookie bằng JS
    sameSite: 'none'   // Cho phép cookie hoạt động tốt qua Proxy của Render
  }
}));

// ============================================================
// 4. MIDDLEWARE TOÀN CỤC (CHO NAVBAR)
// ============================================================
app.use((req, res, next) => {
  // Nếu chưa có giỏ thì tạo object rỗng để tránh lỗi ejs
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
  }
  // Gán vào locals để hiển thị số lượng trên Navbar ở mọi trang
  res.locals.cart = req.session.cart;
  next();
});

// ============================================================
// 5. ĐĂNG KÝ ROUTES
// ============================================================
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);

// Khởi động Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));