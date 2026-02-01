const Homepage = require('../../models/HomepageModel');

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
        const sectionId = req.params.sectionId;
        const homepage = await Homepage.findOne();
        const section = homepage.sections.id(sectionId);
        
        if (!section) return res.redirect('/admin/homepage/builder');

        res.render('admin/homepage/edit-section', {
            pageTitle: 'Chỉnh sửa khối ' + section.type.toUpperCase(),
            path: '/admin/homepage',
            section: section
        });
    } catch (err) {
        res.redirect('/admin/homepage/builder');
    }
};

// 4. Xử lý lưu dữ liệu (Tối ưu để xử lý mảng items)
exports.postEditSection = async (req, res) => {
    try {
        const { sectionId, ...formData } = req.body;
        const homepage = await Homepage.findOne();
        const section = homepage.sections.id(sectionId);

        if (!section) return res.redirect('/admin/homepage/builder');

        // Xử lý dữ liệu text: Cập nhật đè formData vào data hiện tại
        // Lưu ý: Nếu formData có dạng items[0][title], ta cần xử lý logic mảng
        if (formData.items && typeof formData.items === 'object') {
            // Chuyển đổi object index sang array nếu cần
            section.data.items = Object.values(formData.items);
            delete formData.items; // Xóa để không bị đè ở bước dưới
        }

        section.data = { ...section.data, ...formData };

        // Xử lý ảnh nếu có upload mới (Multer)
        if (req.file) {
            section.data.bgImage = req.file.path; 
        }

        // Đánh dấu field data có thay đổi để Mongoose lưu lại (vì là Mixed type)
        homepage.markModified('sections');
        
        await homepage.save();
        res.redirect('/admin/homepage/builder');
    } catch (err) {
        console.error("❌ Lỗi cập nhật khối:", err);
        res.redirect('/admin/homepage/builder');
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