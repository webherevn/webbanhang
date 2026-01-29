const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARE UPLOAD
const upload = require('../middleware/upload'); 

// 2. IMPORT CONTROLLERS
const adminController = require('../controllers/admin/adminController');
const productController = require('../controllers/admin/productController');
const categoryController = require('../controllers/admin/categoryController');
const postController = require('../controllers/admin/postController');
const pageController = require('../controllers/admin/pageController');
const themeController = require('../controllers/admin/themeController');


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
router.get('/products', productController.getProducts);
router.get('/add-product', productController.getAddProduct);
router.post('/add-product', productUpload, productController.postAddProduct);
router.get('/edit-product/:productId', productController.getEditProduct);
router.post('/edit-product', productUpload, productController.postEditProduct);
router.post('/delete-product', productController.postDeleteProduct);
router.post('/delete-product-image', productController.deleteProductImage);
// ============================================================
// C. QUẢN LÝ DANH MỤC SP
// ============================================================
router.get('/categories', categoryController.getCategories);
router.post('/categories', upload.single('image'), categoryController.postAddCategory);
router.post('/delete-category', categoryController.postDeleteCategory); 
router.get('/edit-category/:categoryId', categoryController.getEditCategory);
router.post('/edit-category', upload.single('image'), categoryController.postEditCategory);

// ============================================================
// D. QUẢN LÝ BLOG (CMS)
// ============================================================
router.get('/blog-categories', postController.getBlogCategories);
router.post('/add-blog-category', upload.single('image'), postController.postAddBlogCategory);
router.get('/edit-blog-category/:categoryId', postController.getEditBlogCategory);
router.post('/edit-blog-category', upload.single('image'), postController.postEditBlogCategory);
router.post('/delete-blog-category', postController.postDeleteBlogCategory);

router.get('/posts', postController.getPosts);
router.get('/add-post', postController.getAddPost);
router.post('/add-post', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), postController.postAddPost);
router.get('/edit-post/:postId', postController.getEditPost);
router.post('/edit-post', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), postController.postEditPost);
router.post('/delete-post', postController.postDeletePost);

// ============================================================
// E. CẤU HÌNH HỆ THỐNG (SCRIPTS)
// ============================================================
router.get('/settings', adminController.getSettings);
router.post('/settings/scripts', adminController.postSettings);

// ============================================================
// F. QUẢN LÝ TRANG (PAGES) - ĐÃ FIX LỖI TRÙNG LẶP
// ============================================================
router.get('/pages', pageController.getPages);
router.get('/add-page', pageController.getAddPage);

// Chỉ giữ lại route có upload.single để xử lý cả Ảnh và Dữ liệu chữ
router.post('/add-page', upload.single('thumbnail'), pageController.postAddPage);

router.get('/edit-page/:pageId', pageController.getEditPage);

// Chỉ giữ lại route có upload.single
router.post('/edit-page', upload.single('thumbnail'), pageController.postEditPage);

router.post('/delete-page', pageController.postDeletePage);



// Quản lý giao diện - CHUYỂN TỪ themeController SANG adminController
router.get('/customize', adminController.getCustomize); 
router.post('/customize', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), adminController.postCustomize);

module.exports = router;