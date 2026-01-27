const Theme = require('../../models/ThemeModel');

// 1. Hiển thị trang tùy biến
exports.getCustomize = async (req, res) => {
    try {
        let theme = await Theme.findOne({ key: 'theme_settings' });
        if (!theme) {
            theme = await Theme.create({ key: 'theme_settings' });
        }
        res.render('admin/customize', {
            pageTitle: 'Tùy biến giao diện',
            path: '/admin/customize',
            theme: theme
        });
    } catch (err) {
        res.redirect('/admin');
    }
};

// 2. Xử lý lưu thay đổi
exports.postCustomize = async (req, res) => {
    try {
        const { 
            topBarShow, topBarText, topBarBgColor, 
            headerSticky, headerBottomHtml, customCss 
        } = req.body;

        const theme = await Theme.findOne({ key: 'theme_settings' });

        // Cập nhật các trường text và checkbox
        theme.topBarShow = topBarShow === 'on';
        theme.topBarText = topBarText;
        theme.topBarBgColor = topBarBgColor;
        theme.headerSticky = headerSticky === 'on';
        theme.headerBottomHtml = headerBottomHtml;
        theme.customCss = customCss;

        // Xử lý Upload Logo nếu có
        if (req.files && req.files['logo']) {
            theme.logo = req.files['logo'][0].path;
        }

        // Xử lý Upload Favicon nếu có
        if (req.files && req.files['favicon']) {
            theme.favicon = req.files['favicon'][0].path;
        }

        await theme.save();
        res.redirect('/admin/customize');
    } catch (err) {
        console.error("Lỗi cập nhật giao diện:", err);
        res.redirect('/admin/customize');
    }
};