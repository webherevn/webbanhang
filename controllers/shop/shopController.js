// controllers/shop/shopController.js
const Product = require('../../models/ProductModel'); 
const Category = require('../../models/CategoryModel');

// ============================================================
// 1. TRANG CHỦ
// ============================================================
exports.getHomepage = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm, sắp xếp mới nhất lên đầu
    // isActive: true -> Chỉ lấy sản phẩm đang hoạt động
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.render('shop/home', { 
      pageTitle: 'Trang chủ - Fashion Shop',
      path: '/',
      products: products 
    });
  } catch (err) {
    console.log("❌ Lỗi trang chủ:", err);
    res.status(500).render('404', { pageTitle: 'Lỗi', path: '/404' });
  }
};

// ============================================================
// 2. XEM SẢN PHẨM THEO DANH MỤC
// ============================================================
exports.getCategoryProducts = async (req, res) => {
    try {
        const slug = req.params.slug;
        
        // Tìm Danh mục
        const category = await Category.findOne({ slug: slug.trim() });
        
        if (!category) {
            console.log("❌ Không tìm thấy danh mục:", slug);
            return res.status(404).render('404', { pageTitle: 'Không tìm thấy danh mục', path: '/404' });
        }

        // Tìm sản phẩm thuộc danh mục đó
        const products = await Product.find({ category: slug }).sort({ createdAt: -1 });

        res.render('shop/category-products', { 
            pageTitle: category.name,
            path: '/category',
            category: category,
            products: products
        });

    } catch (err) {
        console.log("❌ Lỗi xem danh mục:", err);
        res.status(500).render('404', { pageTitle: 'Lỗi', path: '/404' });
    }
};

// ============================================================
// 3. XEM CHI TIẾT SẢN PHẨM (Đã sửa lỗi trùng lặp)
// ============================================================
exports.getProductDetail = async (req, res) => {
    try {
        const slug = req.params.slug; // Lấy slug từ URL
        console.log("👉 Đang xem sản phẩm:", slug);

        // 1. Tìm sản phẩm theo Slug
        const product = await Product.findOne({ slug: slug });

        // 2. Nếu không có -> Trang 404
        if (!product) {
            console.log("❌ Không tìm thấy sản phẩm trong DB");
            return res.status(404).render('404', { 
                pageTitle: 'Không tìm thấy sản phẩm', 
                path: '/404' 
            });
        }

        // 3. Tìm các sản phẩm liên quan (Cùng danh mục, trừ chính nó ra)
        const relatedProducts = await Product.find({ 
            category: product.category, 
            _id: { $ne: product._id } 
        }).limit(4);

        // 4. Render View (Quan trọng: Đảm bảo file views/shop/product-detail.ejs tồn tại)
        res.render('shop/product-detail', {
            pageTitle: product.name,
            path: '/products',
            product: product,
            relatedProducts: relatedProducts
        });

    } catch (err) {
        console.error("❌ LỖI CHẾT NGƯỜI:", err); 
        // Thay vì redirect hay render 404, hãy in lỗi ra màn hình:
        res.status(500).send(`
            <h1>LỖI SERVER CHI TIẾT:</h1>
            <h3>${err.message}</h3>
            <pre>${err.stack}</pre>
        `);
    }
};