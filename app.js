const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- QUAN TRỌNG: NẠP BIẾN MÔI TRƯỜNG NGAY LẬP TỨC ---
dotenv.config(); 

const session = require('express-session');
const MongoStore = require('connect-mongo'); 
const path = require('path');

// --- IMPORT MODELS ---
const Setting = require('./models/SettingModel'); // Đưa lên đầu để quản lý

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
// 4. BIẾN TOÀN CỤC (NAVBAR, CART, WPCODE)
// ============================================================

// --- ĐOẠN FIX LỖI: Chuyển middleware Script lên trước Routes ---
app.use(async (req, res, next) => {
    try {
        let settings = await Setting.findOne({ key: 'global_settings' });
        
        // Nếu chưa có trong DB, tạo object rỗng để EJS không bị lỗi undefined
        if (!settings) {
            settings = { headerScripts: '', bodyScripts: '', footerScripts: '' };
        }
        
        res.locals.globalScripts = settings; 
        
        // Tiện tay xử lý luôn phần Cart cũ của bạn
        if (!req.session.cart) {
            req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
        }
        res.locals.isAuthenticated = req.session.isLoggedIn; 
        res.locals.cart = req.session.cart;
        
        next();
    } catch (err) {
        console.error("❌ Lỗi load scripts:", err);
        // Backup để web không sập nếu DB lỗi
        res.locals.globalScripts = { headerScripts: '', bodyScripts: '', footerScripts: '' };
        next();
    }
});

// ============================================================
// 5. ROUTES (Phải nằm SAU middleware biến toàn cục)
// ============================================================
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);

// Xử lý 404 (Luôn để ở cuối cùng của các Route)
app.use((req, res, next) => {
    res.status(404).render('404', { 
        pageTitle: 'Page Not Found', 
        path: '/404'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));