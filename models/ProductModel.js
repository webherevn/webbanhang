const mongoose = require('mongoose');
const slugify = require('slugify'); // Nhớ chạy: npm install slugify

const productSchema = new mongoose.Schema({
  // Thông tin cơ bản
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true }, // URL thân thiện
  description: { type: String },
  
  // Phân loại & Giá
  category: { type: String, required: true },
  basePrice: { type: Number, required: true },
  
  // Hình ảnh
  thumbnail: { type: String }, 
  images: [{ type: String }],

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

// --- QUAN TRỌNG: ĐOẠN CODE BẠN ĐANG THIẾU ---
// "Thần chú" này sẽ chạy TRƯỚC khi lưu vào Database
productSchema.pre('save', function(next) {
  // Nếu có tên sản phẩm, hãy tạo slug từ cái tên đó
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
// ----------------------------------------------

module.exports = mongoose.model('Product', productSchema);