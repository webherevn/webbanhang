const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARE UPLOAD (Để xử lý ảnh)
// Lưu ý: Đảm bảo bạn đã có file này trong folder middleware
const upload = require('../middleware/upload'); 

// 2. IMPORT CONTROLLERS
const adminController = require('../controllers/admin/adminController');
const productController = require('../controllers/admin/productController');
const categoryController = require('../controllers/admin/categoryController'); // <-- Controller danh mục mới

// 3. CẤU HÌNH UPLOAD CHO SẢN PHẨM
// Giúp server nhận diện được 2 ô input file riêng biệt
const productUpload = upload.fields([
    { name: 'thumbnail', maxCount: 1 }, // Chỉ cho phép 1 ảnh đại diện
    { name: 'gallery', maxCount: 10 }   // Cho phép tối đa 10 ảnh album
]);

// ============================================================
// A. DASHBOARD (BẢNG TIN)
// ============================================================
router.get('/', adminController.getDashboard);

// ============================================================
// B. QUẢN LÝ SẢN PHẨM
// ============================================================
// 1. Xem danh sách
router.get('/products', productController.getProducts);

// 2. Thêm mới (GET: Hiển thị form, POST: Xử lý dữ liệu)
router.get('/add-product', productController.getAddProduct);

// QUAN TRỌNG: Thêm middleware 'productUpload' vào giữa route này
router.post('/add-product', productUpload, productController.postAddProduct);

// 3. Xóa sản phẩm
router.post('/delete-product', productController.postDeleteProduct);

// ============================================================
// C. QUẢN LÝ DANH MỤC (CATEGORIES)
// ============================================================
router.get('/categories', categoryController.getCategories);
router.post('/categories', upload.single('image'), categoryController.postAddCategory);
router.post('/categories', categoryController.postAddCategory);
router.post('/delete-category', categoryController.postDeleteCategory); // Xóa

// --- SỬA DANH MỤC ---
router.get('/edit-category/:categoryId', categoryController.getEditCategory);
// THÊM upload.single('image') VÀO GIỮA
router.post('/edit-category', upload.single('image'), categoryController.postEditCategory);
router.post('/edit-category', categoryController.postEditCategory);


module.exports = router;