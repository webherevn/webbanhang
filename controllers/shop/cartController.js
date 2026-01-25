const Product = require('../../models/ProductModel');

// 1. Xem giỏ hàng
exports.getCart = (req, res) => {
  res.render('shop/cart', {
    pageTitle: 'Giỏ hàng của bạn',
    cart: req.session.cart
  });
};

// 2. Thêm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { productId, variant, quantity } = req.body;
    const qty = parseInt(quantity);

    // Lấy thông tin sản phẩm từ DB để chắc chắn giá đúng
    const product = await Product.findById(productId);
    
    // Tạo cấu trúc item
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.basePrice,
      image: product.images[0],
      variant: variant, // VD: "Xanh-L"
      quantity: qty,
      total: product.basePrice * qty
    };

    const cart = req.session.cart;
    
    // Kiểm tra xem sản phẩm này (cùng màu/size) đã có trong giỏ chưa?
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && item.variant === variant
    );

    if (existingItemIndex >= 0) {
      // Nếu có rồi -> Tăng số lượng
      cart.items[existingItemIndex].quantity += qty;
      cart.items[existingItemIndex].total += cartItem.total;
    } else {
      // Nếu chưa -> Thêm mới
      cart.items.push(cartItem);
    }

    // Cập nhật tổng giỏ hàng
    cart.totalQuantity += qty;
    cart.totalPrice += cartItem.total;

    res.redirect('/cart'); // Chuyển hướng đến trang giỏ hàng

  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
};

// 3. Xóa sản phẩm khỏi giỏ
exports.removeFromCart = (req, res) => {
  const { productId, variant } = req.body;
  const cart = req.session.cart;

  const itemIndex = cart.items.findIndex(item => 
    item.productId.toString() === productId && item.variant === variant
  );

  if (itemIndex >= 0) {
    // Trừ đi tổng tiền và số lượng
    cart.totalQuantity -= cart.items[itemIndex].quantity;
    cart.totalPrice -= cart.items[itemIndex].total;
    
    // Xóa item khỏi mảng
    cart.items.splice(itemIndex, 1);
  }

  res.redirect('/cart');
};