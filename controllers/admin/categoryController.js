const Category = require('../../models/CategoryModel');

// 1. HIỂN THỊ TRANG QUẢN LÝ DANH MỤC
exports.getCategories = async (req, res) => {
    try {
        // Lấy tất cả danh mục, mới nhất lên đầu
        const categories = await Category.find().sort({ createdAt: -1 });

        res.render('admin/category-manager', {
            pageTitle: 'Danh mục sản phẩm',
            path: '/admin/categories',
            categories: categories
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

// 2. XỬ LÝ THÊM DANH MỤC MỚI
exports.postAddCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Kiểm tra rỗng
        if (!name || name.trim() === '') {
            return res.redirect('/admin/categories');
        }

        // Tạo mới (Slug tự động tạo bên Model rồi)
        await Category.create({ 
            name: name, 
            description: description 
        });

        console.log(`✅ Đã thêm danh mục: ${name}`);
        res.redirect('/admin/categories');

    } catch (err) {
        // Nếu lỗi trùng tên (duplicate key) hoặc lỗi khác
        console.log("❌ Lỗi thêm danh mục:", err);
        res.redirect('/admin/categories');
    }
};

// 3. XÓA DANH MỤC
exports.postDeleteCategory = async (req, res) => {
    try {
        const catId = req.body.categoryId;
        await Category.findByIdAndDelete(catId);
        console.log(`🗑️ Đã xóa danh mục ID: ${catId}`);
        res.redirect('/admin/categories');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/categories');
    }
};