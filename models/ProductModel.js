// --- SỬA LỖI QUAN TRỌNG TẠI ĐÂY ---
// Thay vì gọi mongoose/slugify, ta phải gọi cái MODEL ra
// LƯU Ý: Kiểm tra kỹ tên file bên trái VSCode là 'ProductModel.js' hay 'productModel.js' để sửa dòng dưới cho khớp
const Product = require('../../models/ProductModel'); 

exports.getAddProduct = (req, res) => {
  res.render('admin/product-form', { pageTitle: 'Thêm Sản Phẩm' });
};

exports.postAddProduct = async (req, res) => {
  console.log("--- BẮT ĐẦU XỬ LÝ ---");
  
  try {
    // 1. Log dữ liệu để debug
    console.log("Body:", req.body);
    console.log("Files:", req.files ? req.files.length : "0 files");

    const { name, basePrice, category, description } = req.body;

    // 2. VALIDATE ẢNH
    if (!req.files || req.files.length === 0) {
        console.log("❌ LỖI: Không có ảnh upload");
        return res.status(400).send("Lỗi: Bạn chưa chọn ảnh! (Hoặc quên enctype='multipart/form-data')");
    }
    const imageLinks = req.files.map(file => file.path);

    // 3. VALIDATE DỮ LIỆU CƠ BẢN
    if (!name || name.trim() === "") {
        return res.status(400).send("Lỗi: Tên sản phẩm không được để trống");
    }

    // Xử lý giá (Xóa dấu chấm/phẩy: 100.000 -> 100000)
    let price = 0;
    if (basePrice) {
        price = Number(basePrice.toString().replace(/[,.]/g, '')); 
    }
    if (isNaN(price)) price = 0; 

    // 4. TẠO SẢN PHẨM
    // (Lệnh này sẽ hoạt động vì ta đã require Product ở dòng đầu tiên)
    const product = new Product({
      name: name,
      basePrice: price,
      category: category || "Uncategorized",
      description: description || "",
      images: imageLinks,       
      thumbnail: imageLinks[0],
      variants: [] 
    });

    // 5. LƯU VÀO DB
    console.log("⏳ Đang lưu vào DB...");
    await product.save();
    
    console.log("✅ LƯU THÀNH CÔNG!");
    res.redirect('/');

  } catch (err) {
    console.log("❌ LỖI KHI LƯU DB:", err);

    if (err.name === 'ValidationError') {
        let errorMessages = Object.values(err.errors).map(e => e.message);
        return res.status(400).send("Lỗi Dữ Liệu: " + errorMessages.join(', '));
    }

    res.status(500).send("Lỗi Server: " + err.message);
  }
};