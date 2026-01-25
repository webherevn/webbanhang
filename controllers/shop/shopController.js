// controllers/shop/shopController.js
const Product = require('../../models/ProductModel'); // Nhớ gọi đúng tên Model

exports.getHomepage = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm, sắp xếp mới nhất lên đầu
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    
    // Render ra giao diện và gửi kèm biến 'products'
    res.render('shop/home', { 
      pageTitle: 'Trang chủ - Fashion Shop',
      products: products 
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Lỗi tải trang chủ');
  }
};