const Page = require('../../models/PageModel');
const slugify = require('slugify');

exports.getPages = async (req, res) => {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.render('admin/page-list', { pageTitle: 'Danh sách trang', path: '/admin/pages', pages });
};

exports.getAddPage = (req, res) => {
    res.render('admin/page-form', { pageTitle: 'Thêm trang mới', path: '/admin/pages', editing: false });
};

exports.postAddPage = async (req, res) => {
    const { title, content, isActive } = req.body;
    const slug = slugify(title, { lower: true, strict: true });
    await Page.create({ title, content, slug, isActive: isActive === 'on' });
    res.redirect('/admin/pages');
};
// ... (Tương tự cho Edit và Delete)
// Hiển thị form chỉnh sửa trang
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

// Xử lý cập nhật trang
exports.postEditPage = async (req, res) => {
    try {
        const { pageId, title, content, isActive } = req.body;
        const slug = slugify(title, { lower: true, strict: true });

        await Page.findByIdAndUpdate(pageId, {
            title,
            content,
            slug,
            isActive: isActive === 'on'
        });
        res.redirect('/admin/pages');
    } catch (err) { res.redirect('/admin/pages'); }
};

// Xóa trang
exports.postDeletePage = async (req, res) => {
    try {
        const { pageId } = req.body;
        await Page.findByIdAndDelete(pageId);
        res.redirect('/admin/pages');
    } catch (err) { res.redirect('/admin/pages'); }
};