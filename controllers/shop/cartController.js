const Product = require('../../models/ProductModel'); // Đảm bảo đúng tên file Model bạn đã sửa

// 1. Xem giỏ hàng
exports.getCart = (req, res) => {
  // Nếu chưa có giỏ hàng trong session thì tạo rỗng để tránh lỗi view
  const cart = req.session.cart || { items: [], totalQuantity: 0, totalPrice: 0 };

  res.render('shop/cart', {
    pageTitle: 'Giỏ hàng của bạn',
    cart: cart
  });
};

// 2. Thêm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { productId, variant, quantity } = req.body;
    const qty = parseInt(quantity);

    // Lấy thông tin sản phẩm từ DB để chắc chắn giá đúng
    const product = await Product.findById(productId);
    
    if (!product) {
        return res.redirect('/');
    }

    // Tạo cấu trúc item
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.basePrice,
      image: product.images[0], // Lấy ảnh đầu tiên
      variant: variant, // VD: "Xanh-L"
      quantity: qty,
      total: product.basePrice * qty
    };

    // Lấy giỏ hàng từ session (nếu chưa có thì tạo mới)
    const cart = req.session.cart || { items: [], totalQuantity: 0, totalPrice: 0 };
    
    // Kiểm tra xem sản phẩm này (cùng màu/size) đã có trong giỏ chưa?
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && item.variant === variant
    );

    if (existingItemIndex >= 0) {
      // Nếu có rồi -> Tăng số lượng và tiền
      cart.items[existingItemIndex].quantity += qty;
      cart.items[existingItemIndex].total += cartItem.total;
    } else {
      // Nếu chưa -> Thêm mới vào mảng
      cart.items.push(cartItem);
    }

    // Cập nhật tổng giỏ hàng
    cart.totalQuantity += qty;
    cart.totalPrice += cartItem.total;

    // Cập nhật lại session
    req.session.cart = cart;

    // QUAN TRỌNG: Lưu session xuống DB xong mới chuyển trang
    // (Khắc phục lỗi giỏ hàng trống trên Render)
    req.session.save(err => {
      if (err) console.log('Lỗi lưu session:', err);
      res.redirect('/cart');
    });

  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
};

// 3. Xóa sản phẩm khỏi giỏ
exports.removeFromCart = (req, res) => {
  const { productId, variant } = req.body;
  const cart = req.session.cart;

  if (!cart) {
      return res.redirect('/cart');
  }

  // Tìm vị trí sản phẩm cần xóa
  const itemIndex = cart.items.findIndex(item => 
    item.productId.toString() === productId && item.variant === variant
  );

  if (itemIndex >= 0) {
    // Trừ đi tổng tiền và số lượng của item đó
    cart.totalQuantity -= cart.items[itemIndex].quantity;
    cart.totalPrice -= cart.items[itemIndex].total;
    
    // Xóa item khỏi mảng
    cart.items.splice(itemIndex, 1);
  }

  // QUAN TRỌNG: Lưu session xong mới chuyển trang
  req.session.save(err => {
    if (err) console.log(err);
    res.redirect('/cart');
  });
};