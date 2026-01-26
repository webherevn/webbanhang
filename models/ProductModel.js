// models/ProductModel.js
const mongoose = require('mongoose');
const slugify = require('slugify'); 

// ⚠️ QUAN TRỌNG: TUYỆT ĐỐI KHÔNG ĐƯỢC CÓ DÒNG 'require' Product Ở ĐÂY
// Nếu có dòng "const Product = require..." thì XÓA NGAY.

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String },
  description: { type: String },
  category: { type: String, required: true },
  basePrice: { type: Number, required: true },
  thumbnail: { type: String }, 
  images: [{ type: String }],
  variants: [{
    color: { type: String },
    size: { type: String },
    quantity: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hook tạo slug tự động
productSchema.pre('save', function(next) {
  if (this.name) {
    try {
      this.slug = slugify(this.name, { lower: true, strict: true });
    } catch (e) {
      this.slug = 'sp-' + Date.now();
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);