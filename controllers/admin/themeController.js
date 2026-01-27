const Theme = require('../../models/ThemeModel');

// 1. Hiển thị trang tùy biến
exports.getCustomize = async (req, res) => {
    try {
        // Tìm bản ghi cấu hình duy nhất
        let theme = await Theme.findOne({ key: 'theme_settings' });
        
        // Nếu chưa có (lần đầu chạy), tạo mới bản ghi mặc định
        if (!theme) {
            theme = await Theme.create({ 
                key: 'theme_settings',
                topBarText: 'Chào mừng bạn đến với cửa hàng!',
                topBarBgColor: '#23282d'
            });
        }
        
        res.render('admin/customize', {
            pageTitle: 'Tùy biến giao diện',
            path: '/admin/customize',
            theme: theme
        });
    } catch (err) {
        console.error("❌ Lỗi load trang tùy biến:", err);
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

        // Tìm bản ghi dựa trên key cố định
        let theme = await Theme.findOne({ key: 'theme_settings' });

        if (!theme) {
            theme = new Theme({ key: 'theme_settings' });
        }

        // Cập nhật các trường text và checkbox
        // Checkbox trả về 'on' nếu được tích, nếu không sẽ là undefined
        theme.topBarShow = topBarShow === 'on';
        theme.topBarText = topBarText;
        theme.topBarBgColor = topBarBgColor;
        theme.headerSticky = headerSticky === 'on';
        theme.headerBottomHtml = headerBottomHtml;
        theme.customCss = customCss;

        // Xử lý Upload Logo (Chỉ cập nhật nếu người dùng chọn file mới)
        if (req.files && req.files['logo']) {
            theme.logo = req.files['logo'][0].path;
        }

        // Xử lý Upload Favicon (Chỉ cập nhật nếu người dùng chọn file mới)
        if (req.files && req.files['favicon']) {
            theme.favicon = req.files['favicon'][0].path;
        }

        // Lưu xuống Database
        const savedTheme = await theme.save();
        
        // LOG ĐỂ KIỂM TRA: Bạn hãy xem ở terminal (Render) sau khi nhấn Lưu
        console.log("✅ Đã cập nhật Theme thành công lúc:", savedTheme.updatedAt);
        console.log("👉 Nội dung Top Bar mới:", savedTheme.topBarText);

        res.redirect('/admin/customize');
    } catch (err) {
        console.error("❌ Lỗi cập nhật giao diện:", err);
        res.redirect('/admin/customize');
    }
};