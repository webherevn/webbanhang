// controllers/admin/adminController.js

exports.getDashboard = (req, res) => {
    // Sau này sẽ lấy số liệu thống kê (tổng đơn, doanh thu) ở đây
    res.render('admin/dashboard', {
        pageTitle: 'Bảng tin (Dashboard)',
        path: '/admin' // Để active menu Dashboard trên Sidebar
    });
};

const Setting = require('../../models/SettingModel');

// Lấy dữ liệu cũ để hiện lên ô nhập
exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'global_settings' });
        if (!settings) {
            settings = await Setting.create({ key: 'global_settings' });
        }
        res.render('admin/settings', {
            pageTitle: 'Cấu hình Script hệ thống',
            path: '/admin/settings',
            settings: settings
        });
    } catch (err) { res.redirect('/admin'); }
};

// Lưu dữ liệu mới khi nhấn nút
exports.postSettings = async (req, res) => {
    try {
        const { headerScripts, bodyScripts, footerScripts } = req.body;
        await Setting.findOneAndUpdate(
            { key: 'global_settings' },
            { headerScripts, bodyScripts, footerScripts },
            { upsert: true }
        );
        res.redirect('/admin/settings');
    } catch (err) { res.redirect('/admin/settings'); }
};