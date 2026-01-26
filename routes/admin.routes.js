const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARE UPLOAD
const upload = require('../middleware/upload'); 

// 2. IMPORT CONTROLLERS
const adminController = require('../controllers/admin/adminController');
const productController = require('../controllers/admin/productController');
const categoryController = require('../controllers/admin/categoryController');
// --- ĐOẠN 1: Thêm dòng này ở đầu file ---
const postController = require('../controllers/admin/postController');

// Dán đoạn này vào sau các dòng require trong admin.routes.js
console.log("--- KIỂM TRA HÀM TRONG CONTROLLER ---");
console.log("AdminController:", Object.keys(adminController || {}));
console.log("ProductController:", Object.keys(productController || {}));
console.log("CategoryController:", Object.keys(categoryController || {}));
console.log("PostController:", Object.keys(postController || {}));
console.log("-------------------------------------");

// 3. CẤU HÌNH UPLOAD CHO SẢN PHẨM
const productUpload = upload.fields([
    { name: 'thumbnail', maxCount: 1 }, 
    { name: 'gallery', maxCount: 10 }   
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

// 2. Thêm mới
router.get('/add-product', productController.getAddProduct);
router.post('/add-product', productUpload, productController.postAddProduct);

// 3. Sửa sản phẩm (ĐÂY LÀ ĐOẠN BẠN ĐANG THIẾU)
// ------------------------------------------------------------
router.get('/edit-product/:productId', productController.getEditProduct);
router.post('/edit-product', productUpload, productController.postEditProduct);
// ------------------------------------------------------------

// 4. Xóa sản phẩm
router.post('/delete-product', productController.postDeleteProduct);

// ============================================================
// C. QUẢN LÝ DANH MỤC (CATEGORIES)
// ============================================================
// 1. Xem và Thêm
router.get('/categories', categoryController.getCategories);

// (Đã xóa dòng thừa, chỉ giữ lại dòng có upload)
router.post('/categories', upload.single('image'), categoryController.postAddCategory);

// 2. Xóa
router.post('/delete-category', categoryController.postDeleteCategory); 

// 3. Sửa danh mục
router.get('/edit-category/:categoryId', categoryController.getEditCategory);

// (Đã xóa dòng thừa, chỉ giữ lại dòng có upload)
router.post('/edit-category', upload.single('image'), categoryController.postEditCategory);

// =============================================
// QUẢN LÝ BLOG (CMS) - THÊM ĐOẠN NÀY VÀO
// =============================================

// 1. Quản lý Chuyên mục
router.get('/blog-categories', postController.getBlogCategories);
router.post('/add-blog-category', postController.postAddBlogCategory);
// Thêm các route này vào phần Quản lý Blog
router.post('/delete-blog-category', postController.postDeleteBlogCategory);
router.get('/edit-blog-category/:categoryId', postController.getEditBlogCategory);
router.post('/edit-blog-category', postController.postEditBlogCategory);
// Tìm đến phần Blog Categories trong file routes của bạn
router.post('/add-blog-category', upload.single('image'), postController.postAddBlogCategory);
router.post('/edit-blog-category', upload.single('image'), postController.postEditBlogCategory);


// 2. Quản lý Bài viết
router.get('/posts', postController.getPosts); // Danh sách
router.get('/add-post', postController.getAddPost); // Form thêm
router.post('/delete-post', postController.postDeletePost); // Xóa

// Lưu ý: Dùng upload.fields để khớp với logic controller
router.post('/add-post', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), postController.postAddPost);

module.exports = router;