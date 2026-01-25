const mongoose = require('mongoose');
const slugify = require('slugify');
const productSchema = new mongoose.Schema({
  // Thông tin cơ bản
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true }, // URL thân thiện
  description: { type: String },
  
  // Phân loại & Giá
  category: { type: String, required: true },
  basePrice: { type: Number, required: true },
  
  // Hình ảnh
  thumbnail: { type: String }, // Ảnh đại diện
  images: [{ type: String }],  // Album ảnh

  // Biến thể (Màu/Size)
  variants: [{
    color: { type: String },
    size: { type: String },
    quantity: { type: Number, default: 0 }
  }],

  // Trạng thái
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Tự động tạo index tìm kiếm
productSchema.index({ name: 'text' }); 

module.exports = mongoose.model('Product', productSchema);