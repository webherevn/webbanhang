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

// --- QUAN TRỌNG: SỬA LỖI GIỎ HÀNG TRÊN RENDER ---
// Giúp Express tin tưởng proxy của Render để lưu được Cookie
app.set('trust proxy', 1); 

// Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Cấu hình View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware xử lý dữ liệu Form và Static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- CẤU HÌNH SESSION & COOKIE ---
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions' // Tên bảng lưu session trong DB
});

// Bắt lỗi nếu store không kết nối được
store.on('error', function(error) {
  console.log('Session Store Error:', error);
});

app.use(session({
  secret: 'my secret key fashion shop', // Chuỗi bí mật
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // Tồn tại 7 ngày
    secure: false, // QUAN TRỌNG: Để false thì mới chạy được trên Render (HTTP/HTTPS proxy)
    httpOnly: true,
    sameSite: 'lax' // Giúp cookie ổn định hơn
  }
}));

// Middleware toàn cục: Biến giỏ hàng thành biến local để dùng ở mọi file EJS (Navbar)
app.use((req, res, next) => {
  // Nếu chưa có giỏ hàng, khởi tạo rỗng
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
  }
  // Gán vào locals để hiển thị số lượng trên Navbar
  res.locals.cart = req.session.cart;
  next();
});

// --- ĐĂNG KÝ ROUTES ---
app.use('/admin', adminRoutes); // Các đường dẫn bắt đầu bằng /admin
app.use('/', shopRoutes);       // Các đường dẫn khách hàng (Trang chủ, Giỏ hàng...)

// Khởi động Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));