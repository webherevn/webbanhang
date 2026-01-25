// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/admin/productController');
const upload = require('../config/cloudinary');

// Cấu hình upload: .array('images', 5) nghĩa là cho phép upload tối đa 5 ảnh ở input có name="images"
router.get('/add-product', productController.getAddProduct);
router.post('/add-product', upload.array('images', 5), productController.postAddProduct);

module.exports = router;