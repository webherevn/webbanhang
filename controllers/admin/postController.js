// controllers/admin/postController.js
const Post = require('../../models/PostModel');
const BlogCategory = require('../../models/BlogCategoryModel');
const slugify = require('slugify');

// 1. Phải có chữ exports.
exports.getBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find();
        res.render('admin/blog-category-list', { 
            pageTitle: 'Quản lý Chuyên mục', 
            path: '/admin/blog-categories',
            categories: categories 
        });
    } catch (err) { res.redirect('/admin'); }
};

exports.postAddBlogCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const slug = slugify(name || '', { lower: true, strict: true });
        await BlogCategory.create({ name, slug });
        res.redirect('/admin/blog-categories');
    } catch (err) { res.redirect('/admin/blog-categories'); }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('category').sort({ createdAt: -1 });
        res.render('admin/post-list', { 
            pageTitle: 'Quản lý Bài viết', 
            path: '/admin/posts',
            posts: posts 
        });
    } catch (err) { res.redirect('/admin'); }
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

exports.postAddPost = async (req, res) => {
    try {
        const { title, content, summary, categoryId } = req.body;
        let thumbnail = 'https://via.placeholder.com/300';
        if (req.files && req.files['thumbnail']) {
            thumbnail = req.files['thumbnail'][0].path;
        }
        let postSlug = slugify(title || '', { lower: true, strict: true });
        // ... (phần logic check trùng slug giữ nguyên)
        await Post.create({ title, slug: postSlug, content, summary, thumbnail, category: categoryId });
        res.redirect('/admin/posts');
    } catch (err) { res.redirect('/admin/posts'); }
};

exports.postDeletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.body.postId);
        res.redirect('/admin/posts');
    } catch (err) { res.redirect('/admin/posts'); }
};