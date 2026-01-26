const Product = require('../../models/ProductModel'); 
const slugify = require('slugify'); // <--- 1. Thêm dòng này để dùng ở Controller

exports.getAddProduct = (req, res) => {
  res.render('admin/product-form', { pageTitle: 'Thêm Sản Phẩm' });
};

exports.postAddProduct = async (req, res) => {
  console.log("--- BẮT ĐẦU XỬ LÝ ---");
  
  try {
    const { name, basePrice, category, description } = req.body;

    // 1. VALIDATE ẢNH
    if (!req.files || req.files.length === 0) {
        return res.status(400).send("Lỗi: Bạn chưa chọn ảnh!");
    }
    const imageLinks = req.files.map(file => file.path);

    // 2. VALIDATE TÊN
    if (!name || name.trim() === "") {
        return res.status(400).send("Lỗi: Tên sản phẩm không được để trống");
    }

    // 3. XỬ LÝ GIÁ
    let price = 0;
    if (basePrice) {
        price = Number(basePrice.toString().replace(/[,.]/g, '')); 
    }
    if (isNaN(price)) price = 0; 

    // 4. TẠO SLUG THỦ CÔNG (An toàn hơn dùng Hook)
    let productSlug = "";
    if (name) {
        // Tạo slug từ tên, ví dụ: "Áo Thun" -> "ao-thun"
        productSlug = slugify(name, { lower: true, strict: true });
        // Thêm số ngẫu nhiên vào đuôi để tránh trùng lặp tuyệt đối (VD: ao-thun-123456)
        productSlug += "-" + Date.now(); 
    }

    // 5. TẠO SẢN PHẨM
    const product = new Product({
      name: name,
      slug: productSlug, // <--- Gán slug vừa tạo vào đây
      basePrice: price,
      category: category || "Uncategorized",
      description: description || "",
      images: imageLinks,       
      thumbnail: imageLinks[0],
      variants: [] 
    });

    // 6. LƯU
    await product.save();
    
    console.log("✅ LƯU THÀNH CÔNG! Slug:", productSlug);
    res.redirect('/');

  } catch (err) {
    console.log("❌ LỖI:", err);
    res.status(500).send("Lỗi Server: " + err.message);
  }
};