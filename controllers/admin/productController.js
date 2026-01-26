// controllers/admin/productController.js
const Product = require('../../models/ProductModel');
const Category = require('../../models/CategoryModel');
const slugify = require('slugify');

// 1. Hàm lấy danh sách sản phẩm (Cái này đang thiếu dẫn đến lỗi Line 35)
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render('admin/product-list', { 
            pageTitle: 'Tất cả sản phẩm',
            path: '/admin/products', 
            products: products
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

// 2. Hàm hiển thị form thêm sản phẩm
exports.getAddProduct = async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('admin/product-form', { 
            pageTitle: 'Thêm Sản Phẩm Mới',
            path: '/admin/add-product',
            categories: categories,
            editing: false
        });
    } catch (err) {
        res.redirect('/admin/products');
    }
};

// 3. Hàm xử lý lưu sản phẩm
exports.postAddProduct = async (req, res) => {
    try {
        const { name, basePrice, category, description, salePrice } = req.body;
        const thumbnailPath = req.files['thumbnail'] ? req.files['thumbnail'][0].path : '';
        const galleryPaths = req.files['gallery'] ? req.files['gallery'].map(f => f.path) : [];

        let productSlug = slugify(name, { lower: true, strict: true });
        let originalSlug = productSlug;
        let count = 1;
        while (await Product.findOne({ slug: productSlug })) {
            productSlug = `${originalSlug}-${count}`;
            count++;
        }

        const product = new Product({
            name, slug: productSlug, basePrice, salePrice, category, 
            description, thumbnail: thumbnailPath, images: galleryPaths, variants: []
        });
        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/add-product');
    }
};

// 4. Hàm sửa sản phẩm
exports.getEditProduct = async (req, res) => {
    try {
        const prodId = req.params.productId;
        const product = await Product.findById(prodId);
        const categories = await Category.find();
        res.render('admin/product-form', {
            pageTitle: 'Sửa sản phẩm',
            path: '/admin/edit-product',
            editing: true,
            product: product,
            categories: categories
        });
    } catch (err) { res.redirect('/admin/products'); }
};

// 5. Hàm lưu sửa sản phẩm
exports.postEditProduct = async (req, res) => {
    try {
        const { productId, name, basePrice, salePrice, category, description } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.redirect('/admin/products');

        product.name = name;
        product.category = category;
        product.description = description;
        product.basePrice = basePrice;
        product.salePrice = salePrice;

        if (req.files['thumbnail']) product.thumbnail = req.files['thumbnail'][0].path;
        if (req.files['gallery']) {
            const newImgs = req.files['gallery'].map(f => f.path);
            product.images.push(...newImgs);
        }

        await product.save();
        res.redirect('/admin/products');
    } catch (err) { res.redirect('/admin/products'); }
};

// 6. Hàm xóa sản phẩm
exports.postDeleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.body.productId);
        res.redirect('/admin/products');
    } catch (err) { res.redirect('/admin/products'); }
};

// Xử lý Thêm chuyên mục
exports.postAddBlogCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const slug = slugify(name, { lower: true, strict: true });
        let image = "";
        if (req.file) image = req.file.path; // Lấy đường dẫn ảnh từ Cloudinary/Multer

        await BlogCategory.create({ name, slug, description, image });
        res.redirect('/admin/blog-categories');
    } catch (err) { res.redirect('/admin/blog-categories'); }
};

// Xử lý Lưu sửa đổi
exports.postEditBlogCategory = async (req, res) => {
    try {
        const { categoryId, name, description } = req.body;
        const category = await BlogCategory.findById(categoryId);
        
        category.name = name;
        category.description = description;
        category.slug = slugify(name, { lower: true, strict: true });
        
        if (req.file) category.image = req.file.path; // Cập nhật ảnh mới nếu có

        await category.save();
        res.redirect('/admin/blog-categories');
    } catch (err) { res.redirect('/admin/blog-categories'); }
};