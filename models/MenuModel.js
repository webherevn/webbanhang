const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Tên hiển thị (VD: Trang chủ)
    link: { type: String, required: true }, // Đường dẫn (VD: /products)
    order: { type: Number, default: 0 },    // Thứ tự sắp xếp
    // --- BẠN ĐANG THIẾU DÒNG NÀY ---
    // Trường này dùng để xác định menu này là con của ai
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', default: null },
    // -------------------------------
    isActive: { type: Boolean, default: true } // Ẩn/Hiện
});

module.exports = mongoose.model('Menu', menuSchema);