const Product = require('../../models/ProductModel'); 
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
      path: '/admin/products', // Biến này giúp Sidebar tô đậm menu 'Tất cả sản phẩm'
      products: products
    });
  } catch (err) {
    console.log("❌ Lỗi lấy danh sách sản phẩm:", err);
    res.redirect('/admin');
  }
};

// ============================================================
// 2. HIỂN THỊ FORM THÊM MỚI
// ============================================================
exports.getAddProduct = (req, res) => {
  res.render('admin/product-form', { 
    pageTitle: 'Thêm Sản Phẩm Mới',
    path: '/admin/add-product' // Biến này giúp Sidebar tô đậm menu 'Thêm mới'
  });
};

// ============================================================
// 3. XỬ LÝ LƯU SẢN PHẨM MỚI
// ============================================================
exports.postAddProduct = async (req, res) => {
  console.log("--- BẮT ĐẦU THÊM SẢN PHẨM ---");
  
  try {
    const { name, basePrice, category, description, salePrice } = req.body;

    // A. Validate Ảnh
    if (!req.files || req.files.length === 0) {
        return res.status(400).send("Lỗi: Bạn chưa chọn ảnh minh họa!");
    }
    const imageLinks = req.files.map(file => file.path);

    // B. Validate Tên
    if (!name || name.trim() === "") {
        return res.status(400).send("Lỗi: Tên sản phẩm không được để trống");
    }

    // C. Xử lý Giá (Xóa dấu phẩy: 100,000 -> 100000)
    let price = 0;
    if (basePrice) {
        price = Number(basePrice.toString().replace(/[,.]/g, '')); 
    }
    if (isNaN(price)) price = 0; 

    // D. Tạo Slug (URL thân thiện)
    let productSlug = "";
    if (name) {
        productSlug = slugify(name, { lower: true, strict: true });
        productSlug += "-" + Date.now(); 
    }

    // E. Tạo Object Sản phẩm
    const product = new Product({
      name: name,
      slug: productSlug,
      basePrice: price,
      category: category || "Uncategorized",
      description: description || "", // TinyMCE gửi HTML về đây
      images: imageLinks,       
      thumbnail: imageLinks[0], // Lấy ảnh đầu tiên làm đại diện
      variants: [] 
    });

    // F. Lưu vào Database
    await product.save();
    
    console.log(`✅ Đã thêm sản phẩm: ${name}`);
    
    // G. Redirect về trang danh sách Admin (Thay vì về trang chủ Shop)
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
    const prodId = req.body.productId; // Lấy ID từ input hidden trong form xóa
    
    // Tìm và xóa ngay lập tức
    await Product.findByIdAndDelete(prodId);
    
    console.log(`🗑️ Đã xóa sản phẩm ID: ${prodId}`);
    res.redirect('/admin/products'); // Load lại trang danh sách

  } catch (err) {
    console.log("❌ Lỗi khi xóa:", err);
    res.redirect('/admin/products');
  }
};