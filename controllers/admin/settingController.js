const Menu = require('../models/MenuModel');

// 1. Hiển thị trang quản lý Menu
exports.getMenuSettings = async (req, res) => {
    try {
        const menus = await Menu.find().sort({ order: 1 }); // Sắp xếp theo thứ tự nhỏ -> lớn
        res.render('admin/settings/menu-list', {
            pageTitle: 'Cấu hình Menu',
            path: '/admin/settings/menu',
            menus: menus
        });
    } catch (err) { console.log(err); }
};

// 2. Thêm Menu mới
exports.postAddMenu = async (req, res) => {
    try {
        const { name, link, order } = req.body;
        await Menu.create({ name, link, order });
        res.redirect('/admin/settings/menu');
    } catch (err) { console.log(err); }
};

// 3. Xóa Menu
exports.postDeleteMenu = async (req, res) => {
    try {
        await Menu.findByIdAndDelete(req.body.id);
        res.redirect('/admin/settings/menu');
    } catch (err) { console.log(err); }
};