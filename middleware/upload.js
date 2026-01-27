const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

// Load biến môi trường
dotenv.config();

// 1. CẤU HÌNH CLOUDINARY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. CẤU HÌNH KHO LƯU TRỮ (STORAGE) TỐI ƯU
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Tối ưu: Tự động chia thư mục dựa trên đường dẫn request
        let folderPath = 'fashion-shop/products'; // Mặc định cho sản phẩm
        
        if (req.path.includes('customize')) {
            folderPath = 'fashion-shop/theme'; // Cho Logo & Favicon
        }

        return {
            folder: folderPath,
            // Thêm 'ico' để hỗ trợ Favicon, 'webp' để tối ưu dung lượng
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'ico'],
            
            // Tối ưu ảnh: Tự động nén chất lượng và chuyển đổi định dạng phù hợp nhất
            transformation: [
                { quality: "auto", fetch_format: "auto" }, 
                { width: 1500, crop: "limit" } // Giới hạn chiều rộng tối đa 1500px để tránh ảnh quá nặng
            ]
        };
    }
});

// 3. KHỞI TẠO MULTER VỚI GIỚI HẠN DUNG LƯỢNG (Bảo vệ server)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn tối đa 5MB mỗi file
});

module.exports = upload;