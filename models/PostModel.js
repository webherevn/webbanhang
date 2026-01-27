const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true }, // URL bài viết
    content: { type: String, required: true }, // Nội dung (HTML)
    summary: { type: String }, // Mô tả ngắn
    thumbnail: { type: String }, // Ảnh đại diện
    
// Thêm vào postSchema hoặc productSchema
    seoTitle: { type: String },
    seoDescription: { type: String },
    focusKeyword: { type: String },
    seoScore: { type: Number, default: 0 },

    // Liên kết với chuyên mục bài viết
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BlogCategory',
        required: true 
    },
    
    author: { type: String, default: 'Admin' },
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);