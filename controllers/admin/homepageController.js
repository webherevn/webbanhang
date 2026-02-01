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

// --- 1. SỬA LỖI: Bấm Tùy chỉnh bị load lại trang ---
exports.getEditSection = async (req, res) => {
    try {
        const sectionId = req.params.id;
        
        // Lấy dữ liệu đồng thời
        const [homepage, categories] = await Promise.all([
            Homepage.findOne(),
            Category.find().lean()
        ]);

        if (!homepage) {
            console.error("❌ Không tìm thấy Homepage trong DB");
            return res.status(404).send("Chưa khởi tạo dữ liệu trang chủ");
        }

        // Tìm section trong mảng
        const section = homepage.sections.id(sectionId);

        if (!section) {
            console.error("❌ Không tìm thấy Section với ID:", sectionId);
            // Thay vì redirect gây lặp trang, hãy báo lỗi để debug
            return res.status(404).send("Khối nội dung không tồn tại hoặc đã bị xóa");
        }

        res.render('admin/homepage/edit-section', {
            pageTitle: 'Chỉnh sửa ' + section.type,
            path: '/admin/homepage/builder',
            section: section,
            categories: categories
        });

    } catch (err) {
        console.error("🔥 Lỗi GetEditSection:", err);
        res.status(500).send("Lỗi hệ thống: " + err.message);
    }
};

// --- 2. SỬA LỖI: Thêm 1 khối ra 2 khối ---
exports.getAddSection = async (req, res) => {
    try {
        const type = req.params.type;
        const homepage = await Homepage.findOne();
        
        if (!homepage) return res.redirect('/admin/homepage/builder');

        // Định nghĩa dữ liệu mẫu cho từng loại khối
        const defaultData = {
            title: 'Tiêu đề mới',
            subtitle: 'Phụ đề mẫu',
            buttonText: 'Xem ngay',
            buttonLink: '#',
            bgImage: ''
        };

        // Quan trọng: Chỉ đẩy vào mảng MỘT LẦN duy nhất
        homepage.sections.push({
            type: type,
            data: defaultData,
            isActive: true,
            order: homepage.sections.length
        });

        // Sử dụng await để đảm bảo lưu xong mới chuyển trang
        await homepage.save();
        
        // Sau khi lưu xong, quay lại trang builder
        return res.redirect('/admin/homepage/builder');

    } catch (err) {
        console.error("🔥 Lỗi AddSection:", err);
        res.status(500).send("Không thể thêm khối mới");
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

// [MỚI] 5. Cập nhật thứ tự qua AJAX (Chuẩn SortableJS)
    exports.updateSectionOrder = async (req, res) => {
    try {
        const { order } = req.body; // Mảng ID gửi từ Frontend
        
        if (!order || !Array.isArray(order)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
        }

        // Tìm tài liệu Homepage duy nhất
        const homepage = await Homepage.findOne();
        if (!homepage) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });

        // Tạo mảng mới theo thứ tự ID nhận được
        const reorderedSections = order.map(id => {
            return homepage.sections.id(id);
        }).filter(section => section !== null);

        // PHƯƠNG PHÁP LƯU TRIỆT ĐỂ:
        // 1. Gán mảng mới
        homepage.sections = reorderedSections;
        
        // 2. BẮT BUỘC: Đánh dấu mảng này đã bị sửa đổi để Mongoose lưu lại
        homepage.markModified('sections');

        // 3. Lưu lại
        await homepage.save();

        console.log("✅ Đã cập nhật thứ tự mới vào Database");
        res.json({ success: true, message: 'Đã lưu thứ tự thành công!' });

    } catch (err) {
        console.error("🔥 Lỗi Update Order:", err);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
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