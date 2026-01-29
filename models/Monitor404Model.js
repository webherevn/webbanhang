const mongoose = require('mongoose');

const monitor404Schema = new mongoose.Schema({
    path: { 
        type: String, 
        required: true, 
        unique: true // Mỗi đường dẫn lỗi chỉ lưu 1 bản ghi
    },
    hits: { 
        type: Number, 
        default: 1 // Đếm số lần gặp lỗi
    },
    lastAccessed: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Monitor404', monitor404Schema);