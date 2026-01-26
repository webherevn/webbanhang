// controllers/shop/shopController.js
const Product = require('../../models/ProductModel'); // Nhớ gọi đúng tên Model
const Category = require('../../models/CategoryModel');

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
    const slug = req.params.productId;
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

exports.getCategoryProducts = async (req, res) => {
    try {
        const slug = req.params.slug;
        
        // --- IN LOG KIỂM TRA ---
        console.log("1. Slug trên URL nhận được là:", slug);
        console.log("   (Độ dài chuỗi):", slug.length); // Để soi xem có khoảng trắng thừa không

        // 1. Tìm Danh mục
        // Dùng trim() để cắt khoảng trắng thừa nếu có
        const category = await Category.findOne({ slug: slug.trim() });
        
        console.log("2. Kết quả tìm trong DB:", category);

        if (!category) {
            console.log("❌ KHÔNG TÌM THẤY TRONG DB!");
            return res.status(404).render('404', { pageTitle: 'Lỗi', path: '/404' });
        }

        // ... đoạn code tìm sản phẩm phía dưới giữ nguyên ...
        
        const products = await Product.find({ category: slug }).sort({ createdAt: -1 });

        res.render('shop/category-products', { 
            pageTitle: category.name,
            path: '/category',
            category: category,
            products: products
        });

    } catch (err) {
        console.log("❌ LỖI CODE:", err);
        res.redirect('/');
    }
};