const Post = require('../../models/PostModel');
const Product = require('../../models/ProductModel');
const Setting = require('../../models/SettingModel');

// 1. TRANG BẢNG TIN (DASHBOARD) - Cập nhật thống kê SEO
exports.getDashboard = async (req, res) => {
    try {
        // Chạy song song các truy vấn để tối ưu hiệu suất
        const [
            seoGoodPosts, seoOkPosts, seoBadPosts,
            seoGoodProds, seoOkProds, seoBadProds,
            totalPosts, totalProducts
        ] = await Promise.all([
            // Đếm cho Bài viết (Post)
            Post.countDocuments({ seoScore: { $gte: 80 } }),
            Post.countDocuments({ seoScore: { $gte: 50, $lt: 80 } }),
            Post.countDocuments({ seoScore: { $lt: 50 } }),
            // Đếm cho Sản phẩm (Product)
            Product.countDocuments({ seoScore: { $gte: 80 } }),
            Product.countDocuments({ seoScore: { $gte: 50, $lt: 80 } }),
            Product.countDocuments({ seoScore: { $lt: 50 } }),
            // Tổng số lượng
            Post.countDocuments(),
            Product.countDocuments()
        ]);

        // Tổng hợp dữ liệu SEO chung cho toàn website
        const seoData = [
            seoGoodPosts + seoGoodProds, // Tổng Tốt
            seoOkPosts + seoOkProds,     // Tổng Ổn
            seoBadPosts + seoBadProds    // Tổng Cần tối ưu
        ];

        res.render('admin/dashboard', {
            pageTitle: 'Bảng tin (Dashboard)',
            path: '/admin',
            seoData: seoData, // Gửi mảng dữ liệu sang View để vẽ biểu đồ
            totalPosts: totalPosts,
            totalProducts: totalProducts
        });
    } catch (err) {
        console.error("Lỗi Dashboard:", err);
        res.render('admin/dashboard', {
            pageTitle: 'Bảng tin (Dashboard)',
            path: '/admin',
            seoData: [0, 0, 0],
            totalPosts: 0,
            totalProducts: 0
        });
    }
};

// ==========================================
// 2. QUẢN LÝ CẤU HÌNH (SETTINGS) - GIỮ NGUYÊN
// ==========================================

// Lấy dữ liệu cũ để hiện lên ô nhập
exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'global_settings' });
        if (!settings) {
            settings = await Setting.create({ key: 'global_settings' });
        }
        res.render('admin/settings', {
            pageTitle: 'Cấu hình Script hệ thống',
            path: '/admin/settings',
            settings: settings
        });
    } catch (err) { 
        console.error(err);
        res.redirect('/admin'); 
    }
};

// Lưu dữ liệu mới khi nhấn nút
exports.postSettings = async (req, res) => {
    try {
        const { headerScripts, bodyScripts, footerScripts } = req.body;
        await Setting.findOneAndUpdate(
            { key: 'global_settings' },
            { headerScripts, bodyScripts, footerScripts },
            { upsert: true }
        );
        res.redirect('/admin/settings');
    } catch (err) { 
        console.error(err);
        res.redirect('/admin/settings'); 
    }
};