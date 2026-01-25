// controllers/admin/productController.js
const Product = require('../../models/Product'); // Nhớ import Model đã tạo ở bước trước

module.exports = {
  // GET: Hiển thị form thêm sản phẩm
  getAddProduct: (req, res) => {
    res.render('admin/product-form', { 
      pageTitle: 'Thêm sản phẩm mới',
      editing: false 
    });
  },

  // POST: Xử lý dữ liệu thêm sản phẩm
  postAddProduct: async (req, res) => {
    try {
      const { name, category, basePrice, description, color, size, quantity } = req.body;
      
      // Xử lý ảnh: req.files trả về mảng các file đã upload lên Cloudinary
      // Ảnh đầu tiên làm thumbnail, các ảnh sau cho vào gallery
      const imageLinks = req.files.map(file => file.path);
      const thumbnail = imageLinks[0];
      const images = imageLinks.slice(1);

      // Tạo Slug (URL thân thiện) đơn giản
      const slug = name.toLowerCase().split(' ').join('-') + '-' + Date.now();

      // Tạo đối tượng Product mới
      const newProduct = new Product({
        name,
        slug,
        category,
        basePrice,
        description,
        thumbnail,
        images,
        // Demo tạo 1 biến thể từ form đơn giản (Sau này sẽ làm form động thêm nhiều biến thể)
        variants: [{
          color: color,
          size: size,
          quantity: quantity
        }]
      });

      await newProduct.save();
      console.log('Đã tạo sản phẩm:', newProduct.name);
      res.redirect('/admin/products'); // Chuyển hướng về trang danh sách

    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi Server khi tạo sản phẩm');
    }
  }
};