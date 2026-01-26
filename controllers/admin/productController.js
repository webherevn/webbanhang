const Product = require('../../models/ProductModel');
const Category = require('../../models/CategoryModel');
const slugify = require('slugify');

// ============================================================
// 1. HIỂN THỊ DANH SÁCH SẢN PHẨM (DASHBOARD)
// ============================================================
exports.getProducts = async (req, res) => {
  try {
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
// 2. HIỂN THỊ FORM THÊM MỚI
// ============================================================
exports.getAddProduct = async (req, res) => {
  try {
    const categories = await Category.find(); 

    res.render('admin/product-form', { 
      pageTitle: 'Thêm Sản Phẩm Mới',
      path: '/admin/add-product',
      categories: categories
    });
  } catch (err) {
    console.log("❌ Lỗi tải form thêm sản phẩm:", err);
    res.redirect('/admin/products');
  }
};

// ============================================================
// 3. XỬ LÝ LƯU SẢN PHẨM MỚI (UPDATE LOGIC SLUG SEO)
// ============================================================
exports.postAddProduct = async (req, res) => {
  console.log("--- BẮT ĐẦU THÊM SẢN PHẨM ---");
  
  try {
    const { name, basePrice, category, description, salePrice } = req.body;

    // --- A. XỬ LÝ ẢNH ---
    const thumbnailFiles = req.files['thumbnail']; 
    if (!thumbnailFiles || thumbnailFiles.length === 0) {
        return res.status(400).send("Lỗi: Bạn chưa chọn Ảnh đại diện (Thumbnail)!");
    }
    const thumbnailPath = thumbnailFiles[0].path;

    const galleryFiles = req.files['gallery'] || [];
    const galleryPaths = galleryFiles.map(file => file.path);

    // --- B. Validate Tên ---
    if (!name || name.trim() === "") {
        return res.status(400).send("Lỗi: Tên sản phẩm không được để trống");
    }

    // --- C. Xử lý Giá ---
    let price = 0;
    if (basePrice) price = Number(basePrice.toString().replace(/[,.]/g, '')); 
    if (isNaN(price)) price = 0; 
    
    let sale = 0;
    if (salePrice) sale = Number(salePrice.toString().replace(/[,.]/g, ''));

    // --- D. TẠO SLUG CHUẨN SEO (LOGIC MỚI) ---
    // 1. Tạo slug gốc từ tên
    let productSlug = slugify(name, { lower: true, strict: true });
    
    // 2. Kiểm tra xem slug này đã có trong DB chưa
    let originalSlug = productSlug;
    let count = 1;
    
    // Vòng lặp: Nếu tìm thấy sản phẩm có slug này -> Thêm số vào đuôi và tìm tiếp
    while (await Product.findOne({ slug: productSlug })) {
        productSlug = `${originalSlug}-${count}`;
        count++;
    }
    // Kết quả: quan-jean -> quan-jean-1 -> quan-jean-2 ...

    // --- E. Tạo Object Sản phẩm ---
    const product = new Product({
      name: name,
      slug: productSlug,
      basePrice: price,
      salePrice: sale || 0,
      category: category || "Uncategorized",
      description: description || "", 
      thumbnail: thumbnailPath,
      images: galleryPaths,
      variants: [] 
    });

    // --- F. Lưu vào Database ---
    await product.save();
    
    console.log(`✅ Đã thêm: ${name} (Slug: ${productSlug})`);
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

// ============================================================
// 5. HIỂN THỊ FORM SỬA SẢN PHẨM (GET)
// ============================================================
exports.getEditProduct = async (req, res) => {
    try {
        const prodId = req.params.productId;
        const product = await Product.findById(prodId);
        const categories = await Category.find();

        if (!product) {
            return res.redirect('/admin/products');
        }

        res.render('admin/product-form', { 
            pageTitle: 'Chỉnh sửa sản phẩm',
            path: '/admin/edit-product',
            editing: true,
            product: product,
            categories: categories
        });

    } catch (err) {
        console.log("❌ Lỗi tải trang sửa:", err);
        res.redirect('/admin/products');
    }
};

// ============================================================
// 6. XỬ LÝ LƯU THAY ĐỔI (POST) - (UPDATE LOGIC SLUG SEO)
// ============================================================
exports.postEditProduct = async (req, res) => {
    try {
        const { productId, name, basePrice, salePrice, category, description } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.redirect('/admin/products');

        // Cập nhật thông tin cơ bản
        product.category = category;
        product.description = description;

        if (basePrice) product.basePrice = Number(basePrice.toString().replace(/[,.]/g, ''));
        if (salePrice) product.salePrice = Number(salePrice.toString().replace(/[,.]/g, ''));

        // --- LOGIC CẬP NHẬT SLUG KHI SỬA TÊN ---
        // Chỉ đổi slug nếu người dùng thực sự sửa tên sản phẩm
        if (name && name !== product.name) {
            product.name = name; // Cập nhật tên mới

            let newSlug = slugify(name, { lower: true, strict: true });
            let originalSlug = newSlug;
            let count = 1;

            // Kiểm tra trùng: Tìm sản phẩm CÓ slug này nhưng KHÔNG PHẢI sản phẩm đang sửa (_id != productId)
            while (await Product.findOne({ slug: newSlug, _id: { $ne: productId } })) {
                newSlug = `${originalSlug}-${count}`;
                count++;
            }
            
            product.slug = newSlug;
        }

        // XỬ LÝ ẢNH
        if (req.files && req.files['thumbnail']) {
            product.thumbnail = req.files['thumbnail'][0].path;
        }

        if (req.files && req.files['gallery']) {
            const newImages = req.files['gallery'].map(f => f.path);
            product.images.push(...newImages);
        }

        await product.save();
        
        console.log(`✅ Đã cập nhật: ${name} (Slug: ${product.slug})`);
        res.redirect('/admin/products');

    } catch (err) {
        console.log("❌ Lỗi cập nhật sản phẩm:", err);
        res.redirect('/admin/products');
    }
};