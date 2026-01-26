const express = require('express');
const router = express.Router();

// Import Controllers (Gom hết lên đầu cho gọn)
const shopController = require('../controllers/shop/shopController');
const cartController = require('../controllers/shop/cartController'); 
const checkoutController = require('../controllers/shop/checkoutController'); // <-- Đảm bảo bạn đã tạo file này

// --- 1. TRANG CHỦ & SẢN PHẨM ---
// Lưu ý: Kiểm tra trong shopController tên hàm là 'getHomepage' hay 'getIndex'
router.get('/', shopController.getHomepage); 
router.get('/products/:productId', shopController.getProductDetail);

// 1. Route xem chi tiết sản phẩm
router.get('/products/:slug', shopController.getProductDetail);


// --- 2. GIỎ HÀNG ---
router.get('/cart', cartController.getCart);

// Quan trọng: Route này là '/cart/add', nên bên HTML form phải sửa action thành '/cart/add'
router.post('/cart/add', cartController.addToCart); 

// Route xóa sản phẩm
router.post('/cart/delete', cartController.removeFromCart);

// --- 3. THANH TOÁN (CHECKOUT) ---
router.get('/checkout', checkoutController.getCheckout);
router.post('/checkout', checkoutController.postCheckout);
router.get('/checkout/success', checkoutController.getSuccess);

// Chỉ được có 1 dòng module.exports ở cuối cùng

// --- THÊM ROUTE NÀY ---
// Khi ai đó vào /category/quan-jean -> Gọi hàm getCategoryProducts
router.get('/category/:slug', shopController.getCategoryProducts);
module.exports = router;