const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
    key: { type: String, default: 'theme_settings' }, // Khóa duy nhất để định danh cấu hình
    
    // --- 1. CHUNG (LOGO & FAVICON) ---
    logo: String,
    favicon: String,

    // --- 2. TOP BAR ---
    topBarShow: { type: Boolean, default: true },
    topBarText: String,
    topBarBgColor: { type: String, default: '#23282d' },

    // --- 3. HEADER ---
    headerLayout: { type: String, default: 'centered' }, 
    headerSticky: { type: Boolean, default: true },
    headerBottomHtml: String, // HTML tùy chỉnh dưới Header

    // --- 4. FOOTER (CHÂN TRANG) - PHẦN MỚI BỔ SUNG ---
    footerBgColor: { type: String, default: '#f8f9fa' },
    footerTextColor: { type: String, default: '#333333' },
    footerAbout: String,       // Giới thiệu ngắn về shop ở Footer
    footerCopyright: String,   // Dòng chữ bản quyền (Copyright)
    
    // --- 5. THÔNG TIN LIÊN HỆ (Thường dùng ở Footer/Contact) ---
    contactPhone: String,
    contactEmail: String,
    address: String,

    // --- 6. MẠNG XÃ HỘI ---
    socialFacebook: String,
    socialInstagram: String,
    socialTiktok: String,
    socialYoutube: String,

    // --- 7. TÙY CHỈNH NÂNG CAO ---
    customCss: String // CSS tùy chỉnh cho toàn trang
}, { timestamps: true });

module.exports = mongoose.model('Theme', themeSchema);