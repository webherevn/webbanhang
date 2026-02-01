const Homepage = require('../../models/HomepageModel');
const Category = require('../../models/CategoryModel');
// 1. Hiển thị danh sách các khối đang có
exports.getHomepageBuilder = async (req, res) => {
    try {
        let homepage = await Homepage.findOne();
        if (!homepage) homepage = await Homepage.create({ sections: [] });
        
        res.render('admin/homepage/builder', {
            pageTitle: 'Trình thiết kế trang chủ',
            path: '/admin/homepage',
            // Sắp xếp ngay khi lấy ra để Builder hiển thị đúng thứ tự kéo thả
            sections: homepage.sections.sort((a, b) => a.order - b.order)
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

// 2. Thêm một khối mới (Mở rộng thêm loại product-grid và promo)
exports.getAddSection = async (req, res) => {
    try {
        const type = req.params.type;
        const homepage = await Homepage.findOne();
        
        let defaultData = { title: 'Tiêu đề khối mới' };

        // Thiết lập dữ liệu mẫu cho từng loại để Builder không bị trống
        if(type === 'hero') {
            defaultData = { title: 'Mùa Hè Rực Rỡ', subtitle: 'Bộ sưu tập 2026', buttonText: 'Khám phá ngay', buttonLink: '/products', bgImage: '' };
        } else if(type === 'features') {
            defaultData = { items: [
                { icon: 'bi-truck', title: 'Miễn phí vận chuyển', desc: 'Cho đơn hàng trên 500k' },
                { icon: 'bi-patch-check', title: 'Bảo hành 12 tháng', desc: 'Đổi trả trong 30 ngày' }
            ]};
        } else if(type === 'product-grid') {
            defaultData = { title: 'Sản phẩm nổi bật', buttonText: 'Xem tất cả', buttonLink: '/products' };
        } else if(type === 'promo') {
            defaultData = { title: 'Flash Sale', subtitle: 'Giảm đến 50%', buttonText: 'Săn Deal ngay', buttonLink: '/products', bgImage: '' };
        }

        homepage.sections.push({ 
            type, 
            data: defaultData, 
            order: homepage.sections.length, // Đặt xuống cuối cùng
            isActive: true 
        });

        await homepage.save();
        res.redirect('/admin/homepage/builder');
    } catch (err) {
        res.redirect('/admin/homepage/builder');
    }
};

// 3. Trang chỉnh sửa nội dung chi tiết
exports.getEditSection = async (req, res) => {
    try {
        const sectionId = req.params.id;
        
        // 1. Lấy đồng thời cả Homepage và danh sách Danh mục
        const [homepage, categories] = await Promise.all([
            Homepage.findOne(),
            Category.find().lean() // Lấy tất cả danh mục để hiện trong dropdown
        ]);

        if (!homepage) {
            return res.redirect('/admin/homepage/builder');
        }

        // 2. Tìm đúng section cần sửa trong mảng sections
        const section = homepage.sections.id(sectionId);

        if (!section) {
            return res.redirect('/admin/homepage/builder');
        }

        // 3. TRUYỀN BIẾN categories VÀO ĐÂY
        res.render('admin/homepage/edit-section', {
            pageTitle: 'Chỉnh sửa khối nội dung',
            path: '/admin/homepage/builder',
            section: section,
            categories: categories // <--- Dòng này sẽ xóa tan lỗi "not defined"
        });

    } catch (err) {
        console.error("❌ Lỗi getEditSection:", err);
        res.status(500).send("Lỗi server");
    }
};

// 4. Xử lý lưu dữ liệu (Tối ưu để xử lý mảng items)
exports.postEditSection = async (req, res) => {
    try {
        const { sectionId, ...formData } = req.body;
        const homepage = await Homepage.findOne();
        
        if (!homepage) {
            console.error("❌ Không tìm thấy dữ liệu Homepage");
            return res.status(404).send("Không tìm thấy dữ liệu trang chủ");
        }

        const section = homepage.sections.id(sectionId);
        if (!section) {
            console.error("❌ Không tìm thấy Section ID:", sectionId);
            return res.status(404).send("Không tìm thấy khối cần sửa");
        }

        // --- XỬ LÝ DỮ LIỆU ĐẶC BIỆT CHO MẢNG (Khối Features) ---
        if (formData.items) {
            // Nếu formData.items là Object (do body-parser gửi dạng index), chuyển nó về Array
            let cleanItems = Array.isArray(formData.items) 
                ? formData.items 
                : Object.values(formData.items);
            
            section.data.items = cleanItems;
            delete formData.items; // Xóa để không bị ghi đè lung tung bên dưới
        }

        // --- XỬ LÝ ẢNH ---
        if (req.file) {
            section.data.bgImage = req.file.path;
        }

        // --- CẬP NHẬT CÁC TRƯỜNG TEXT CÒN LẠI ---
        // Sử dụng Object.assign để merge dữ liệu cũ và mới tránh mất data
        section.data = Object.assign(section.data, formData);

        // Báo cho Mongoose biết trường Mixed 'sections' đã thay đổi để nó lưu
        homepage.markModified('sections');
        
        await homepage.save();
        console.log("✅ Lưu thay đổi thành công cho khối:", section.type);
        res.redirect('/admin/homepage/builder');

    } catch (err) {
        // In lỗi chi tiết ra console để bạn debug trên Render
        console.error("🔥 LỖI NGHIÊM TRỌNG TRONG POST-EDIT-SECTION:", err.message);
        res.status(500).send("Lỗi server: " + err.message);
    }
};

// [MỚI] 5. Cập nhật thứ tự qua AJAX (Dành cho SortableJS)
exports.updateSectionOrder = async (req, res) => {
    try {
        const { orders } = req.body; // Dạng: [{id: '...', newOrder: 0}, ...]
        const homepage = await Homepage.findOne();

        orders.forEach(item => {
            const section = homepage.sections.id(item.id);
            if (section) section.order = item.newOrder;
        });

        await homepage.save();
        res.json({ success: true, message: 'Đã cập nhật thứ tự thành công!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi cập nhật thứ tự' });
    }
};

// 6. Xóa khối
exports.postDeleteSection = async (req, res) => {
    try {
        const { sectionId } = req.body;
        const homepage = await Homepage.findOne();
        
        homepage.sections.pull({ _id: sectionId });
        
        await homepage.save();
        res.redirect('/admin/homepage/builder');
    } catch (err) {
        res.redirect('/admin/homepage/builder');
    }
};