const Redirect = require('../models/RedirectModel');

const redirectMiddleware = async (req, res, next) => {
    try {
        // Chỉ xử lý method GET (không chuyển hướng POST/PUT/DELETE)
        if (req.method !== 'GET') {
            return next();
        }

        // Lấy đường dẫn hiện tại (req.path bỏ qua query string ?abc=xyz)
        // Ví dụ: khách vào /ao-thun-cu?size=L -> currentPath = /ao-thun-cu
        const currentPath = req.path;

        // Bỏ qua các file tĩnh (css, js, images...) để không làm chậm web
        if (currentPath.startsWith('/css') || 
            currentPath.startsWith('/js') || 
            currentPath.startsWith('/images') || 
            currentPath.startsWith('/admin')) { // Không chuyển hướng trang admin
            return next();
        }

        // Tìm trong database xem có luật chuyển hướng nào khớp không
        const redirectRule = await Redirect.findOne({ 
            fromPath: currentPath, 
            isActive: true 
        }).lean(); // .lean() giúp query nhanh hơn

        if (redirectRule) {
            // Nếu tìm thấy -> Chuyển hướng ngay lập tức (301 Moved Permanently)
            return res.redirect(301, redirectRule.toPath);
        }

        // Nếu không tìm thấy -> Cho đi tiếp
        next();

    } catch (err) {
        console.error("Redirect Middleware Error:", err);
        next(); // Nếu lỗi thì cứ cho đi tiếp, không được làm sập web
    }
};

module.exports = redirectMiddleware;