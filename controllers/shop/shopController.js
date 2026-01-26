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

// ... (Code cũ của getHomepage giữ nguyên)

exports.getProductDetail = async (req, res) => {
  try {
    // Tìm sản phẩm dựa vào slug trên URL (ví dụ: ao-thun-mua-he)
    const slug = req.params.slug;
    const product = await Product.findOne({ slug: slug, isActive: true });

    if (!product) {
      return res.redirect('/'); // Không thấy thì về trang chủ
    }

    res.render('shop/product-detail', {
      pageTitle: product.name,
      product: product
    });

  } catch (err) {
    console.log(err);
    res.status(500).send('Lỗi tải trang chi tiết');
  }
};