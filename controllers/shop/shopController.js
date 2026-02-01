const Product = require('../../models/ProductModel');
const Category = require('../../models/CategoryModel');
const Page = require('../../models/PageModel');
const Theme = require('../../models/ThemeModel');
const Homepage = require('../../models/HomepageModel');

// ============================================================
// 1. TRANG CHỦ DỰA TRÊN BUILDER (TỐI ƯU HIỆU NĂNG)
// ============================================================
exports.getHomepage = async (req, res) => {
    try {
        // Lấy bản ghi duy nhất. KHÔNG dùng .sort() ở đây vì ta muốn lấy thứ tự vật lý của mảng
        const homepage = await Homepage.findOne().lean();
        const theme = await Theme.findOne().lean();

        if (homepage && homepage.sections) {
            for (let section of homepage.sections) {
                if (section.type === 'product-grid' && section.isActive) {
                    // Đổ dữ liệu sản phẩm vào từng khối
                    section.products = await Product.find({ 
                        category: section.data.categoryId || { $exists: true }, 
                        isActive: true 
                    })
                    .sort({ createdAt: -1 })
                    .limit(parseInt(section.data.limit) || 8)
                    .lean();
                }
            }
        }

        res.render('shop/home', { 
            homepage: homepage || { sections: [] },
            theme: theme || {}
        });
    } catch (err) {
        res.status(500).send("Lỗi tải trang chủ");
    }
};
// ============================================================
// 2. XEM SẢN PHẨM THEO DANH MỤC
// ============================================================
exports.getCategoryProducts = async (req, res) => {
    try {
        const slug = req.params.slug;
        const [category, theme] = await Promise.all([
            Category.findOne({ slug: slug }).lean(),
            Theme.findOne().lean()
        ]);

        if (!category) {
            return res.status(404).render('404', { 
                pageTitle: 'Không tìm thấy danh mục', 
                path: '/404',
                theme: theme || {}
            });
        }

        const products = await Product.find({ category: category._id, isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        res.render('shop/category-products', {
            pageTitle: category.name,
            path: '/category',
            category: category,
            products: products,
            theme: theme || {}
        });
    } catch (err) {
        console.log("❌ Lỗi xem danh mục:", err);
        res.status(500).render('404', { pageTitle: 'Lỗi hệ thống', path: '/404', theme: {} });
    }
};

// ============================================================
// 3. CHI TIẾT SẢN PHẨM (KÈM SP LIÊN QUAN)
// ============================================================
exports.getProductDetail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const [product, theme] = await Promise.all([
            Product.findOne({ slug: slug, isActive: true }).lean(),
            Theme.findOne().lean()
        ]);

        if (!product) {
            return res.status(404).render('404', { 
                pageTitle: 'Sản phẩm không tồn tại', 
                path: '/404',
                theme: theme || {}
            });
        }

        // Tìm sản phẩm liên quan cùng danh mục, loại bỏ chính sp hiện tại
        const relatedProducts = await Product.find({ 
            category: product.category, 
            _id: { $ne: product._id },
            isActive: true 
        }).limit(4).lean();

        res.render('shop/product-detail', {
            pageTitle: product.name,
            path: '/products',
            product: product,
            relatedProducts: relatedProducts,
            theme: theme || {}
        });
    } catch (err) {
        console.error("❌ Lỗi chi tiết sản phẩm:", err);
        res.status(500).render('404', { pageTitle: 'Lỗi', path: '/404', theme: {} });
    }
};

// ============================================================
// 4. DANH SÁCH TẤT CẢ SẢN PHẨM
// ============================================================
exports.getProducts = async (req, res) => {
    try {
        const [products, theme] = await Promise.all([
            Product.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
            Theme.findOne().lean()
        ]);

        res.render('shop/product-list', {
            pageTitle: 'Tất cả sản phẩm',
            path: '/products',
            products: products,
            theme: theme || {}
        });
    } catch (err) {
        console.log("❌ Lỗi lấy danh sách sản phẩm:", err);
        res.redirect('/');
    }
};

// ============================================================
// 5. CHI TIẾT TRANG TĨNH (VỀ CHÚNG TÔI, LIÊN HỆ...)
// ============================================================
exports.getPageDetail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const [page, theme] = await Promise.all([
            Page.findOne({ slug: slug, isActive: true }).lean(),
            Theme.findOne().lean()
        ]);

        if (!page) {
            return res.status(404).render('404', { 
                pageTitle: 'Trang không tồn tại', 
                path: '/404',
                theme: theme || {}
            });
        }

        res.render('shop/page-detail', {
            pageTitle: page.title,
            path: '/pages',
            page: page,
            theme: theme || {}
        });
    } catch (err) {
        console.error("Lỗi hiển thị trang tĩnh:", err);
        res.redirect('/');
    }
};