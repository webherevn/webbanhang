// controllers/admin/adminController.js

exports.getDashboard = (req, res) => {
    // Sau này sẽ lấy số liệu thống kê (tổng đơn, doanh thu) ở đây
    res.render('admin/dashboard', {
        pageTitle: 'Bảng tin (Dashboard)',
        path: '/admin' // Để active menu Dashboard trên Sidebar
    });
};

const Setting = require('../../models/SettingModel');

exports.getScripts = async (req, res) => {
    const settings = await Setting.findOne({ key: 'global_settings' });
    res.render('admin/settings', { 
        pageTitle: 'Quản lý Script', 
        path: '/admin/settings',
        settings 
    });
};

exports.postScripts = async (req, res) => {
    const { headerScripts, bodyScripts, footerScripts } = req.body;
    await Setting.findOneAndUpdate(
        { key: 'global_settings' },
        { headerScripts, bodyScripts, footerScripts },
        { upsert: true }
    );
    res.redirect('/admin/settings');
};