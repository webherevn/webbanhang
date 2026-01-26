const Category = require('../../models/CategoryModel');

// Hiển thị trang quản lý danh mục
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        // Bạn cần tạo file view: views/admin/category-manager.ejs
        // Nếu chưa kịp tạo view, tạm thời render lại dashboard hoặc text để test
        res.render('admin/category-manager', { 
            pageTitle: 'Quản lý danh mục',
            path: '/admin/categories',
            categories: categories
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

// Xử lý thêm danh mục mới
exports.postAddCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        // Tạo Slug tự động trong Model rồi nên không cần làm ở đây
        await Category.create({ name, description });
        res.redirect('/admin/categories'); // Load lại trang
    } catch (err) {
        console.log("Lỗi thêm danh mục:", err);
        res.redirect('/admin/categories');
    }
};