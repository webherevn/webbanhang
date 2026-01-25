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

module.exports = router;