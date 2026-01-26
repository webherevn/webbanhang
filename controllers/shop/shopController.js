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

        // 1. Tìm Danh mục theo Slug
        const category = await Category.findOne({ slug: slug });

        if (!category) {
            // Nếu khách gõ bậy bạ -> Về trang 404 hoặc trang chủ
            return res.status(404).render('404', { pageTitle: 'Không tìm thấy danh mục', path: '/404' });
        }

        // 2. Tìm Sản phẩm thuộc danh mục này
        // Lưu ý: Trong ProductModel lúc lưu, bạn lưu field 'category' là slug hay tên?
        // Code bên dưới giả định bạn lưu category là Slug (như logic bài trước chúng ta làm)
        const products = await Product.find({ category: slug }).sort({ createdAt: -1 });

        // 3. Render ra view
        res.render('shop/category-products', { // Chúng ta sẽ tạo file view này ở Bước 4
            pageTitle: category.name,
            path: '/category',
            category: category,
            products: products
        });

    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};