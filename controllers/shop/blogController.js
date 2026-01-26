// controllers/shop/blogController.js
const Post = require('../../models/PostModel');
const BlogCategory = require('../../models/BlogCategoryModel');

// 1. Xem tất cả tin tức
exports.getIndex = async (req, res) => {
    try {
        const posts = await Post.find({ isActive: true }).sort({ createdAt: -1 }).populate('category');
        const categories = await BlogCategory.find();

        res.render('shop/blog-list', {
            pageTitle: 'Tin tức & Sự kiện',
            path: '/blog',
            posts: posts,
            categories: categories,
            currentCategory: null // Để biết đang ở trang "Tất cả"
        });
    } catch (err) { 
        console.log("❌ Lỗi Blog Index:", err); 
        res.redirect('/'); 
    }
};

// 2. MỚI: Xem tin tức theo Chuyên mục (Chuẩn SEO)
exports.getPostsByCategory = async (req, res) => {
    try {
        const slug = req.params.slug; // Lấy slug từ URL: /blog/tin-tuc

        // 1. Tìm chuyên mục trong DB dựa trên slug
        const category = await BlogCategory.findOne({ slug: slug });
        
        if (!category) {
            // Nếu không tìm thấy chuyên mục nào trùng slug, quay về trang blog chính
            return res.redirect('/blog');
        }

        // 2. Lấy các bài viết thuộc chuyên mục này
        const posts = await Post.find({ 
            category: category._id, 
            isActive: true 
        }).sort({ createdAt: -1 }).populate('category');

        const categories = await BlogCategory.find();

        res.render('shop/blog-list', {
            pageTitle: category.name,
            path: '/blog',
            posts: posts,
            categories: categories,
            currentCategory: category
        });
    } catch (err) {
        res.redirect('/blog');
    }
};

// 3. Xem chi tiết bài viết
exports.getDetail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const post = await Post.findOne({ slug: slug, isActive: true }).populate('category');

        if (!post) return res.redirect('/blog');

        post.views += 1;
        await post.save();

        let relatedPosts = [];
        if (post.category) {
            relatedPosts = await Post.find({ 
                category: post.category._id, 
                _id: { $ne: post._id },
                isActive: true 
            }).limit(3);
        }

        res.render('shop/blog-detail', {
            pageTitle: post.title,
            path: '/blog',
            post: post,
            relatedPosts: relatedPosts
        });
    } catch (err) { 
        res.redirect('/blog'); 
    }
};