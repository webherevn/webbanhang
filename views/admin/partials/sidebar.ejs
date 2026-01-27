const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- QUAN TRỌNG: NẠP BIẾN MÔI TRƯỜNG NGAY LẬP TỨC ---
dotenv.config(); 

const session = require('express-session');
const MongoStore = require('connect-mongo'); 
const path = require('path');

// --- IMPORT MODELS ---
const Setting = require('./models/SettingModel'); 
const Theme = require('./models/ThemeModel'); // Đảm bảo model này tồn tại

// Import Routes
const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

// Khởi tạo App
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
// 3. CẤU HÌNH SESSION
// ============================================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'my secret key fashion shop', 
  resave: false,
  saveUninitialized: false, 
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions_new',
    ttl: 14 * 24 * 60 * 60, 
    autoRemove: 'native'
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000, 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    sameSite: 'lax' 
  }
}));

// ============================================================
// 4. BIẾN TOÀN CỤC (NAVBAR, CART, THEME, SCRIPTS)
// --- PHẢI NẰM TRƯỚC ROUTES ---
// ============================================================
app.use(async (req, res, next) => {
    try {
        // Lấy dữ liệu Scripts và Theme cùng lúc để tối ưu
        const [settings, theme] = await Promise.all([
            Setting.findOne({ key: 'global_settings' }),
            Theme.findOne({ key: 'theme_settings' })
        ]);
        
        // Xử lý Global Scripts
        res.locals.globalScripts = settings || { headerScripts: '', bodyScripts: '', footerScripts: '' };
        
        // Xử lý Theme (Giao diện)
        if (!theme) {
            // Nếu chưa có thì tạo object mặc định thay vì create liên tục để tránh lỗi performance
            res.locals.theme = { key: 'theme_settings', topBarShow: false };
        } else {
            res.locals.theme = theme;
        }

        // Xử lý Cart & Auth
        if (!req.session.cart) {
            req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
        }
        res.locals.isAuthenticated = req.session.isLoggedIn; 
        res.locals.cart = req.session.cart;
        
        // Truyền path để active menu
        res.locals.path = req.path;

        next();
    } catch (err) {
        console.error("❌ Lỗi Middleware toàn cục:", err);
        res.locals.globalScripts = { headerScripts: '', bodyScripts: '', footerScripts: '' };
        res.locals.theme = {};
        next();
    }
});

// ============================================================
// 5. ROUTES
// ============================================================
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);

// Xử lý 404
app.use(async (req, res, next) => {
    // Vẫn cần theme cho trang 404
    const theme = await Theme.findOne({ key: 'theme_settings' });
    res.status(404).render('404', { 
        pageTitle: 'Page Not Found', 
        path: '/404',
        theme: theme || {}
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));