const Post = require('../../models/PostModel');
const Product = require('../../models/ProductModel');
const Setting = require('../../models/SettingModel');
const Theme = require('../../models/ThemeModel'); // BỔ SUNG: Import model Theme

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

        const seoData = [
            seoGoodPosts + seoGoodProds,
            seoOkPosts + seoOkProds,
            seoBadPosts + seoBadProds
        ];

        res.render('admin/dashboard', {
            pageTitle: 'Bảng tin (Dashboard)',
            path: '/admin',
            seoData: seoData,
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
// 2. CẤU HÌNH GIAO DIỆN (CUSTOMIZE) - MỚI BỔ SUNG
// ==========================================

// Hiển thị trang chỉnh sửa giao diện
exports.getCustomize = async (req, res) => {
    try {
        let theme = await Theme.findOne({ key: 'theme_settings' });
        if (!theme) {
            theme = await Theme.create({ key: 'theme_settings' });
        }
        res.render('admin/customize', {
            pageTitle: 'Tùy biến giao diện',
            path: '/admin/customize',
            theme: theme
        });
    } catch (err) {
        console.error("Lỗi getCustomize:", err);
        res.redirect('/admin');
    }
};

// Lưu dữ liệu tùy biến giao diện (bao gồm Footer)
exports.postCustomize = async (req, res) => {
    try {
        const {
            logo, favicon, topBarText, topBarBgColor, 
            headerBottomHtml, customCss, footerBgColor, 
            footerTextColor, footerAbout, footerCopyright,
            contactPhone, contactEmail, address,
            socialFacebook, socialInstagram, socialTiktok, socialYoutube
        } = req.body;

        // Xử lý các nút gạt (Checkbox/Switch thường trả về 'on' hoặc undefined)
        const topBarShow = req.body.topBarShow === 'on';
        const headerSticky = req.body.headerSticky === 'on';

        await Theme.findOneAndUpdate(
            { key: 'theme_settings' },
            {
                logo, favicon, topBarShow, topBarText, topBarBgColor,
                headerSticky, headerBottomHtml, customCss,
                footerBgColor, footerTextColor, footerAbout, footerCopyright,
                contactPhone, contactEmail, address,
                socialFacebook, socialInstagram, socialTiktok, socialYoutube
            },
            { upsert: true }
        );

        res.redirect('/admin/customize?status=success');
    } catch (err) {
        console.error("Lỗi postCustomize:", err);
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
            settings: settings
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
        res.redirect('/admin/settings');
    } catch (err) { 
        console.error(err);
        res.redirect('/admin/settings'); 
    }
};