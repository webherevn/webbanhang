const Product = require('../../models/ProductModel'); 
const Category = require('../../models/CategoryModel');
const Page = require('../../models/PageModel');
const Theme = require('../../models/ThemeModel'); 
const Homepage = require('../../models/HomepageModel'); // [QUAN TRỌNG] Phải import Model này

// ============================================================
// 1. TRANG CHỦ (Hệ thống Builder Xếp gạch)
// ============================================================
exports.getHomepage = async (req, res) => {
    try {
        const [homepageData, theme, allProducts] = await Promise.all([
            Homepage.findOne().lean(),
            Theme.findOne().lean(),
            Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(12).lean() // Lấy sp mặc định
        ]);

        let homepage = homepageData || { sections: [] };

        // Xử lý lấy sản phẩm riêng cho từng khối Product Grid (nếu có)
        if (homepage.sections && homepage.sections.length > 0) {
            for (let section of homepage.sections) {
                if (section.type === 'product-grid' && section.isActive) {
                    const query = section.data.categoryId ? { category: section.data.categoryId } : {};
                    const limit = parseInt(section.data.limit) || 8;
                    section.products = await Product.find(query).sort({ createdAt: -1 }).limit(limit).lean();
                }
            }
        }

        res.render('shop/home', { 
            pageTitle: 'Trang chủ - Fashion Shop',
            path: '/',
            homepage: homepage,
            theme: theme || {},
            products: allProducts || [] // <--- ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT ĐỂ SỬA LỖI
        });

    } catch (err) {
        console.error("❌ Lỗi trang chủ:", err);
        res.status(500).render('404', { pageTitle: 'Lỗi', path: '/404', theme: {} });
    }
};

// ============================================================
// 2. XEM SẢN PHẨM THEO DANH MỤC
// ============================================================
exports.getCategoryProducts = async (req, res) => {
    try {
        const slug = req.params.slug;
        const [category, theme] = await Promise.all([
            Category.findOne({ slug: slug }),
            Theme.findOne()
        ]);
        
        if (!category) {
            return res.status(404).render('404', { 
                pageTitle: 'Không tìm thấy danh mục', 
                path: '/404',
                theme: theme 
            });
        }

        const products = await Product.find({ category: category._id }).sort({ createdAt: -1 });

        res.render('shop/category-products', {
            pageTitle: category.name,
            path: '/category',
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
        const [product, theme] = await Promise.all([
            Product.findOne({ slug: slug }),
            Theme.findOne()
        ]);

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
        res.redirect('/');
    }
};