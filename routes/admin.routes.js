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
const settingController = require('../controllers/admin/settingController');
const seoController = require('../controllers/admin/seoController');

// 3. CẤU HÌNH UPLOAD NÂNG CAO (Hỗ trợ Social SEO)
const productUpload = upload.fields([
    { name: 'thumbnail', maxCount: 1 }, 
    { name: 'gallery', maxCount: 10 },
    { name: 'ogImage', maxCount: 1 } // [MỚI] Ảnh chia sẻ MXH cho sản phẩm
]);

const postUpload = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'ogImage', maxCount: 1 } // [MỚI] Ảnh chia sẻ MXH cho bài viết
]);

const pageUpload = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'ogImage', maxCount: 1 } // [MỚI] Ảnh chia sẻ MXH cho trang tĩnh
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
router.post('/settings/menu/update', settingController.postUpdateMenu);

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
router.post('/add-post', postUpload, postController.postAddPost); // Sử dụng postUpload
router.get('/edit-post/:postId', postController.getEditPost);
router.post('/edit-post', postUpload, postController.postEditPost); // Sử dụng postUpload
router.post('/delete-post', postController.postDeletePost);

// ============================================================
// E. CẤU HÌNH HỆ THỐNG (SCRIPTS)
// ============================================================
router.get('/settings', adminController.getSettings);
router.post('/settings/scripts', adminController.postSettings);

// ============================================================
// F. QUẢN LÝ TRANG (PAGES)
// ============================================================
router.get('/pages', pageController.getPages);
router.get('/add-page', pageController.getAddPage);
router.post('/add-page', pageUpload, pageController.postAddPage); // Chuyển sang pageUpload
router.get('/edit-page/:pageId', pageController.getEditPage);
router.post('/edit-page', pageUpload, pageController.postEditPage); // Chuyển sang pageUpload
router.post('/delete-page', pageController.postDeletePage);

// ============================================================
// G. GIAO DIỆN & MENU
// ============================================================
router.get('/customize', adminController.getCustomize); 
router.post('/customize', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), adminController.postCustomize);

router.get('/settings/menu', settingController.getMenuSettings);
router.post('/settings/menu/add', settingController.postAddMenu);
router.post('/settings/menu/delete', settingController.postDeleteMenu);

router.get('/settings/index', settingController.getIndexSettings);
router.post('/settings/index', settingController.postIndexSettings);

// ============================================================
// H. SEO (SITEMAP / ROBOTS / REDIRECTS / SOCIAL)
// ============================================================

// 1. Chuyển hướng
router.get('/seo/redirects', seoController.getRedirects);
router.post('/seo/redirects/add', seoController.postAddRedirect);
router.post('/seo/redirects/delete', seoController.postDeleteRedirect);

// 2. Sitemap & Robots
router.get('/seo/sitemap', seoController.getSitemapPage);
router.get('/seo/robots', seoController.getRobotsSettings);
router.post('/seo/robots', seoController.postRobotsSettings);

// 3. Schema Global
router.get('/seo/schema', seoController.getGlobalSchema);
router.post('/seo/schema', seoController.postGlobalSchema);

// 4. Theo dõi lỗi 404
router.get('/seo/404-monitor', seoController.getMonitor404);
router.post('/seo/404-monitor/delete', seoController.postDelete404);

// 5. [MỚI] Mạng xã hội (Open Graph)
router.get('/seo/social', seoController.getSocialSettings);
router.post('/seo/social', upload.single('defaultOgImage'), seoController.postSocialSettings);

module.exports = router;