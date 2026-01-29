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
        editing: false,
        page: {} // Truyền object rỗng để tránh lỗi EJS khi render fields
    });
};

// 3. Xử lý thêm mới (POST)
exports.postAddPage = async (req, res) => {
    try {
        const { 
            title, content, isActive,
            seoTitle, seoDescription, focusKeyword, customSchema,
            ogTitle, ogDescription 
        } = req.body;

        const slug = slugify(title, { lower: true, strict: true });
        
        // Xử lý ảnh từ upload.fields
        let thumbnail = '';
        let ogImage = '';
        if (req.files) {
            if (req.files['thumbnail']) thumbnail = req.files['thumbnail'][0].path;
            if (req.files['ogImage']) ogImage = req.files['ogImage'][0].path;
        }

        await Page.create({
            title,
            content,
            slug,
            thumbnail,
            ogImage,
            isActive: isActive === 'on',
            // Lưu dữ liệu SEO & Social & Schema
            seoTitle,
            seoDescription,
            focusKeyword,
            customSchema,
            ogTitle,
            ogDescription
        });

        res.redirect('/admin/pages');
    } catch (err) {
        console.error("❌ Lỗi thêm trang:", err);
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
        const { 
            pageId, title, content, isActive,
            seoTitle, seoDescription, focusKeyword, customSchema,
            ogTitle, ogDescription 
        } = req.body;

        const page = await Page.findById(pageId);
        if (!page) return res.redirect('/admin/pages');

        // Cập nhật thông tin cơ bản & SEO
        page.title = title;
        page.content = content;
        page.isActive = isActive === 'on';
        page.slug = slugify(title, { lower: true, strict: true });
        
        page.seoTitle = seoTitle;
        page.seoDescription = seoDescription;
        page.focusKeyword = focusKeyword;
        page.customSchema = customSchema;
        page.ogTitle = ogTitle;
        page.ogDescription = ogDescription;

        // Xử lý cập nhật ảnh mới nếu có
        if (req.files) {
            if (req.files['thumbnail']) page.thumbnail = req.files['thumbnail'][0].path;
            if (req.files['ogImage']) page.ogImage = req.files['ogImage'][0].path;
        }

        await page.save();
        res.redirect('/admin/pages');
    } catch (err) {
        console.error("❌ Lỗi cập nhật trang:", err);
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