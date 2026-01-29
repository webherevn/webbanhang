const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    // Key định danh (Dùng để tìm kiếm setting global)
    key: { type: String, default: 'global_settings', unique: true }, 

    // Các đoạn mã Script chèn vào giao diện
    headerScripts: { type: String, default: '' },     // Chèn trước </head>
    bodyScripts: { type: String, default: '' },       // Chèn ngay sau <body>
    footerScripts: { type: String, default: '' },     // Chèn trước </body>
    
    // Cấu hình hiển thị với công cụ tìm kiếm
    enableIndexing: { type: Boolean, default: true },
    websiteName: { type: String, default: 'Fashion Store' },

    // GLOBAL SCHEMA SETTINGS
    schemaType: { type: String, default: 'Organization' }, // Organization hoặc Person
    orgLogo: { type: String, default: '' }, // Link ảnh Logo
    socialLinks: { type: [String], default: [] }, // Mảng chứa các link social

    // [MỚI] NỘI DUNG FILE ROBOTS.TXT
    // Cho phép bạn tùy chỉnh quy tắc chặn/cho phép bot từ Admin
    robotsContent: { 
        type: String, 
        default: "User-agent: *\nDisallow: /admin/\nDisallow: /cart/\nDisallow: /checkout/\n\nSitemap: https://webbanhang-es90.onrender.com/sitemap.xml" 
    },

    updatedAt: { type: Date, default: Date.now }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Setting', settingSchema);