const mongoose = require('mongoose');

// Định nghĩa Schema (Chỉ khai báo MỘT LẦN duy nhất)
const pageSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    thumbnail: { 
        type: String // Đường dẫn ảnh đại diện trang
    },
    
    // [MỚI] CUSTOM SCHEMA CHO TỪNG TRANG (Detail Level)
    // Lưu đoạn mã JSON-LD tùy chỉnh cho trang này
    customSchema: { 
        type: String, 
        default: '' 
    },
    // [MỚI] SOCIAL SEO (OPEN GRAPH)
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' } ,

    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// Xuất Model
module.exports = mongoose.model('Page', pageSchema);