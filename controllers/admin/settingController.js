// Lưu ý: Vì file này nằm trong controllers/admin/ nên phải lùi 2 cấp mới ra được models
const Menu = require('../../models/MenuModel');

// 1. Hiển thị trang quản lý Menu
exports.getMenuSettings = async (req, res) => {
    try {
        // --- PHẦN 1: Lấy danh sách hiển thị bảng ---
        const menus = await Menu.find()
            .populate('parent') // Lấy thông tin menu cha để hiển thị tên
            .sort({ order: 1 }); 

        // --- PHẦN 2: Chuẩn bị dữ liệu cho Dropdown "Chọn Menu Cha" ---
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
            }
        }

        // Render ra View
        res.render('admin/settings/menu-list', {
            pageTitle: 'Cấu hình Menu',
            path: '/admin/settings/menu',
            menus: menus,
            parentOptions: parentOptions
        });

    } catch (err) { 
        // [DEBUG] In lỗi ra console và màn hình thay vì redirect
        console.error("❌ LỖI GET MENU:", err);
        res.status(500).send("Lỗi hiển thị Menu: " + err.message);
    }
};

// 2. Thêm Menu mới
exports.postAddMenu = async (req, res) => {
    try {
        const { name, link, order, parent } = req.body;
        
        const menuData = {
            name,
            link,
            order: Number(order) || 0
        };

        // Nếu người dùng chọn parent (và không phải chuỗi rỗng) thì lưu ID cha
        if (parent && parent !== "") {
            menuData.parent = parent;
        } else {
            menuData.parent = null;
        }

        await Menu.create(menuData);
        res.redirect('/admin/settings/menu');
    } catch (err) { 
        // [DEBUG] In lỗi ra màn hình
        console.error("❌ LỖI ADD MENU:", err);
        res.status(500).send("Lỗi thêm Menu: " + err.message);
    }
};

// 3. Xóa Menu
exports.postDeleteMenu = async (req, res) => {
    try {
        const menuId = req.body.id;
        
        await Menu.findByIdAndDelete(menuId);
        // Xóa luôn các menu con của nó (để tránh menu con bị mồ côi)
        await Menu.deleteMany({ parent: menuId });

        res.redirect('/admin/settings/menu');
    } catch (err) { 
        // [DEBUG] In lỗi ra màn hình
        console.error("❌ LỖI DELETE MENU:", err);
        res.status(500).send("Lỗi xóa Menu: " + err.message);
    }
};