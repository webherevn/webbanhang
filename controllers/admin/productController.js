const Product = require('../../models/ProductModel');
const Category = require('../../models/CategoryModel'); // <--- 1. Import thêm Model Category
const slugify = require('slugify');

// ============================================================
// 1. HIỂN THỊ DANH SÁCH SẢN PHẨM (DASHBOARD)
// ============================================================
exports.getProducts = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm, sắp xếp mới nhất lên đầu
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.render('admin/product-list', { 
      pageTitle: 'Tất cả sản phẩm',
      path: '/admin/products', 
      products: products
    });
  } catch (err) {
    console.log("❌ Lỗi lấy danh sách sản phẩm:", err);
    res.redirect('/admin');
  }
};

// ============================================================
// 2. HIỂN THỊ FORM THÊM MỚI (CẬP NHẬT)
// ============================================================
exports.getAddProduct = async (req, res) => {
  try {
    // Lấy danh sách danh mục để hiển thị ra cột bên phải (Sidebar chọn danh mục)
    const categories = await Category.find(); 

    res.render('admin/product-form', { 
      pageTitle: 'Thêm Sản Phẩm Mới',
      path: '/admin/add-product',
      categories: categories // <--- Truyền danh mục sang View
    });
  } catch (err) {
    console.log("❌ Lỗi tải form thêm sản phẩm:", err);
    res.redirect('/admin/products');
  }
};

// ============================================================
// 3. XỬ LÝ LƯU SẢN PHẨM MỚI (CẬP NHẬT LOGIC ẢNH)
// ============================================================
exports.postAddProduct = async (req, res) => {
  console.log("--- BẮT ĐẦU THÊM SẢN PHẨM ---");
  
  try {
    const { name, basePrice, category, description, salePrice } = req.body;

    // --- A. XỬ LÝ ẢNH (QUAN TRỌNG: Logic mới cho upload.fields) ---
    // Do bên Route dùng upload.fields, nên req.files bây giờ là Object
    
    // 1. Lấy ảnh đại diện (Bắt buộc)
    const thumbnailFiles = req.files['thumbnail']; 
    if (!thumbnailFiles || thumbnailFiles.length === 0) {
        return res.status(400).send("Lỗi: Bạn chưa chọn Ảnh đại diện (Thumbnail)!");
    }
    const thumbnailPath = thumbnailFiles[0].path;

    // 2. Lấy album ảnh (Không bắt buộc)
    const galleryFiles = req.files['gallery'] || [];
    const galleryPaths = galleryFiles.map(file => file.path);

    // --- B. Validate Tên ---
    if (!name || name.trim() === "") {
        return res.status(400).send("Lỗi: Tên sản phẩm không được để trống");
    }

    // --- C. Xử lý Giá (Xóa dấu phẩy) ---
    let price = 0;
    if (basePrice) {
        price = Number(basePrice.toString().replace(/[,.]/g, '')); 
    }
    if (isNaN(price)) price = 0; 
    
    // Xử lý giá khuyến mãi (nếu có)
    let sale = 0;
    if (salePrice) {
        sale = Number(salePrice.toString().replace(/[,.]/g, ''));
    }

    // --- D. Tạo Slug ---
    let productSlug = "";
    if (name) {
        productSlug = slugify(name, { lower: true, strict: true });
        productSlug += "-" + Date.now(); 
    }

    // --- E. Tạo Object Sản phẩm ---
    const product = new Product({
      name: name,
      slug: productSlug,
      basePrice: price,
      salePrice: sale || 0, // Lưu thêm giá giảm
      category: category || "Uncategorized", // Lưu Slug của danh mục
      description: description || "", 
      
      // Lưu đúng trường trong Model
      thumbnail: thumbnailPath, // Ảnh đại diện (String)
      images: galleryPaths,     // Album ảnh (Array String)
      variants: [] 
    });

    // --- F. Lưu vào Database ---
    await product.save();
    
    console.log(`✅ Đã thêm sản phẩm: ${name}`);
    res.redirect('/admin/products');

  } catch (err) {
    console.log("❌ LỖI SERVER:", err);
    res.status(500).send("Lỗi Server: " + err.message);
  }
};

// ============================================================
// 4. XỬ LÝ XÓA SẢN PHẨM
// ============================================================
exports.postDeleteProduct = async (req, res) => {
  try {
    const prodId = req.body.productId; 
    await Product.findByIdAndDelete(prodId);
    console.log(`🗑️ Đã xóa sản phẩm ID: ${prodId}`);
    res.redirect('/admin/products'); 
  } catch (err) {
    console.log("❌ Lỗi khi xóa:", err);
    res.redirect('/admin/products');
  }
};