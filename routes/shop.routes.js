const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop/shopController');
const cartController = require('../controllers/shop/cartController'); // <--- Import mới

router.get('/', shopController.getHomepage);
router.get('/products/:slug', shopController.getProductDetail);

// --- ROUTES GIỎ HÀNG ---
router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/delete', cartController.removeFromCart);

// ... (các dòng import cũ)
const checkoutController = require('../controllers/shop/checkoutController'); // <--- Import mới

// ... (các route cũ của cart)

// --- ROUTES THANH TOÁN ---
router.get('/checkout', checkoutController.getCheckout);
router.post('/checkout', checkoutController.postCheckout);
router.get('/checkout/success', checkoutController.getSuccess);

module.exports = router;

module.exports = router;