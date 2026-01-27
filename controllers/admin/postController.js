const Post = require('../../models/PostModel');
const BlogCategory = require('../../models/BlogCategoryModel');
const slugify = require('slugify');

// ==========================================
// 1. QUẢN LÝ CHUYÊN MỤC (GIỮ NGUYÊN)
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

exports.postAddBlogCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const slug = name ? slugify(name, { lower: true, strict: true }) : '';
        let image = "";
        if (req.file) { image = req.file.path; }
        await BlogCategory.create({ name, slug, description, image });
        res.redirect('/admin/blog-categories');
    } catch (err) { res.redirect('/admin/blog-categories'); }
};

exports.postEditBlogCategory = async (req, res) => {
    try {
        const { categoryId, name, description } = req.body;
        const category = await BlogCategory.findById(categoryId);
        if (!category) return res.redirect('/admin/blog-categories');
        category.name = name;
        category.description = description;
        category.slug = slugify(name, { lower: true, strict: true });
        if (req.file) { category.image = req.file.path; }
        await category.save();
        res.redirect('/admin/blog-categories');
    } catch (err) { res.redirect('/admin/blog-categories'); }
};

exports.postDeleteBlogCategory = async (req, res) => {
    try {
        const catId = req.body.categoryId;
        await BlogCategory.findByIdAndDelete(catId);
        res.redirect('/admin/blog-categories');
    } catch (err) { res.redirect('/admin/blog-categories'); }
};

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
// 2. QUẢN LÝ BÀI VIẾT (CẬP NHẬT SEO)
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
    } catch (err) { res.redirect('/admin/posts'); }
};

// --- CẬP NHẬT HÀM THÊM BÀI VIẾT ---
exports.postAddPost = async (req, res) => {
    try {
        // Thêm các trường SEO từ req.body
        const { title, content, summary, categoryId, seoTitle, seoDescription, focusKeyword } = req.body;
        
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
            title, 
            slug: postSlug, 
            content, 
            summary, 
            thumbnail, 
            category: categoryId,
            // Lưu dữ liệu SEO mới
            seoTitle: seoTitle,
            seoDescription: seoDescription,
            focusKeyword: focusKeyword
        });

        res.redirect('/admin/posts');
    } catch (err) {
        console.log("❌ Lỗi thêm bài:", err);
        res.redirect('/admin/posts');
    }
};

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
            editing: true
        });
    } catch (err) { res.redirect('/admin/posts'); }
};

// --- CẬP NHẬT HÀM SỬA BÀI VIẾT ---
exports.postEditPost = async (req, res) => {
    try {
        // Thêm các trường SEO từ req.body
        const { postId, title, content, summary, categoryId, seoTitle, seoDescription, focusKeyword } = req.body;
        const post = await Post.findById(postId);

        if (!post) return res.redirect('/admin/posts');

        post.title = title;
        post.content = content;
        post.summary = summary;
        post.category = categoryId;
        
        // Cập nhật các trường SEO
        post.seoTitle = seoTitle;
        post.seoDescription = seoDescription;
        post.focusKeyword = focusKeyword;
        
        post.slug = slugify(title, { lower: true, strict: true });

        if (req.files && req.files['thumbnail']) {
            post.thumbnail = req.files['thumbnail'][0].path;
        }

        await post.save();
        res.redirect('/admin/posts');
    } catch (err) { 
        console.log("❌ Lỗi sửa bài:", err);
        res.redirect('/admin/posts'); 
    }
};

exports.postDeletePost = async (req, res) => {
    try {
        const postId = req.body.postId;
        await Post.findByIdAndDelete(postId);
        res.redirect('/admin/posts');
    } catch (err) { res.redirect('/admin/posts'); }
};