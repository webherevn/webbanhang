const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

// Load biến môi trường
dotenv.config();
// --- THÊM DÒNG LOG NÀY ĐỂ DEBUG ---
console.log("CLOUDINARY CONFIG CHECK:", process.env.CLOUDINARY_CLOUD_NAME); 
// Nếu nó in ra "undefined" -> Lỗi do thứ tự trong app.js
// Nếu nó in ra tên cloud của bạn -> Code upload đúng, lỗi do chỗ khác.
// 1. CẤU HÌNH CLOUDINARY
// (Lấy thông tin từ .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. CẤU HÌNH KHO LƯU TRỮ (STORAGE)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'fashion-shop-products', // Tên thư mục sẽ tạo trên Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Chỉ cho phép up ảnh
        // Bạn có thể thêm transformation để tự động resize ảnh nếu muốn
        // transformation: [{ width: 1000, crop: "limit" }]
    }
});

// 3. KHỞI TẠO MULTER
const upload = multer({ storage: storage });

module.exports = upload;