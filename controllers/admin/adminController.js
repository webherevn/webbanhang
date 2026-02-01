const Post = require('../../models/PostModel');
const Product = require('../../models/ProductModel');
const Setting = require('../../models/SettingModel');
const Theme = require('../../models/ThemeModel');
// controllers/admin/homepageController.js
const Homepage = require('../../models/HomepageModel');

// ==========================================
// 1. TRANG BẢNG TIN (DASHBOARD)
// ==========================================
exports.getDashboard = async (req, res) => {
    try {
        const [
            seoGoodPosts, seoOkPosts, seoBadPosts,
            seoGoodProds, seoOkProds, seoBadProds,
            totalPosts, totalProducts
        ] = await Promise.all([
            Post.countDocuments({ seoScore: { $gte: 80 } }),
            Post.countDocuments({ seoScore: { $gte: 50, $lt: 80 } }),
            Post.countDocuments({ seoScore: { $lt: 50 } }),
            Product.countDocuments({ seoScore: { $gte: 80 } }),
            Product.countDocuments({ seoScore: { $gte: 50, $lt: 80 } }),
            Product.countDocuments({ seoScore: { $lt: 50 } }),
            Post.countDocuments(),
            Product.countDocuments()
        ]);

        res.render('admin/dashboard', {
            pageTitle: 'Bảng tin (Dashboard)',
            path: '/admin',
            seoData: [seoGoodPosts + seoGoodProds, seoOkPosts + seoOkProds, seoBadPosts + seoBadProds],
            totalPosts,
            totalProducts
        });
    } catch (err) {
        console.error("Lỗi Dashboard:", err);
        res.render('admin/dashboard', {
            pageTitle: 'Bảng tin (Dashboard)',
            path: '/admin',
            seoData: [0, 0, 0], totalPosts: 0, totalProducts: 0
        });
    }
};

// ==========================================
// 2. CẤU HÌNH GIAO DIỆN (CUSTOMIZE)
// ==========================================

exports.getCustomize = async (req, res) => {
    try {
        let theme = await Theme.findOne({ key: 'theme_settings' });
        if (!theme) {
            theme = await Theme.create({ key: 'theme_settings' });
        }
        res.render('admin/customize', {
            pageTitle: 'Tùy biến giao diện',
            path: '/admin/customize',
            theme: theme,
            query: req.query // Hỗ trợ hiển thị thông báo thành công
        });
    } catch (err) {
        console.error("Lỗi getCustomize:", err);
        res.redirect('/admin');
    }
};

exports.postCustomize = async (req, res) => {
    try {
        // 1. Tạo object chứa dữ liệu text từ form
        // Chúng ta lấy toàn bộ body, sau đó xử lý các trường đặc biệt
        const updateData = { ...req.body };

        // 2. XỬ LÝ ẢNH TỪ CLOUDINARY (req.files thay vì req.body)
        if (req.files) {
            if (req.files['logo'] && req.files['logo'][0]) {
                updateData.logo = req.files['logo'][0].path;
            } else {
                delete updateData.logo; // Không xóa logo cũ nếu không có file mới
            }
            
            if (req.files['favicon'] && req.files['favicon'][0]) {
                updateData.favicon = req.files['favicon'][0].path;
            } else {
                delete updateData.favicon; // Không xóa favicon cũ nếu không có file mới
            }
        }

        // 3. Xử lý các nút gạt Checkbox (Boolean)
        updateData.topBarShow = req.body.topBarShow === 'on';
        updateData.headerSticky = req.body.headerSticky === 'on';

        // 4. LƯU VÀO DATABASE
        // { new: true } để trả về dữ liệu sau khi update
        const updatedTheme = await Theme.findOneAndUpdate(
            { key: 'theme_settings' },
            updateData,
            { upsert: true, new: true }
        );

        console.log("✅ Cập nhật Theme thành công");
        res.redirect('/admin/customize?status=success');

    } catch (err) {
        console.error("❌ Lỗi postCustomize:", err);
        res.redirect('/admin/customize?status=error');
    }
};

// ==========================================
// 3. QUẢN LÝ CẤU HÌNH SCRIPT (SETTINGS)
// ==========================================

exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'global_settings' });
        if (!settings) {
            settings = await Setting.create({ key: 'global_settings' });
        }
        res.render('admin/settings', {
            pageTitle: 'Cấu hình Script hệ thống',
            path: '/admin/settings',
            settings: settings,
            query: req.query
        });
    } catch (err) { 
        console.error(err);
        res.redirect('/admin'); 
    }
};

exports.postSettings = async (req, res) => {
    try {
        const { headerScripts, bodyScripts, footerScripts } = req.body;
        await Setting.findOneAndUpdate(
            { key: 'global_settings' },
            { headerScripts, bodyScripts, footerScripts },
            { upsert: true }
        );
        res.redirect('/admin/settings?status=success');
    } catch (err) { 
        console.error(err);
        res.redirect('/admin/settings?status=error'); 
    }
};

exports.getHomepageBuilder = async (req, res) => {
    let homepage = await Homepage.findOne();
    if (!homepage) homepage = await Homepage.create({ sections: [] });
    
    res.render('admin/homepage/builder', {
        pageTitle: 'Trang chủ Builder',
        path: '/admin/homepage',
        sections: homepage.sections.sort((a,b) => a.order - b.order)
    });
};

// Hàm cập nhật thứ tự (Sẽ gọi qua AJAX khi kéo thả)
exports.updateSectionOrder = async (req, res) => {
    const { orders } = req.body; // Mảng chứa ID và vị trí mới
    const homepage = await Homepage.findOne();
    
    orders.forEach(item => {
        const section = homepage.sections.id(item.id);
        if (section) section.order = item.newOrder;
    });
    
    await homepage.save();
    res.json({ success: true });
};