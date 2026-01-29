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
const Menu = require('./models/MenuModel'); // Model Menu

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
// 4. BIẾN TOÀN CỤC (MENU, NAVBAR, CART, THEME, SCRIPTS)
// --- PHẢI NẰM TRƯỚC ROUTES ---
// ============================================================
app.use(async (req, res, next) => {
    try {
        // [TỐI ƯU] Lấy Settings, Theme và Menu cùng lúc (Parallel Fetching)
        // LƯU Ý: Thêm .lean() vào Menu để lấy object thuần, giúp xử lý đệ quy
        const [settings, theme, rawMenus] = await Promise.all([
            Setting.findOne({ key: 'global_settings' }),
            Theme.findOne({ key: 'theme_settings' }),
            Menu.find({ isActive: true }).sort({ order: 1 }).lean() 
        ]);
        
        // 1. Xử lý Global Scripts
        res.locals.globalScripts = settings || { headerScripts: '', bodyScripts: '', footerScripts: '' };
        
        // 2. Xử lý Theme (Giao diện)
        if (!theme) {
            res.locals.theme = { key: 'theme_settings', topBarShow: false };
        } else {
            res.locals.theme = theme;
        }

        // 3. Xử lý Menu Động (BIẾN ĐỔI TỪ PHẲNG SANG CÂY)
        // Hàm đệ quy để tìm con của từng menu
        const buildMenuTree = (items, parentId = null) => {
            return items
                .filter(item => {
                    // So sánh ID cha (xử lý trường hợp null hoặc string/ObjectId)
                    const itemParent = item.parent ? String(item.parent) : null;
                    const targetParent = parentId ? String(parentId) : null;
                    return itemParent === targetParent;
                })
                .map(item => ({
                    ...item,
                    // Tiếp tục tìm con của item này (Đệ quy)
                    children: buildMenuTree(items, item._id) 
                }));
        };

        // Tạo cây menu bắt đầu từ gốc (parent = null)
        const menuTree = rawMenus ? buildMenuTree(rawMenus, null) : [];
        res.locals.mainMenu = menuTree; 

        // 4. Xử lý Cart & Auth
        if (!req.session.cart) {
            req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
        }
        res.locals.isAuthenticated = req.session.isLoggedIn; 
        res.locals.cart = req.session.cart;
        
        // 5. Truyền path hiện tại để active menu và highlight
        res.locals.path = req.path;
        res.locals.currentPath = req.path; 

        next();
    } catch (err) {
        console.error("❌ Lỗi Middleware toàn cục:", err);
        // Fallback an toàn nếu lỗi DB
        res.locals.globalScripts = { headerScripts: '', bodyScripts: '', footerScripts: '' };
        res.locals.theme = {};
        res.locals.mainMenu = []; 
        next();
    }
});

// ============================================================
// 5. ROUTES
// ============================================================
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);

// Xử lý 404
app.use((req, res, next) => {
    // Không cần query lại DB vì Middleware bên trên đã chạy và gán res.locals rồi
    // res.locals.theme và res.locals.mainMenu đã có sẵn

    res.status(404).render('404', { 
        pageTitle: 'Page Not Found', 
        path: '/404'
        // theme và mainMenu tự động được kế thừa từ res.locals
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));