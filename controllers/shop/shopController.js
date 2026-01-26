// --- SỬA LỖI Ở ĐÂY ---
// Bạn phải gọi file Model ra thì mới tạo được sản phẩm mới.
// Hãy kiểm tra kỹ tên file trong thư mục models là 'ProductModel.js' (P hoa) hay 'productModel.js' (p thường)
const Product = require('../../models/ProductModel'); 

exports.getAddProduct = (req, res) => {
  res.render('admin/product-form', { pageTitle: 'Thêm Sản Phẩm' });
};

exports.postAddProduct = async (req, res) => {
  console.log("--- BẮT ĐẦU XỬ LÝ ---");
  
  try {
    // 1. Log dữ liệu nhận được để kiểm tra
    console.log("Body:", req.body);
    // Kiểm tra an toàn cho req.files
    console.log("Files:", req.files ? req.files.length : "0 files");

    const { name, basePrice, category, description } = req.body;

    // 2. VALIDATE ẢNH (Bắt buộc phải có ảnh)
    // Nếu không có ảnh, hoặc mảng ảnh rỗng -> Báo lỗi ngay
    if (!req.files || req.files.length === 0) {
        console.log("❌ LỖI: Không có ảnh được upload.");
        return res.status(400).send("Lỗi: Bạn chưa chọn ảnh! (Hoặc quên enctype='multipart/form-data' bên EJS)");
    }
    const imageLinks = req.files.map(file => file.path);

    // 3. VALIDATE DỮ LIỆU CƠ BẢN (Chống crash do thiếu dữ liệu)
    
    // Nếu thiếu tên -> Báo lỗi
    if (!name || name.trim() === "") {
        return res.status(400).send("Lỗi: Tên sản phẩm không được để trống");
    }

    // Xử lý giá tiền (Chuyển từ String sang Number an toàn)
    let price = 0;
    if (basePrice) {
        // Xóa dấu phẩy hoặc chấm nếu người dùng nhập kiểu 100.000
        price = Number(basePrice.toString().replace(/[,.]/g, '')); 
    }
    // Nếu chuyển đổi thất bại (NaN) thì gán về 0
    if (isNaN(price)) price = 0; 

    // Xử lý Category (Nếu quên nhập thì gán mặc định)
    const finalCategory = category || "Uncategorized";

    // 4. TẠO SẢN PHẨM
    // (Ở đây biến Product đã được định nghĩa nhờ dòng require ở trên cùng)
    const product = new Product({
      name: name,
      basePrice: price,         // Đã xử lý thành số
      category: finalCategory,  // Đã xử lý
      description: description || "",
      images: imageLinks,       // Link từ Cloudinary
      thumbnail: imageLinks[0], // Ảnh đầu tiên làm đại diện
      
      // Tạm thời để variants rỗng
      variants: [] 
    });

    // 5. LƯU VÀO DB
    console.log("⏳ Đang gọi lệnh lưu vào DB...");
    await product.save();
    
    console.log("✅ LƯU THÀNH CÔNG!");
    res.redirect('/');

  } catch (err) {
    // 6. BẮT LỖI MONGOOSE CHI TIẾT
    console.log("❌ LỖI KHI LƯU DB:");
    console.error(err); // Dùng console.error để hiện đỏ trong log

    // Nếu là lỗi Validation của Mongoose (VD: thiếu trường required)
    if (err.name === 'ValidationError') {
        let errorMessages = Object.values(err.errors).map(e => e.message);
        return res.status(400).send("Lỗi Dữ Liệu: " + errorMessages.join(', '));
    }

    res.status(500).send("Lỗi Server: " + err.message);
  }
};