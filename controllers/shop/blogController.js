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
        const slug = req.params.slug;

        // 1. Tìm chuyên mục theo slug
        const category = await BlogCategory.findOne({ slug: slug });
        
        if (!category) {
            return res.redirect('/blog'); // Không thấy chuyên mục thì về trang chung
        }

        // 2. Tìm bài viết thuộc chuyên mục đó
        const posts = await Post.find({ 
            category: category._id, 
            isActive: true 
        }).sort({ createdAt: -1 }).populate('category');

        // 3. Lấy lại danh sách tất cả chuyên mục cho sidebar
        const categories = await BlogCategory.find();

        res.render('shop/blog-list', {
            pageTitle: category.name,
            path: '/blog',
            posts: posts,
            categories: categories,
            currentCategory: category // Gửi dữ liệu chuyên mục hiện tại để hiển thị tên/mô tả bài viết
        });
    } catch (err) {
        console.log("❌ Lỗi lọc chuyên mục:", err);
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