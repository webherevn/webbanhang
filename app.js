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
const Theme = require('./models/ThemeModel'); 
const Menu = require('./models/MenuModel'); 

// --- IMPORT MIDDLEWARES ---
// [MỚI] Import Middleware chuyển hướng 301
const redirectMiddleware = require('./middleware/redirectMiddleware');

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
// 2. MIDDLEWARE XỬ LÝ DỮ LIỆU & STATIC FILES
// ============================================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
// Static file được nạp ở đây, nên redirectMiddleware đặt ở dưới sẽ không chặn ảnh/css
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
// 4. BIẾN TOÀN CỤC (MENU, NAVBAR, CART, THEME, SCRIPTS)
// --- PHẢI NẰM TRƯỚC ROUTES ---
// ============================================================
app.use(async (req, res, next) => {
    try {
        // [TỐI ƯU] Lấy Settings, Theme và Menu cùng lúc (Parallel Fetching)
        const [settings, theme, rawMenus] = await Promise.all([
            Setting.findOne({ key: 'global_settings' }),
            Theme.findOne({ key: 'theme_settings' }),
            Menu.find({ isActive: true }).sort({ order: 1 }).lean() 
        ]);
        
        // 1. Xử lý Global Scripts & Settings
        // Gán cả cục settings vào biến global để dùng cho Footer (SĐT, Địa chỉ...)
        res.locals.settings = settings || {}; 
        res.locals.globalScripts = settings || { headerScripts: '', bodyScripts: '', footerScripts: '' };
        
        // 2. Xử lý Theme (Giao diện)
        if (!theme) {
            res.locals.theme = { key: 'theme_settings', topBarShow: false };
        } else {
            res.locals.theme = theme;
        }

        // 3. Xử lý Menu Động (BIẾN ĐỔI TỪ PHẲNG SANG CÂY)
        const buildMenuTree = (items, parentId = null) => {
            return items
                .filter(item => {
                    const itemParent = item.parent ? String(item.parent) : null;
                    const targetParent = parentId ? String(parentId) : null;
                    return itemParent === targetParent;
                })
                .map(item => ({
                    ...item,
                    children: buildMenuTree(items, item._id) 
                }));
        };

        const menuTree = rawMenus ? buildMenuTree(rawMenus, null) : [];
        res.locals.mainMenu = menuTree; 

        // 4. Xử lý Cart & Auth
        if (!req.session.cart) {
            req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
        }
        res.locals.isAuthenticated = req.session.isLoggedIn; 
        res.locals.cart = req.session.cart;
        
        // 5. Truyền path hiện tại
        res.locals.path = req.path;
        res.locals.currentPath = req.path; 

        next();
    } catch (err) {
        console.error("❌ Lỗi Middleware toàn cục:", err);
        res.locals.globalScripts = { headerScripts: '', bodyScripts: '', footerScripts: '' };
        res.locals.settings = {};
        res.locals.theme = {};
        res.locals.mainMenu = []; 
        next();
    }
});

// ============================================================
// [MỚI] KÍCH HOẠT REDIRECT 301 (SEO)
// Đặt ở đây để đảm bảo đã qua Static Files và Global Variables
// nhưng TRƯỚC khi vào Routes chính
// ============================================================
app.use(redirectMiddleware);

// ============================================================
// 5. ROUTES
// ============================================================
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);

// Xử lý 404
app.use((req, res, next) => {
    res.status(404).render('404', { 
        pageTitle: 'Page Not Found', 
        path: '/404'
    });
});


// routes/shop.routes.js
router.get('/sitemap.xml', seoController.generateSitemap);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));