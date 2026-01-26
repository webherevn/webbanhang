const slugify = require('slugify');
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

// 2. XỬ LÝ THÊM DANH MỤC MỚI (CẬP NHẬT)
exports.postAddCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // 1. Lấy link ảnh (Nếu có upload)
        let imageUrl = "";
        if (req.file) {
            imageUrl = req.file.path;
        }

        // 2. Kiểm tra tên
        if (!name || name.trim() === '') {
            return res.redirect('/admin/categories');
        }

        // 3. Tạo mới
        await Category.create({ 
            name: name, 
            description: description,
            image: imageUrl // <--- Lưu ảnh vào đây
        });

        console.log(`✅ Đã thêm danh mục: ${name}`);
        res.redirect('/admin/categories');

    } catch (err) {
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

// 4. HIỂN THỊ TRANG SỬA DANH MỤC
exports.getEditCategory = async (req, res) => {
    try {
        const catId = req.params.categoryId;
        const category = await Category.findById(catId);

        if (!category) {
            return res.redirect('/admin/categories');
        }

        res.render('admin/category-edit', { // Chúng ta sẽ tạo file view này ở Bước 3
            pageTitle: 'Chỉnh sửa danh mục',
            path: '/admin/categories',
            category: category
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/categories');
    }
};

// 5. XỬ LÝ LƯU SỬA ĐỔI
exports.postEditCategory = async (req, res) => {
    try {
        const { categoryId, name, description } = req.body;

        // Tìm danh mục theo ID
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.redirect('/admin/categories');
        }

        // Cập nhật thông tin
        category.name = name;
        category.description = description;
        
        // Cập nhật Slug mới nếu tên thay đổi
        if (name) {
            category.slug = slugify(name, { lower: true, strict: true });
        }

        await category.save();

        console.log(`✅ Đã cập nhật danh mục: ${name}`);
        res.redirect('/admin/categories');

    } catch (err) {
        console.log("❌ Lỗi cập nhật:", err);
        res.redirect('/admin/categories');
    }
};