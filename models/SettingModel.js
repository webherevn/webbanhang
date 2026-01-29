const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    // Key định danh (Dùng để tìm kiếm setting global)
    key: { type: String, default: 'global_settings', unique: true }, 

    // Các đoạn mã Script chèn vào giao diện
    headerScripts: { type: String, default: '' },     // Chèn trước </head> (Ví dụ: GA4, GTM)
    bodyScripts: { type: String, default: '' },       // Chèn ngay sau <body> (Ví dụ: Facebook Pixel noscript)
    footerScripts: { type: String, default: '' },     // Chèn trước </body> (Ví dụ: Chat widget)
    
    // [MỚI] Cấu hình hiển thị với công cụ tìm kiếm
    // true  = <meta name="robots" content="index, follow"> (Mặc định)
    // false = <meta name="robots" content="noindex, nofollow">
    enableIndexing: { type: Boolean, default: true },
    websiteName: { type: String, default: 'Fashion Store' },
    // [MỚI] GLOBAL SCHEMA SETTINGS
    schemaType: { type: String, default: 'Organization' }, // Organization hoặc Person
    orgLogo: { type: String, default: '' }, // Link ảnh Logo
    socialLinks: { type: [String], default: [] }, // Mảng chứa các link social (Facebook, Twitter...)
    updatedAt: { type: Date, default: Date.now }
}, { 
    timestamps: true // Tự động tạo thêm createdAt và cập nhật updatedAt
});

module.exports = mongoose.model('Setting', settingSchema);