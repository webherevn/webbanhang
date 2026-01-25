const express = require('express');
const router = express.Router();
const productController = require('../controllers/admin/productController');

// Import bộ upload vừa cấu hình ở Bước 2
// Vì giờ 2 file nằm cạnh nhau, chỉ cần dấu chấm (.)
// Dùng hai chấm (..) để lùi ra ngoài rồi vào configs
const upload = require('../configs/cloudinary.config.js');

// ... các route khác

router.get('/add-product', productController.getAddProduct);

// --- SỬA DÒNG NÀY ---
// Thêm middleware upload.array('images', 5) để cho phép up tối đa 5 ảnh
router.post('/add-product', upload.array('images', 5), productController.postAddProduct);

module.exports = router;