const express = require('express');
const router = express.Router();

// Import 2 Controller
const adminController = require('../controllers/admin/adminController'); // File mới tạo
const productController = require('../controllers/admin/productController'); // File có sẵn

// --- 1. DASHBOARD (TRANG CHỦ ADMIN) ---
// Đường dẫn: /admin
router.get('/', adminController.getDashboard);

// --- 2. QUẢN LÝ SẢN PHẨM ---
// Đường dẫn: /admin/products (Xem danh sách)
router.get('/products', productController.getProducts);

// Đường dẫn: /admin/add-product (Thêm mới)
router.get('/add-product', productController.getAddProduct);
router.post('/add-product', productController.postAddProduct);

// Đường dẫn: /admin/delete-product (Xóa)
router.post('/delete-product', productController.postDeleteProduct);

module.exports = router;