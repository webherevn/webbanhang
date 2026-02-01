const Product = require('../../models/ProductModel'); 
const Category = require('../../models/CategoryModel');
const Page = require('../../models/PageModel');
const Theme = require('../../models/ThemeModel'); 

const Homepage = require('../../models/HomepageModel');
// ============================================================
// 1. TRANG CHỦ
// ============================================================
// ============================================================
exports.getHomepage = async (req, res) => {
  try {
    // 1. Lấy cấu trúc trang chủ, Theme và danh sách sản phẩm mặc định (để dự phòng)
    const [homepageData, theme, defaultProducts] = await Promise.all([
      Homepage.findOne().lean(),
      Theme.findOne().lean(),
      Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(12).lean()
    ]);

    // 2. Khởi tạo homepage nếu chưa có trong Database để tránh lỗi "not defined"
    let homepage = homepageData || { sections: [] };

    // 3. XỬ LÝ LOGIC TỪNG KHỐI (SECTIONS)
    // Duyệt qua mảng sections để đổ dữ liệu sản phẩm riêng cho từng khối Product Grid
    if (homepage.sections && homepage.sections.length > 0) {
      for (let section of homepage.sections) {
        // Nếu là khối Product Grid và đang hiển thị
        if (section.type === 'product-grid' && section.isActive) {
          const categoryId = section.data.categoryId;
          const limit = parseInt(section.data.limit) || 8;
          
          // Tạo query: Nếu có categoryId thì lọc theo category, không thì lấy hàng mới nhất
          const query = categoryId ? { category: categoryId, isActive: true } : { isActive: true };
          
          // Gắn trực tiếp mảng sản phẩm vào chính object section đó
          section.products = await Product.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        }
      }
    }

    // 4. Render với đầy đủ "gói quà" dữ liệu
    res.render('shop/home', { 
      pageTitle: 'Trang chủ - Fashion Shop',
      path: '/',
      homepage: homepage,      // Dùng cho vòng lặp các khối
      products: defaultProducts, // Dùng làm dữ liệu dự phòng (fall-back)
      theme: theme || {}       // Dùng cho Header/Footer
    });

  } catch (err) {
    console.log("❌ Lỗi trang chủ builder:", err);
    // Trả về trang lỗi nhưng vẫn truyền theme để không bị crash Header/Footer
    res.status(500).render('404', { 
      pageTitle: 'Lỗi hệ thống', 
      path: '/404', 
      theme: {} 
    });
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

exports.getIndex = async (req, res) => {
    try {
        const homepage = await Homepage.findOne().lean();
        if (!homepage) return res.render('home', { homepage: null });

        // Phép màu ở đây: Duyệt qua các khối để lấy sản phẩm tương ứng
        for (let section of homepage.sections) {
            if (section.type === 'product-grid' && section.isActive) {
                const query = section.data.categoryId ? { category: section.data.categoryId } : {};
                const limit = parseInt(section.data.limit) || 8;
                
                // Gắn thẳng mảng sản phẩm vào object section
                section.products = await Product.find(query)
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .lean();
            }
        }

        res.render('home', {
            pageTitle: 'Trang chủ',
            homepage: homepage // Bây giờ mỗi section đã có mảng 'products' riêng bên trong
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi tải trang chủ");
    }
};