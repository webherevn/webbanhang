const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARE UPLOAD
const upload = require('../middleware/upload'); 

// 2. IMPORT CONTROLLERS
const adminController = require('../controllers/admin/adminController');
const productController = require('../controllers/admin/productController');
const categoryController = require('../controllers/admin/categoryController');
const postController = require('../controllers/admin/postController');

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
// B. QUẢN LÝ SẢN PHẨM (GIỮ NGUYÊN)
// ============================================================
router.get('/products', productController.getProducts);
router.get('/add-product', productController.getAddProduct);
router.post('/add-product', productUpload, productController.postAddProduct);
router.get('/edit-product/:productId', productController.getEditProduct);
router.post('/edit-product', productUpload, productController.postEditProduct);
router.post('/delete-product', productController.postDeleteProduct);

// ============================================================
// C. QUẢN LÝ DANH MỤC SP (GIỮ NGUYÊN)
// ============================================================
router.get('/categories', categoryController.getCategories);
router.post('/categories', upload.single('image'), categoryController.postAddCategory);
router.post('/delete-category', categoryController.postDeleteCategory); 
router.get('/edit-category/:categoryId', categoryController.getEditCategory);
router.post('/edit-category', upload.single('image'), categoryController.postEditCategory);

// ============================================================
// D. QUẢN LÝ BLOG (CMS) - PHẦN ĐÃ FIX LỖI TRÙNG LẶP
// ============================================================
// 1. Quản lý Chuyên mục Blog
router.get('/blog-categories', postController.getBlogCategories);

// Thêm mới chuyên mục (Có upload ảnh để nhận được req.body)
router.post('/add-blog-category', upload.single('image'), postController.postAddBlogCategory);

// Sửa chuyên mục
router.get('/edit-blog-category/:categoryId', postController.getEditBlogCategory);
router.post('/edit-blog-category', upload.single('image'), postController.postEditBlogCategory);

// Xóa chuyên mục
router.post('/delete-blog-category', postController.postDeleteBlogCategory);

// 2. Quản lý Bài viết Blog
router.get('/posts', postController.getPosts);
router.get('/add-post', postController.getAddPost);
router.post('/delete-post', postController.postDeletePost);

// 1. Trang hiển thị form sửa (GET)
router.get('/edit-post/:postId', postController.getEditPost);

// 2. Xử lý lưu dữ liệu sửa (POST) - Nhớ dùng upload.fields để nhận ảnh
router.post('/edit-post', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), postController.postEditPost);


// Upload ảnh cho bài viết (Dùng fields vì thường có thumbnail)
router.post('/add-post', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), postController.postAddPost);

module.exports = router;