const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // --- 1. THÔNG TIN CƠ BẢN ---
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true }, // Slug duy nhất cho SEO
  description: { type: String },
  
  // Liên kết sang bảng Category để lấy dữ liệu danh mục chuẩn xác hơn
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  // --- 2. GIÁ & KHO HÀNG CƠ BẢN ---
  basePrice: { type: Number, required: true }, // Giá hiển thị (hoặc giá thấp nhất)
  salePrice: { type: Number, default: 0 },     // Giá khuyến mãi (nếu có)
  
  // --- 3. HÌNH ẢNH ---
  thumbnail: { type: String }, 
  gallery: [{ type: String }], // Đổi 'images' thành 'gallery' để khớp với Controller & View

  // --- 4. CẤU HÌNH BIẾN THỂ (VARIANTS - SHOPEE STYLE) ---
  hasVariants: { type: Boolean, default: false }, // Đánh dấu nếu sản phẩm có nhiều phân loại
  variants: [{
    color: { type: String },       // Màu sắc (Đỏ, Xanh...)
    size: { type: String },        // Kích thước (S, M, 39, 40...)
    price: { type: Number },       // Giá riêng cho biến thể này
    stock: { type: Number, default: 0 }, // Số lượng tồn kho riêng
    sku: { type: String }          // Mã SKU để quản lý kho
  }],

  // --- 5. SEO & MARKETING ---
  seoTitle: { type: String, trim: true },
  seoDescription: { type: String, trim: true },
  focusKeyword: { type: String },
  seoScore: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, // Đếm lượt xem sản phẩm

  // --- 6. TRẠNG THÁI ---
  isActive: { type: Boolean, default: true } // Ẩn/Hiện sản phẩm
}, { timestamps: true });

// Đã xóa pre('save') theo yêu cầu của bạn

module.exports = mongoose.model('Product', productSchema);