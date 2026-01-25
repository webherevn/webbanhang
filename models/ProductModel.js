const mongoose = require('mongoose');
const slugify = require('slugify'); // Đảm bảo đã npm install slugify

const productSchema = new mongoose.Schema({
  // 1. Thông tin cơ bản
  name: { type: String, required: true, trim: true },
  
  // SỬA: Bỏ unique: true tạm thời để tránh lỗi "Duplicate Key" khi test
  slug: { type: String }, 
  
  description: { type: String },
  
  // 2. Phân loại & Giá
  category: { type: String, required: true },
  basePrice: { type: Number, required: true },
  
  // 3. Hình ảnh
  thumbnail: { type: String }, 
  images: [{ type: String }],

  // 4. Biến thể
  variants: [{
    color: { type: String },
    size: { type: String },
    quantity: { type: Number, default: 0 }
  }],

  // 5. Trạng thái
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// --- ĐOẠN HOOK TẠO SLUG ---
productSchema.pre('save', function(next) {
  // Log ra để xem nó có chạy vào đây không
  console.log('--- Đang chạy Hook pre-save cho sản phẩm:', this.name);

  // Kiểm tra kỹ: Phải có name và name phải là chuỗi
  if (this.name && typeof this.name === 'string') {
    try {
        // Tạo slug
        this.slug = slugify(this.name, { lower: true, strict: true });
        console.log('--- Đã tạo Slug thành công:', this.slug);
    } catch (e) {
        console.log('--- Lỗi khi tạo Slug:', e);
        // Nếu lỗi tạo slug, ta dùng tạm timestamp để không bị crash
        this.slug = 'san-pham-' + Date.now();
    }
  }
  
  next();
});

module.exports = mongoose.model('Product', productSchema);