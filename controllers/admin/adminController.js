// controllers/admin/adminController.js

exports.getDashboard = (req, res) => {
    // Sau này sẽ lấy số liệu thống kê (tổng đơn, doanh thu) ở đây
    res.render('admin/dashboard', {
        pageTitle: 'Bảng tin (Dashboard)',
        path: '/admin' // Để active menu Dashboard trên Sidebar
    });
};