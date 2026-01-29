// Lưu ý: Vì file này nằm trong controllers/admin/ nên phải lùi 2 cấp mới ra được models
const Menu = require('../../models/MenuModel');
// [MỚI] Import thêm Setting Model để xử lý cấu hình chung và Index
const Setting = require('../../models/SettingModel');

// ============================================================
// PHẦN 1: QUẢN LÝ MENU (GIỮ NGUYÊN)
// ============================================================

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

// 4. Cập nhật Menu (Sửa tên, link, thứ tự, cha con)
exports.postUpdateMenu = async (req, res) => {
    try {
        const { id, name, link, order, parent } = req.body;
        
        const updateData = {
            name: name,
            link: link,
            order: Number(order) || 0
        };

        // Logic Parent:
        // 1. Nếu chọn "Là Menu Gốc" -> parent = null
        // 2. Không được chọn chính nó làm cha của nó (để tránh lỗi vòng lặp)
        if (parent && parent !== "" && parent !== id) {
            updateData.parent = parent;
        } else {
            updateData.parent = null;
        }

        await Menu.findByIdAndUpdate(id, updateData);
        
        res.redirect('/admin/settings/menu');
    } catch (err) {
        console.error("❌ Lỗi cập nhật menu:", err);
        res.status(500).send("Lỗi cập nhật: " + err.message);
    }
};


// ============================================================
// PHẦN 2: CẤU HÌNH INDEX GOOGLE & CÀI ĐẶT CHUNG (MỚI THÊM)
// ============================================================

// 5. Hiển thị trang cấu hình Index Google
exports.getIndexSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'global_settings' });
        
        // Nếu chưa có thì tạo mới (để tránh lỗi null)
        if (!settings) {
            settings = await new Setting({ key: 'global_settings' }).save();
        }

        res.render('admin/settings/index-google', {
            pageTitle: 'Cấu hình Index Google',
            path: '/admin/settings/index',
            settings: settings
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

// 6. Lưu cấu hình Index Google
exports.postIndexSettings = async (req, res) => {
    try {
        // Checkbox: Nếu tick thì req.body.enableIndexing = 'on', không tick thì undefined
        const enableIndexing = req.body.enableIndexing === 'on';

        await Setting.findOneAndUpdate(
            { key: 'global_settings' },
            { enableIndexing: enableIndexing },
            { new: true, upsert: true }
        );

        res.redirect('/admin/settings/index');
    } catch (err) {
        console.log("Lỗi lưu Index:", err);
        res.status(500).send("Lỗi server");
    }
};

// 7. Hiển thị Cài đặt chung (Script Header/Footer...)
// (Thêm hàm này để link trong sidebar hoạt động)
exports.getGeneralSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'global_settings' });
        if (!settings) {
            settings = await new Setting({ key: 'global_settings' }).save();
        }

        res.render('admin/settings/general', {
            pageTitle: 'Cài đặt chung (Scripts)',
            path: '/admin/settings/general',
            settings: settings
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

// 8. Lưu Cài đặt chung
exports.postGeneralSettings = async (req, res) => {
    try {
        const { headerScripts, bodyScripts, footerScripts } = req.body;

        await Setting.findOneAndUpdate(
            { key: 'global_settings' },
            { 
                headerScripts, 
                bodyScripts, 
                footerScripts 
            },
            { new: true, upsert: true }
        );

        res.redirect('/admin/settings/general');
    } catch (err) {
        console.log("Lỗi lưu Script:", err);
        res.status(500).send("Lỗi server");
    }
};