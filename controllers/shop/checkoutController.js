const Order = require('../../models/Order');

// 1. Hiển thị form thanh toán
exports.getCheckout = (req, res) => {
  const cart = req.session.cart;

  // Nếu giỏ hàng trống thì đá về trang chủ
  if (!cart || cart.items.length === 0) {
    return res.redirect('/');
  }

  res.render('shop/checkout', {
    pageTitle: 'Thanh toán',
    cart: cart
  });
};

// 2. Xử lý đặt hàng
exports.postCheckout = async (req, res) => {
  try {
    const cart = req.session.cart;
    const { name, email, phone, address, note } = req.body;

    if (!cart || cart.items.length === 0) {
      return res.redirect('/');
    }

    // Tạo đơn hàng mới từ dữ liệu form và session
    const order = new Order({
      user: { name, email, phone, address, note },
      items: cart.items,
      totalPrice: cart.totalPrice
    });

    // Lưu vào Database
    await order.save();

    // QUAN TRỌNG: Xóa giỏ hàng sau khi đặt thành công
    req.session.cart = { items: [], totalQuantity: 0, totalPrice: 0 };

    // Chuyển hướng sang trang cảm ơn
    res.redirect('/checkout/success');

  } catch (err) {
    console.log(err);
    res.status(500).send('Lỗi xử lý đơn hàng');
  }
};

// 3. Trang thông báo thành công
exports.getSuccess = (req, res) => {
  res.render('shop/success', {
    pageTitle: 'Đặt hàng thành công'
  });
};