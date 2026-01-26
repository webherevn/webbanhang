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
    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Xuất Model
module.exports = mongoose.model('Page', pageSchema);