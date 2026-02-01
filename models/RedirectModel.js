const mongoose = require('mongoose');

const redirectSchema = new mongoose.Schema({
    fromPath: { 
        type: String, 
        required: true, 
        unique: true, // Link cũ không được trùng nhau
        trim: true 
    },
    toPath: { 
        type: String, 
        required: true, 
        trim: true 
    },
    type: { type: Number, default: 301 }, // Mặc định là chuyển hướng vĩnh viễn (301)
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Tạo index để tìm kiếm cực nhanh (Vì middleware sẽ chạy mỗi khi khách load trang)
// redirectSchema.index({ fromPath: 1 });

module.exports = mongoose.model('Redirect', redirectSchema);