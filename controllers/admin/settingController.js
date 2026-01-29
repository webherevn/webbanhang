// Lưu ý: Vì file này nằm trong controllers/admin/ nên phải lùi 2 cấp mới ra được models
const Menu = require('../../models/MenuModel');

// 1. Hiển thị trang quản lý Menu (Đã nâng cấp để hỗ trợ chọn Cha/Con)
exports.getMenuSettings = async (req, res) => {
    try {
        // --- PHẦN 1: Lấy danh sách hiển thị bảng ---
        const menus = await Menu.find()
            .populate('parent') // Lấy thông tin menu cha để hiển thị tên
            .sort({ order: 1 }); 

        // --- PHẦN 2: Chuẩn bị dữ liệu cho Dropdown "Chọn Menu Cha" ---
        // Logic: Chỉ cho phép chọn Menu Cấp 1 hoặc Cấp 2 làm cha (để tạo ra tối đa Cấp 3)
        
        // Lấy tất cả menu gốc (Cấp 1)
        const rootMenus = await Menu.find({ parent: null }).sort({ order: 1 }).lean();
        
        const parentOptions = []; // Mảng chứa danh sách options đã sắp xếp

        for (const root of rootMenus) {
            // Đẩy Menu Cấp 1 vào danh sách
            parentOptions.push({ 
                _id: root._id, 
                name: root.name, 
                level: 1 
            });

            // Tìm các con của Cấp 1 này (tức là Menu Cấp 2)
            const level2Menus = await Menu.find({ parent: root._id }).sort({ order: 1 }).lean();

            for (const child of level2Menus) {
                // Đẩy Menu Cấp 2 vào danh sách
                parentOptions.push({ 
                    _id: child._id, 
                    name: child.name, 
                    level: 2 
                });
                // Không tìm con của Cấp 2 nữa, vì Cấp 3 không được phép làm cha
            }
        }

        // Render ra View
        res.render('admin/settings/menu-list', {
            pageTitle: 'Cấu hình Menu',
            path: '/admin/settings/menu',
            menus: menus,
            parentOptions: parentOptions // Truyền biến này sang View để tạo dropdown
        });

    } catch (err) { 
        console.error("Lỗi lấy danh sách menu:", err);
        // Render trang rỗng hoặc chuyển hướng để không bị treo
        res.redirect('/admin');
    }
};

// 2. Thêm Menu mới (Đã hỗ trợ lưu Parent)
exports.postAddMenu = async (req, res) => {
    try {
        const { name, link, order, parent } = req.body;
        
        const menuData = {
            name,
            link,
            order: Number(order) || 0 // Đảm bảo order là số
        };

        // Nếu người dùng chọn parent (và không phải chuỗi rỗng) thì lưu ID cha
        if (parent && parent !== "") {
            menuData.parent = parent;
        } else {
            menuData.parent = null; // Là menu gốc (Cấp 1)
        }

        await Menu.create(menuData);
        res.redirect('/admin/settings/menu');
    } catch (err) { 
        console.error("Lỗi thêm menu:", err);
        res.redirect('/admin/settings/menu');
    }
};

// 3. Xóa Menu
exports.postDeleteMenu = async (req, res) => {
    try {
        const menuId = req.body.id;
        
        // (Tùy chọn nâng cao): Trước khi xóa cha, nên xóa các con hoặc đưa con về cấp 1
        // Hiện tại xóa đơn giản:
        await Menu.findByIdAndDelete(menuId);
        
        // Xóa luôn các menu con của nó (để tránh menu con bị mồ côi) - Tùy chọn
        await Menu.deleteMany({ parent: menuId });

        res.redirect('/admin/settings/menu');
    } catch (err) { 
        console.error("Lỗi xóa menu:", err);
        res.redirect('/admin/settings/menu');
    }
};