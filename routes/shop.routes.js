const express = require('express');
const router = express.Router();

// --- IMPORT CONTROLLERS ---
const shopController = require('../controllers/shop/shopController');
const cartController = require('../controllers/shop/cartController'); 
const checkoutController = require('../controllers/shop/checkoutController'); 
// --- ĐOẠN 1: Thêm dòng này ở đầu file ---
const blogController = require('../controllers/shop/blogController');
// ============================================================
// 1. TRANG CHỦ & SẢN PHẨM
// ============================================================
// Trang chủ
router.get('/', shopController.getHomepage); 
// 1. Trang danh sách tất cả sản phẩm (Thêm dòng này vào)
router.get('/products', shopController.getProducts);

// Xem chi tiết sản phẩm (QUAN TRỌNG: Chỉ khai báo 1 lần duy nhất ở đây)
router.get('/products/:slug', shopController.getProductDetail);

// Xem danh sách sản phẩm theo Danh Mục
router.get('/category/:slug', shopController.getCategoryProducts);


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


// =======================
// BLOG KHÁCH HÀNG
// =======================
router.get('/blog', blogController.getIndex); // Trang danh sách
router.get('/blog/:slug', blogController.getDetail); // Trang chi tiết

module.exports = router;