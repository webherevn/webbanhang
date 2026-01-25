const Product = require('../../models/ProductModel');

exports.getAddProduct = (req, res) => {
  res.render('admin/product-form', { pageTitle: 'Thêm Sản Phẩm' });
};

exports.postAddProduct = async (req, res) => {
  try {
    const { name, basePrice, category, description, variants } = req.body;
    
    // --- XỬ LÝ ẢNH ---
    // Kiểm tra xem có file nào được up lên không
    if (!req.files || req.files.length === 0) {
        // Nếu không có ảnh thì có thể báo lỗi hoặc để mảng rỗng
        return res.status(400).send('Vui lòng chọn ít nhất 1 ảnh!');
    }

    // Lấy danh sách link ảnh từ Cloudinary trả về
    const imageLinks = req.files.map(file => file.path); 
    // (Lưu ý: 'file.path' chính là đường dẫn http://res.cloudinary... đã upload xong)

    const product = new Product({
      name: name,
      basePrice: basePrice,
      category: category,
      description: description,
      images: imageLinks, // Lưu mảng link ảnh vào DB
      thumbnail: imageLinks[0] // Lấy ảnh đầu tiên làm đại diện
      // ... xử lý variants nếu cần
    });

    await product.save();
    console.log('✅ Đã lưu sản phẩm và ảnh thành công!');
    res.redirect('/');

  } catch (err) {
    console.log('❌ Lỗi thêm sản phẩm:', err);
    res.status(500).send('Lỗi Server');
  }
};