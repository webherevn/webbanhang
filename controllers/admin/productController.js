const Product = require('../../models/ProductModel');
const Category = require('../../models/CategoryModel');
const slugify = require('slugify');

// 1. Hàm lấy danh sách sản phẩm
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

// 3. Hàm xử lý lưu sản phẩm (CẬP NHẬT SEO)
exports.postAddProduct = async (req, res) => {
    try {
        // Thêm seoTitle, seoDescription, focusKeyword vào destructuring
        const { name, basePrice, category, description, salePrice, seoTitle, seoDescription, focusKeyword } = req.body;
        
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
            name, 
            slug: productSlug, 
            basePrice, 
            salePrice, 
            category, 
            description, 
            thumbnail: thumbnailPath, 
            images: galleryPaths, 
            variants: [],
            // Lưu dữ liệu SEO
            seoTitle: seoTitle,
            seoDescription: seoDescription,
            focusKeyword: focusKeyword
        });
        
        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        console.log("❌ Lỗi thêm sản phẩm:", err);
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

// 5. Hàm lưu sửa sản phẩm (CẬP NHẬT SEO)
exports.postEditProduct = async (req, res) => {
    try {
        // Lấy thêm các trường SEO từ req.body
        const { productId, name, basePrice, salePrice, category, description, seoTitle, seoDescription, focusKeyword } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.redirect('/admin/products');

        product.name = name;
        product.category = category;
        product.description = description;
        product.basePrice = basePrice;
        product.salePrice = salePrice;
        
        // Cập nhật dữ liệu SEO
        product.seoTitle = seoTitle;
        product.seoDescription = seoDescription;
        product.focusKeyword = focusKeyword;

        if (req.files['thumbnail']) product.thumbnail = req.files['thumbnail'][0].path;
        if (req.files['gallery']) {
            const newImgs = req.files['gallery'].map(f => f.path);
            product.images.push(...newImgs);
        }

        await product.save();
        res.redirect('/admin/products');
    } catch (err) { 
        console.log("❌ Lỗi sửa sản phẩm:", err);
        res.redirect('/admin/products'); 
    }
};

// 6. Hàm xóa sản phẩm
exports.postDeleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.body.productId);
        res.redirect('/admin/products');
    } catch (err) { res.redirect('/admin/products'); }
};

// ============================================================
// CÁC HÀM KHÁC (GIỮ NGUYÊN THEO YÊU CẦU)
// ============================================================
exports.postAddBlogCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const slug = slugify(name, { lower: true, strict: true });
        let image = "";
        if (req.file) image = req.file.path;
        await BlogCategory.create({ name, slug, description, image });
        res.redirect('/admin/blog-categories');
    } catch (err) { res.redirect('/admin/blog-categories'); }
};

exports.postEditBlogCategory = async (req, res) => {
    try {
        const { categoryId, name, description } = req.body;
        const category = await BlogCategory.findById(categoryId);
        category.name = name;
        category.description = description;
        category.slug = slugify(name, { lower: true, strict: true });
        if (req.file) category.image = req.file.path;
        await category.save();
        res.redirect('/admin/blog-categories');
    } catch (err) { res.redirect('/admin/blog-categories'); }
};