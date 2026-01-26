const express = require('express');
const router = express.Router();

// --- IMPORT CONTROLLERS ---
const shopController = require('../controllers/shop/shopController');
const cartController = require('../controllers/shop/cartController'); 
const checkoutController = require('../controllers/shop/checkoutController'); 

// ============================================================
// 1. TRANG CHỦ & SẢN PHẨM
// ============================================================
// Trang chủ
router.get('/', shopController.getHomepage); 

// Xem chi tiết sản phẩm (QUAN TRỌNG: Chỉ khai báo 1 lần duy nhất ở đây)
router.get('/products/:slug', shopController.getProductDetail);

// Xem danh sách sản phẩm theo Danh Mục
router.get('/category/:slug', shopController.getCategoryProducts);


// ============================================================
// 2. GIỎ HÀNG (CART)
// ============================================================
// Xem giỏ hàng
router.get('/cart', cartController.getCart);

// Thêm vào giỏ (Form bên View phải để action="/cart/add")
router.post('/cart/add', cartController.addToCart); 

// Xóa sản phẩm khỏi giỏ
router.post('/cart/delete', cartController.removeFromCart);


// ============================================================
// 3. THANH TOÁN (CHECKOUT)
// ============================================================
// Trang điền thông tin thanh toán
router.get('/checkout', checkoutController.getCheckout);

// Xử lý đặt hàng
router.post('/checkout', checkoutController.postCheckout);

// Trang thông báo đặt hàng thành công
router.get('/checkout/success', checkoutController.getSuccess);


module.exports = router;