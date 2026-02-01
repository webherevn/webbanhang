const mongoose = require('mongoose');

// 1. Định nghĩa Schema cho từng Khối (Section)
// Việc tách riêng giúp Mongoose quản lý mảng con tốt hơn
const SectionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['hero', 'features', 'product-grid', 'promo'], 
        required: true 
    },
    isActive: { type: Boolean, default: true },
    // data để Mixed hoặc Object để linh hoạt cho từng loại khối
    data: {
        title: String,
        subtitle: String,
        buttonText: String,
        buttonLink: String,
        bgImage: String,
        categoryId: String, // Thêm để lọc sản phẩm
        limit: { type: Number, default: 8 },
        items: Array 
    }
}, { _id: true }); // Đảm bảo mỗi khối luôn có một _id riêng biệt

// 2. Định nghĩa Schema cho Trang chủ
const homepageSchema = new mongoose.Schema({
    name: { type: String, default: "Main Homepage" },
    sections: [SectionSchema] // Nhúng mảng Schema con vào đây
}, { timestamps: true });

module.exports = mongoose.model('Homepage', homepageSchema);