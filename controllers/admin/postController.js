// controllers/admin/postController.js
const Post = require('../../models/PostModel');
const BlogCategory = require('../../models/BlogCategoryModel');
const slugify = require('slugify');

// ==========================================
// 1. QUẢN LÝ CHUYÊN MỤC
// ==========================================
exports.getBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find();
        res.render('admin/blog-category-list', { 
            pageTitle: 'Quản lý Chuyên mục', 
            path: '/admin/blog-categories',
            categories: categories 
        });
    } catch (err) { console.log(err); res.redirect('/admin'); }
};

exports.postAddBlogCategory = async (req, res) => {
    try {
        const { name } = req.body;
        // Tạo slug, nếu lỗi thì để trống
        const slug = name ? slugify(name, { lower: true, strict: true }) : '';
        
        await BlogCategory.create({ name, slug });
        res.redirect('/admin/blog-categories');
    } catch (err) { console.log(err); res.redirect('/admin/blog-categories'); }
};

// ==========================================
// 2. QUẢN LÝ BÀI VIẾT
// ==========================================

// A. Danh sách bài viết
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('category').sort({ createdAt: -1 });
        res.render('admin/post-list', { 
            pageTitle: 'Quản lý Bài viết', 
            path: '/admin/posts',
            posts: posts 
        });
    } catch (err) { console.log(err); res.redirect('/admin'); }
};

// B. Form Thêm bài viết
exports.getAddPost = async (req, res) => {
    try {
        const categories = await BlogCategory.find();
        res.render('admin/post-form', { 
            pageTitle: 'Viết bài mới', 
            path: '/admin/add-post',
            categories: categories,
            editing: false
        });
    } catch (err) { console.log(err); res.redirect('/admin/posts'); }
};

// C. Xử lý Thêm bài viết (Khớp với upload.fields bên Route)
exports.postAddPost = async (req, res) => {
    try {
        const { title, content, summary, categoryId } = req.body;
        
        // Xử lý ảnh (Do bên route dùng upload.fields nên phải dùng req.files)
        let thumbnail = 'https://via.placeholder.com/300';
        if (req.files && req.files['thumbnail']) {
            thumbnail = req.files['thumbnail'][0].path;
        }

        // Tạo Slug không trùng
        let postSlug = slugify(title, { lower: true, strict: true });
        let originalSlug = postSlug;
        let count = 1;
        while (await Post.findOne({ slug: postSlug })) {
            postSlug = `${originalSlug}-${count}`;
            count++;
        }

        await Post.create({
            title, 
            slug: postSlug, 
            content, 
            summary, 
            thumbnail, 
            category: categoryId
        });

        console.log(`✅ Đã thêm bài viết: ${title}`);
        res.redirect('/admin/posts');

    } catch (err) {
        console.log("❌ Lỗi thêm bài:", err);
        res.redirect('/admin/posts');
    }
};

// D. Xóa bài viết
exports.postDeletePost = async (req, res) => {
    try {
        const postId = req.body.postId;
        await Post.findByIdAndDelete(postId);
        console.log(`🗑️ Đã xóa bài viết ID: ${postId}`);
        res.redirect('/admin/posts');
    } catch (err) { console.log(err); res.redirect('/admin/posts'); }
};

// --- Xóa chuyên mục ---
exports.postDeleteBlogCategory = async (req, res) => {
    try {
        const catId = req.body.categoryId;
        await BlogCategory.findByIdAndDelete(catId);
        res.redirect('/admin/blog-categories');
    } catch (err) { console.log(err); res.redirect('/admin/blog-categories'); }
};

// --- Hiện trang sửa chuyên mục ---
exports.getEditBlogCategory = async (req, res) => {
    try {
        const catId = req.params.categoryId;
        const category = await BlogCategory.findById(catId);
        res.render('admin/blog-category-edit', {
            pageTitle: 'Sửa chuyên mục',
            path: '/admin/blog-categories',
            category: category
        });
    } catch (err) { res.redirect('/admin/blog-categories'); }
};

// --- Xử lý lưu sửa đổi chuyên mục ---
exports.postEditBlogCategory = async (req, res) => {
    try {
        const { categoryId, name } = req.body;
        const slug = slugify(name, { lower: true, strict: true });
        await BlogCategory.findByIdAndUpdate(categoryId, { name, slug });
        res.redirect('/admin/blog-categories');
    } catch (err) { res.redirect('/admin/blog-categories'); }
};