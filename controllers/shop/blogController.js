// controllers/shop/blogController.js
const Post = require('../../models/PostModel');
const BlogCategory = require('../../models/BlogCategoryModel');

// 1. Xem danh sách tin tức
exports.getIndex = async (req, res) => {
    try {
        // Lấy bài viết active, mới nhất lên đầu
        const posts = await Post.find({ isActive: true }).sort({ createdAt: -1 });
        
        // Lấy danh mục để hiển thị bên sidebar (nếu cần)
        const categories = await BlogCategory.find();

        res.render('shop/blog-list', {
            pageTitle: 'Tin tức & Sự kiện',
            path: '/blog',
            posts: posts,
            categories: categories
        });
    } catch (err) { 
        console.log("❌ Lỗi Blog Index:", err); 
        res.redirect('/'); 
    }
};

// 2. Xem chi tiết bài viết
exports.getDetail = async (req, res) => {
    try {
        const slug = req.params.slug;
        
        // Tìm bài viết theo slug
        const post = await Post.findOne({ slug: slug }).populate('category');

        if (!post) {
            return res.redirect('/blog');
        }

        // Tăng view mỗi khi có người đọc
        post.views += 1;
        await post.save();

        // Tìm bài viết liên quan (cùng danh mục, trừ bài đang xem)
        let relatedPosts = [];
        if (post.category) {
            relatedPosts = await Post.find({ 
                category: post.category._id, 
                _id: { $ne: post._id } 
            }).limit(3);
        }

        res.render('shop/blog-detail', {
            pageTitle: post.title,
            path: '/blog',
            post: post,
            relatedPosts: relatedPosts
        });
    } catch (err) { 
        console.log("❌ Lỗi Blog Detail:", err); 
        res.redirect('/blog'); 
    }
};