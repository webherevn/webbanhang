const Post = require('../../models/PostModel');
const BlogCategory = require('../../models/BlogCategoryModel');
const slugify = require('slugify');

// --- 1. QUẢN LÝ CHUYÊN MỤC ---
exports.getBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find();
        res.render('admin/blog-category-list', { 
            pageTitle: 'Quản lý chuyên mục tin tức', 
            path: '/admin/blog-categories',
            categories: categories 
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

exports.postAddBlogCategory = async (req, res) => {
    try {
        const { name } = req.body;
        // Tạo slug đơn giản cho chuyên mục
        const slug = slugify(name, { lower: true, strict: true });
        
        await BlogCategory.create({ name, slug });
        res.redirect('/admin/blog-categories');
    } catch (err) { 
        console.log(err); 
        res.redirect('/admin/blog-categories'); 
    }
};

// --- 2. QUẢN LÝ BÀI VIẾT ---

// A. Hiển thị danh sách bài viết
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('category').sort({ createdAt: -1 });
        res.render('admin/post-list', { 
            pageTitle: 'Danh sách bài viết', 
            path: '/admin/posts',
            posts: posts 
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

// B. Hiển thị Form viết bài mới
exports.getAddPost = async (req, res) => {
    try {
        const categories = await BlogCategory.find();
        res.render('admin/post-form', { 
            pageTitle: 'Viết bài mới', 
            path: '/admin/add-post',
            categories: categories,
            editing: false // Đánh dấu là đang thêm mới
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/posts');
    }
};

// C. Xử lý lưu bài viết (Có Logic Slug thông minh)
exports.postAddPost = async (req, res) => {
    try {
        const { title, content, summary, categoryId } = req.body;
        
        // Xử lý ảnh (Thumbnail)
        // Lưu ý: Bên Route mình sẽ dùng upload.single('thumbnail')
        const thumbnail = req.file ? req.file.path : 'https://via.placeholder.com/300';

        // --- TẠO SLUG CHUẨN SEO (KHÔNG TRÙNG) ---
        let postSlug = slugify(title, { lower: true, strict: true });
        let originalSlug = postSlug;
        let count = 1;

        // Vòng lặp kiểm tra trùng lặp
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

        console.log(`✅ Đã đăng bài: ${title}`);
        res.redirect('/admin/posts');

    } catch (err) {
        console.log("❌ Lỗi đăng bài:", err);
        res.redirect('/admin/posts');
    }
};