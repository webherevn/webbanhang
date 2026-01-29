const Redirect = require('../../models/RedirectModel');

// ============================================================
// QUẢN LÝ REDIRECTS (CHUYỂN HƯỚNG)
// ============================================================

// 1. Hiển thị danh sách Redirects
exports.getRedirects = async (req, res) => {
    try {
        const redirects = await Redirect.find().sort({ createdAt: -1 });
        
        res.render('admin/seo/redirects', {
            pageTitle: 'Quản lý Chuyển hướng (301)',
            path: '/admin/seo/redirects',
            redirects: redirects
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

// 2. Thêm Redirect Mới
exports.postAddRedirect = async (req, res) => {
    try {
        let { fromPath, toPath } = req.body;

        // Chuẩn hóa dữ liệu: Đảm bảo luôn bắt đầu bằng dấu /
        if (!fromPath.startsWith('/')) fromPath = '/' + fromPath;
        if (!toPath.startsWith('/')) toPath = '/' + toPath;

        // Chống lỗi trùng lặp (nếu đã có link cũ này rồi thì update link mới)
        await Redirect.findOneAndUpdate(
            { fromPath: fromPath },
            { toPath: toPath, isActive: true },
            { upsert: true, new: true }
        );

        res.redirect('/admin/seo/redirects');
    } catch (err) {
        console.error("Lỗi thêm Redirect:", err);
        res.status(500).send("Lỗi Server: " + err.message);
    }
};

// 3. Xóa Redirect
exports.postDeleteRedirect = async (req, res) => {
    try {
        const { id } = req.body;
        await Redirect.findByIdAndDelete(id);
        res.redirect('/admin/seo/redirects');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/seo/redirects');
    }
};

// 1. Hiển thị Global Schema Settings
exports.getGlobalSchema = async (req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'global_settings' });
        if (!settings) settings = await new Setting({ key: 'global_settings' }).save();

        res.render('admin/seo/global-schema', {
            pageTitle: 'Cài đặt Schema Global',
            path: '/admin/seo/schema',
            settings: settings
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

// 2. Lưu Global Schema
exports.postGlobalSchema = async (req, res) => {
    try {
        // socialLinks từ form có thể là mảng hoặc string, cần xử lý
        // Giả sử ta nhập mỗi link 1 dòng trong textarea -> split xuống dòng
        let { schemaType, orgLogo, socialLinksInput } = req.body;
        
        // Chuyển text area thành mảng
        const socialLinks = socialLinksInput 
            ? socialLinksInput.split('\n').map(link => link.trim()).filter(link => link !== '') 
            : [];

        await Setting.findOneAndUpdate(
            { key: 'global_settings' },
            { schemaType, orgLogo, socialLinks },
            { new: true, upsert: true }
        );

        res.redirect('/admin/seo/schema');
    } catch (err) {
        console.error("Lỗi lưu Schema Global:", err);
        res.status(500).send("Lỗi Server");
    }
};