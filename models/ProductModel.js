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
  variants: [{
    color: { type: String },
    size: { type: String },
    quantity: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Xóa đoạn productSchema.pre('save'...) đi nhé!

module.exports = mongoose.model('Product', productSchema);