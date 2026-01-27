const mongoose = require('mongoose');
// KHÔNG CẦN import slugify ở đây nữa
// KHÔNG CẦN đoạn code pre('save') nữa

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true }, // Vẫn giữ trường slug
  description: { type: String },
  category: { type: String, required: true },
  basePrice: { type: Number, required: true },
  thumbnail: { type: String }, 
  images: [{ type: String }],
  // Thêm vào postSchema hoặc productSchema
  seoTitle: { type: String },
  seoDescription: { type: String },
  focusKeyword: { type: String },
  seoScore: { type: Number, default: 0 },
  // Thêm vào Schema của Post và Product
  seoTitle: { type: String, trim: true },
  seoDescription: { type: String, trim: true },
  focusKeyword: { type: String },
  variants: [{
    color: { type: String },
    size: { type: String },
    quantity: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Xóa đoạn productSchema.pre('save'...) đi nhé!

module.exports = mongoose.model('Product', productSchema);