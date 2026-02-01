const mongoose = require('mongoose');

const homepageSchema = new mongoose.Schema({
    // Chỉ cần 1 bản ghi duy nhất cho toàn bộ trang chủ
    name: { type: String, default: "Main Homepage" },
    sections: [{
        type: { 
            type: String, 
            enum: ['hero', 'features', 'product-grid', 'promo'], // Các loại gạch
            required: true 
        },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        data: {
            title: String,
            subtitle: String,
            buttonText: String,
            buttonLink: String,
            bgImage: String,
            items: Array // Dùng cho khối Features (icon/title/desc)
        }
    }]
});

module.exports = mongoose.model('Homepage', homepageSchema);