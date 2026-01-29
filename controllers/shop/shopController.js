const Product = require('../../models/ProductModel'); 
const Category = require('../../models/CategoryModel');
const Page = require('../../models/PageModel');
const Theme = require('../../models/ThemeModel'); 

// ============================================================
// 1. TRANG CHỦ
// ============================================================
exports.getHomepage = async (req, res) => {
  try {
    const [theme, products] = await Promise.all([
      Theme.findOne(),
      Product.find().sort({ createdAt: -1 }).limit(12) // Nên limit số lượng sp trang chủ
    ]);

    res.render('shop/home', { 
      pageTitle: 'Trang chủ - Fashion Shop',
      path: '/',
      products: products,
      theme: theme
    });
  } catch (err) {
    console.log("❌ Lỗi trang chủ:", err);
    res.status(500).render('404', { pageTitle: 'Lỗi', path: '/404' });
  }
};

// ============================================================
// 2. XEM SẢN PHẨM THEO DANH MỤC (ĐÃ SỬA LỖI)
// ============================================================
exports.getCategoryProducts = async (req, res) => {
    try {
        const slug = req.params.slug;
        
        // 1. Tìm Danh mục và Theme
        const [category, theme] = await Promise.all([
            Category.findOne({ slug: slug }), // Bỏ .trim() nếu không chắc chắn, slug thường không có space
            Theme.findOne()
        ]);
        
        // 2. Nếu không thấy danh mục -> 404
        if (!category) {
            console.log("❌ Không tìm thấy danh mục:", slug);
            return res.status(404).render('404', { 
                pageTitle: 'Không tìm thấy danh mục', 
                path: '/404',
                theme: theme 
            });
        }

        // 3. Tìm sản phẩm dựa trên ID của danh mục (QUAN TRỌNG: SỬA category._id)
        const products = await Product.find({ category: category._id }).sort({ createdAt: -1 });

        res.render('shop/category-products', { // Đảm bảo tên file view này đúng với file bạn tạo
            pageTitle: category.name,
            path: '/category', // Có thể để active menu
            category: category,
            products: products,
            theme: theme 
        });

    } catch (err) {
        console.log("❌ Lỗi xem danh mục:", err);
        res.status(500).render('404', { pageTitle: 'Lỗi hệ thống', path: '/404' });
    }
};

// ============================================================
// 3. XEM CHI TIẾT SẢN PHẨM
// ============================================================
exports.getProductDetail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const theme = await Theme.findOne(); 

        const product = await Product.findOne({ slug: slug });

        if (!product) {
            return res.status(404).render('404', { 
                pageTitle: 'Không tìm thấy sản phẩm', 
                path: '/404',
                theme: theme 
            });
        }

        const relatedProducts = await Product.find({ 
            category: product.category, 
            _id: { $ne: product._id } 
        }).limit(4);

        res.render('shop/product-detail', {
            pageTitle: product.name,
            path: '/products',
            product: product,
            relatedProducts: relatedProducts,
            theme: theme 
        });

    } catch (err) {
        console.error("❌ Lỗi chi tiết sản phẩm:", err);
        res.status(500).render('404', { pageTitle: 'Lỗi', path: '/404' });
    }
};

// ============================================================
// 4. DANH SÁCH TẤT CẢ SẢN PHẨM
// ============================================================
exports.getProducts = async (req, res) => {
    try {
        const [products, theme] = await Promise.all([
            Product.find().sort({ createdAt: -1 }),
            Theme.findOne()
        ]);

        res.render('shop/product-list', {
            pageTitle: 'Tất cả sản phẩm',
            path: '/products',
            products: products,
            theme: theme 
        });
    } catch (err) {
        console.log("❌ Lỗi lấy danh sách sản phẩm:", err);
        res.redirect('/');
    }
};

// ============================================================
// 5. CHI TIẾT TRANG TĨNH
// ============================================================
exports.getPageDetail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const [page, theme] = await Promise.all([
            Page.findOne({ slug: slug, isActive: true }),
            Theme.findOne()
        ]);

        if (!page) {
            return res.status(404).render('404', { 
                pageTitle: 'Trang không tồn tại', 
                path: '/404',
                theme: theme
            });
        }

        res.render('shop/page-detail', {
            pageTitle: page.title,
            path: '/pages',
            page: page,
            theme: theme 
        });
    } catch (err) {
        console.error("Lỗi hiển thị trang tĩnh:", err);
        res.redirect('/');
    }
};