// Kiểm tra kỹ tên file Model (ProductModel hay productModel)
const Product = require('../../models/ProductModel'); 

// 1. Xem giỏ hàng
exports.getCart = (req, res) => {
  // Khởi tạo giỏ hàng an toàn
  const cart = req.session.cart || { items: [], totalQuantity: 0, totalPrice: 0 };

  res.render('shop/cart', {
    pageTitle: 'Giỏ hàng của bạn',
    path: '/cart', // Thêm path để active menu nếu cần
    cart: cart
  });
};

// 2. Thêm vào giỏ hàng
exports.addToCart = async (req, res) => {
  console.log("--- THÊM VÀO GIỎ ---");
  try {
    const { productId, variant, quantity } = req.body;
    
    // VALIDATE SỐ LƯỢNG (Rất quan trọng)
    // Đảm bảo qty luôn là số dương, nếu lỗi thì mặc định là 1
    let qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) qty = 1;

    // Lấy sản phẩm từ DB
    const product = await Product.findById(productId);
    
    // Nếu sản phẩm bị xóa hoặc không tìm thấy
    if (!product) {
        console.log("❌ Không tìm thấy sản phẩm ID:", productId);
        return res.redirect('/');
    }

    // XỬ LÝ ẢNH AN TOÀN (Tránh crash nếu mảng ảnh rỗng)
    const productImage = (product.images && product.images.length > 0) 
                         ? product.images[0] 
                         : product.thumbnail || "https://via.placeholder.com/150";

    // Xử lý Variant (Nếu khách không chọn size/màu, gán mặc định)
    const currentVariant = variant || "Tiêu chuẩn";

    // Tạo item để lưu
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.basePrice,
      image: productImage,
      variant: currentVariant,
      quantity: qty,
      total: product.basePrice * qty
    };

    // Lấy giỏ hàng hiện tại
    const cart = req.session.cart || { items: [], totalQuantity: 0, totalPrice: 0 };
    
    // KIỂM TRA TRÙNG SẢN PHẨM (Cùng ID và cùng Variant)
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && item.variant === currentVariant
    );

    if (existingItemIndex >= 0) {
      // Đã có -> Tăng số lượng & Cập nhật giá tổng của item đó
      cart.items[existingItemIndex].quantity += qty;
      cart.items[existingItemIndex].total += cartItem.total;
    } else {
      // Chưa có -> Thêm mới
      cart.items.push(cartItem);
    }

    // Cập nhật TỔNG CẢ GIỎ HÀNG
    cart.totalQuantity += qty;
    cart.totalPrice += cartItem.total;

    // Gán lại vào session
    req.session.cart = cart;

    // --- LƯU SESSION (QUAN TRỌNG CHO RENDER) ---
    req.session.save(err => {
      if (err) {
          console.log('❌ Lỗi lưu session:', err);
          return res.redirect('/');
      }
      console.log(`✅ Đã thêm: ${product.name} (x${qty})`);
      res.redirect('/cart');
    });

  } catch (err) {
    console.log("❌ Lỗi AddToCart:", err);
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

  // Tìm sản phẩm cần xóa (Khớp cả ID lẫn Variant)
  // Lưu ý: Dùng currentVariant để khớp nếu bên view gửi lên
  const itemIndex = cart.items.findIndex(item => 
    item.productId.toString() === productId && 
    (item.variant === variant || (!variant && item.variant === "Tiêu chuẩn"))
  );

  if (itemIndex >= 0) {
    const item = cart.items[itemIndex];
    
    // Trừ đi tổng số lượng và tổng tiền
    cart.totalQuantity -= item.quantity;
    cart.totalPrice -= item.total;
    
    // Đảm bảo không bị âm tiền (Do lỗi làm tròn số học JS)
    if (cart.totalPrice < 0) cart.totalPrice = 0;
    if (cart.totalQuantity < 0) cart.totalQuantity = 0;

    // Xóa khỏi mảng
    cart.items.splice(itemIndex, 1);
  }

  // Lưu và reload
  req.session.save(err => {
    if (err) console.log(err);
    res.redirect('/cart');
  });
};