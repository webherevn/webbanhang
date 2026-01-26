const mongoose = require('mongoose');

const blogCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true }, // URL chuyên mục
    image: { type: String },       // Thêm ảnh
    description: { type: String },
    
}, { timestamps: true });

module.exports = mongoose.model('BlogCategory', blogCategorySchema);