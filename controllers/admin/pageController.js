const Page = require('../../models/PageModel');
const slugify = require('slugify');

// 1. Danh sách trang
exports.getPages = async (req, res) => {
    try {
        const pages = await Page.find().sort({ createdAt: -1 });
        res.render('admin/page-list', {
            pageTitle: 'Danh sách trang',
            path: '/admin/pages',
            pages: pages
        });
    } catch (err) { res.redirect('/admin'); }
};

// 2. Trang thêm mới (GET)
exports.getAddPage = (req, res) => {
    res.render('admin/page-form', {
        pageTitle: 'Thêm trang mới',
        path: '/admin/pages',
        editing: false
    });
};

// 3. Xử lý thêm mới (POST)
exports.postAddPage = async (req, res) => {
    try {
        const { title, content, isActive } = req.body;
        const slug = slugify(title, { lower: true, strict: true });
        
        // Lấy link ảnh từ Cloudinary nếu có tải lên
        const thumbnail = req.file ? req.file.path : '';

        await Page.create({
            title,
            content,
            slug,
            thumbnail,
            isActive: isActive === 'on'
        });

        res.redirect('/admin/pages');
    } catch (err) {
        console.error("Lỗi thêm trang:", err);
        res.redirect('/admin/add-page');
    }
};

// 4. Trang chỉnh sửa (GET)
exports.getEditPage = async (req, res) => {
    try {
        const pageId = req.params.pageId;
        const page = await Page.findById(pageId);
        if (!page) return res.redirect('/admin/pages');

        res.render('admin/page-form', {
            pageTitle: 'Chỉnh sửa trang',
            path: '/admin/pages',
            page: page,
            editing: true
        });
    } catch (err) { res.redirect('/admin/pages'); }
};

// 5. Xử lý cập nhật (POST)
exports.postEditPage = async (req, res) => {
    try {
        const { pageId, title, content, isActive } = req.body;
        const page = await Page.findById(pageId);

        if (!page) return res.redirect('/admin/pages');

        // Cập nhật thông tin cơ bản
        page.title = title;
        page.content = content;
        page.isActive = isActive === 'on';
        
        // Cập nhật lại slug theo tiêu đề mới
        page.slug = slugify(title, { lower: true, strict: true });

        // Nếu có upload ảnh mới thì thay thế, không thì giữ ảnh cũ
        if (req.file) {
            page.thumbnail = req.file.path;
        }

        await page.save(); // Lưu lại thay đổi
        res.redirect('/admin/pages');
    } catch (err) {
        console.error("Lỗi cập nhật trang:", err);
        res.redirect('/admin/pages');
    }
};

// 6. Xóa trang
exports.postDeletePage = async (req, res) => {
    try {
        const { pageId } = req.body;
        await Page.findByIdAndDelete(pageId);
        res.redirect('/admin/pages');
    } catch (err) { res.redirect('/admin/pages'); }
};