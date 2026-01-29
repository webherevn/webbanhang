const express = require('express');
const router = express.Router();

// --- IMPORT CONTROLLERS ---
const shopController = require('../controllers/shop/shopController');
const cartController = require('../controllers/shop/cartController'); 
const checkoutController = require('../controllers/shop/checkoutController'); 
const blogController = require('../controllers/shop/blogController');
const seoController = require('../controllers/admin/seoController');
// ============================================================
// 1. TRANG CHỦ & SẢN PHẨM (GIỮ NGUYÊN)
// ============================================================
router.get('/', shopController.getHomepage); 
router.get('/products', shopController.getProducts);
router.get('/products/:slug', shopController.getProductDetail);
router.get('/category/:slug', shopController.getCategoryProducts);

// ============================================================
// 2. GIỎ HÀNG (GIỮ NGUYÊN)
// ============================================================
router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/delete', cartController.removeFromCart);

// ============================================================
// 3. THANH TOÁN (CHECKOUT) (GIỮ NGUYÊN)
// ============================================================
router.get('/checkout', checkoutController.getCheckout);
router.post('/checkout', checkoutController.postCheckout);
router.get('/checkout/success', checkoutController.getSuccess);

// ============================================================
// 4. BLOG KHÁCH HÀNG (ĐÃ CẬP NHẬT CHUẨN SEO & FIX LỖI 404)
// ============================================================

// A. Trang danh sách tất cả bài viết
router.get('/blog', blogController.getIndex);

// B. Trang chi tiết bài viết (Thêm /post/ để phân biệt với chuyên mục)
// URL ví dụ: domain.com/blog/post/cach-phoi-do-mua-he
router.get('/blog/post/:slug', blogController.getDetail);

// C. Trang danh sách bài viết theo Chuyên mục (Chuẩn SEO tối thượng)
// URL ví dụ: domain.com/blog/tu-van
// LƯU Ý: Phải đặt dòng này dưới cùng của nhóm Blog để không tranh chấp với /blog/post/
router.get('/blog/:slug', blogController.getPostsByCategory);

// Xem chi tiết trang tĩnh (Ví dụ: /p/gioi-thieu)
router.get('/p/:slug', shopController.getPageDetail);

// Sitemap XML - Luôn nằm ở gốc website
router.get('/sitemap.xml', seoController.generateSitemap);
module.exports = router;