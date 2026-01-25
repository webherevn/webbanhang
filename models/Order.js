const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Thông tin khách hàng
  user: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    note: { type: String }
  },
  
  // Chi tiết đơn hàng (Lưu lại snapshot tại thời điểm mua)
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    variant: { type: String }, // VD: "Xanh-L"
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
  }],

  // Tổng tiền
  totalPrice: { type: Number, required: true },

  // Trạng thái đơn hàng
  status: {
    type: String,
    enum: ['Pending', 'Shipping', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);