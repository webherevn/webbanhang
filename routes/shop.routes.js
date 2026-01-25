// routes/shop.routes.js
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop/shopController');

// Đường dẫn trang chủ (/)
router.get('/', shopController.getHomepage);

module.exports = router;