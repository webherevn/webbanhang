// controllers/admin/postController.js
const Post = require('../../models/PostModel');
const BlogCategory = require('../../models/BlogCategoryModel');
const slugify = require('slugify');

// ==========================================
// 1. QUẢN LÝ CHUYÊN MỤC
// ==========================================
exports.getBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find().sort({ createdAt: -1 });
        res.render('admin/blog-category-list', { 
            pageTitle: 'Quản lý Chuyên mục', 
            path: '/admin/blog-categories',
            categories: categories 
        });
    } catch (err) { console.log(err); res.redirect('/admin'); }
};

// XỬ LÝ THÊM CHUYÊN MỤC (Đã cập nhật Mô tả & Ảnh)
exports.postAddBlogCategory = async (req, res) => {
    try {
        const { name, description } = req.body; // Thêm description
        const slug = name ? slugify(name, { lower: true, strict: true }) : '';
        
        // Lấy ảnh từ req.file (do route dùng upload.single('image'))
        let image = "";
        if (req.file) {
            image = req.file.path;
        }
        
        await BlogCategory.create({ name, slug, description, image });
        console.log(`✅ Đã thêm chuyên mục: ${name}`);
        res.redirect('/admin/blog-categories');
    } catch (err) { 
        console.log("❌ Lỗi thêm chuyên mục:", err);
        res.redirect('/admin/blog-categories'); 
    }
};

// XỬ LÝ LƯU SỬA ĐỔI CHUYÊN MỤC (Đã cập nhật Mô tả & Ảnh)
exports.postEditBlogCategory = async (req, res) => {
    try {
        const { categoryId, name, description } = req.body; // Thêm description
        const category = await BlogCategory.findById(categoryId);
        
        if (!category) return res.redirect('/admin/blog-categories');

        category.name = name;
        category.description = description; // Cập nhật mô tả
        category.slug = slugify(name, { lower: true, strict: true });

        // Cập nhật ảnh mới nếu có upload
        if (req.file) {
            category.image = req.file.path;
        }

        await category.save();
        console.log(`✅ Đã cập nhật chuyên mục: ${name}`);
        res.redirect('/admin/blog-categories');
    } catch (err) { 
        console.log("❌ Lỗi sửa chuyên mục:", err);
        res.redirect('/admin/blog-categories'); 
    }
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

// ==========================================
// 2. QUẢN LÝ BÀI VIẾT (GIỮ NGUYÊN)
// ==========================================

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

exports.postAddPost = async (req, res) => {
    try {
        const { title, content, summary, categoryId } = req.body;
        let thumbnail = 'https://via.placeholder.com/300';
        if (req.files && req.files['thumbnail']) {
            thumbnail = req.files['thumbnail'][0].path;
        }

        let postSlug = slugify(title, { lower: true, strict: true });
        let originalSlug = postSlug;
        let count = 1;
        while (await Post.findOne({ slug: postSlug })) {
            postSlug = `${originalSlug}-${count}`;
            count++;
        }

        await Post.create({
            title, slug: postSlug, content, summary, thumbnail, category: categoryId
        });

        res.redirect('/admin/posts');
    } catch (err) {
        console.log("❌ Lỗi thêm bài:", err);
        res.redirect('/admin/posts');
    }
};

exports.postDeletePost = async (req, res) => {
    try {
        const postId = req.body.postId;
        await Post.findByIdAndDelete(postId);
        res.redirect('/admin/posts');
    } catch (err) { console.log(err); res.redirect('/admin/posts'); }
};

// controllers/admin/postController.js

// A. Hiển thị form sửa
exports.getEditPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId).populate('category');
        const categories = await BlogCategory.find();

        if (!post) return res.redirect('/admin/posts');

        res.render('admin/post-form', {
            pageTitle: 'Chỉnh sửa bài viết',
            path: '/admin/posts',
            post: post,
            categories: categories,
            editing: true // Biến để EJS biết đang ở chế độ Sửa
        });
    } catch (err) { res.redirect('/admin/posts'); }
};

// B. Xử lý cập nhật bài viết
exports.postEditPost = async (req, res) => {
    try {
        const { postId, title, content, summary, categoryId } = req.body;
        const post = await Post.findById(postId);

        post.title = title;
        post.content = content;
        post.summary = summary;
        post.category = categoryId;
        
        // Cập nhật slug mới dựa trên title mới
        post.slug = slugify(title, { lower: true, strict: true });

        // Nếu có upload ảnh thumbnail mới
        if (req.files && req.files['thumbnail']) {
            post.thumbnail = req.files['thumbnail'][0].path;
        }

        await post.save();
        res.redirect('/admin/posts');
    } catch (err) { res.redirect('/admin/posts'); }
};