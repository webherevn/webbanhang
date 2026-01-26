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
    // Lấy tất cả, không cần lọc active nữa
const products = await Product.find().sort({ createdAt: -1 });
    
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
        const slug = req.params.slug;
        
        // 1. In ra Slug nhận được
        console.log("👉 1. Slug từ URL:", slug);

        // 2. Tìm trong DB (Lưu ý: Tôi đã bỏ isActive: true để test)
        const product = await Product.findOne({ slug: slug });

        // 3. Kiểm tra kết quả
        console.log("👉 2. Kết quả tìm kiếm:", product);

        if (!product) {
            // Nếu không thấy -> In ra màn hình lý do
            return res.send(`
                <h1 style="color: red">LỖI: KHÔNG TÌM THẤY SẢN PHẨM TRONG DB</h1>
                <p>Slug tìm kiếm: <b>${slug}</b></p>
                <p>Hãy kiểm tra lại trong Admin xem Slug của sản phẩm này có khớp không?</p>
            `);
        }

        // 4. Nếu tìm thấy -> Thử hiển thị JSON sản phẩm (Chưa render View vội)
        return res.send(`
            <h1 style="color: green">TÌM THẤY SẢN PHẨM!</h1>
            <p>Tên: ${product.name}</p>
            <p>Giá: ${product.basePrice}</p>
            <p>Ảnh: ${product.thumbnail}</p>
            <hr>
            <h3>Nếu bạn nhìn thấy dòng này nghĩa là:</h3>
            <ul>
                <li>Controller hoạt động TỐT.</li>
                <li>Database hoạt động TỐT.</li>
                <li>Lỗi 404 trước đó là do file <b>views/shop/product-detail.ejs</b> bị sai tên hoặc lỗi code bên trong.</li>
            </ul>
        `);

        // (Tạm thời khóa đoạn render lại để test DB trước)
        /*
        const relatedProducts = await Product.find({ 
            category: product.category, 
            _id: { $ne: product._id } 
        }).limit(4);

        res.render('shop/product-detail', {
            pageTitle: product.name,
            path: '/products',
            product: product,
            relatedProducts: relatedProducts
        });
        */

    } catch (err) {
        console.error("❌ Lỗi Code:", err);
        res.send(`<h1>LỖI SERVER (CATCH):</h1><pre>${err.stack}</pre>`);
    }
};