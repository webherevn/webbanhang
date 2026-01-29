const Product = require('../../models/ProductModel');
const Category = require('../../models/CategoryModel');
const slugify = require('slugify');

// 1. Hàm lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category')
            .sort({ createdAt: -1 });
            
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
            editing: false,
            product: {}
        });
    } catch (err) {
        res.redirect('/admin/products');
    }
};

// 3. Hàm xử lý lưu sản phẩm (CÓ VARIANTS & SEO & SCHEMA & SOCIAL SEO)
exports.postAddProduct = async (req, res) => {
    try {
        const { 
            name, basePrice, salePrice, category, description, shippingPolicy,
            seoTitle, seoDescription, focusKeyword, customSchema,
            ogTitle, ogDescription, // <--- [MỚI] Social SEO fields
            hasVariants, variant_color, variant_size, variant_price, variant_stock, variant_sku 
        } = req.body;
        
        // Tạo Slug duy nhất
        let productSlug = slugify(name, { lower: true, strict: true });
        let originalSlug = productSlug;
        let count = 1;
        while (await Product.findOne({ slug: productSlug })) {
            productSlug = `${originalSlug}-${count}`;
            count++;
        }

        // Khởi tạo object sản phẩm
        const productData = {
            name,
            slug: productSlug,
            basePrice: Number(basePrice),
            salePrice: Number(salePrice || 0),
            category,
            description,
            shippingPolicy,
            seoTitle,
            seoDescription,
            focusKeyword,
            customSchema,
            ogTitle,        // <--- [MỚI] Lưu Social Title
            ogDescription,  // <--- [MỚI] Lưu Social Description
            hasVariants: hasVariants === 'on',
            variants: []
        };

        // Xử lý ảnh (Thumbnail, Gallery & Social Image)
        if (req.files) {
            if (req.files['thumbnail']) productData.thumbnail = req.files['thumbnail'][0].path;
            if (req.files['gallery']) productData.gallery = req.files['gallery'].map(f => f.path);
            if (req.files['ogImage']) productData.ogImage = req.files['ogImage'][0].path; // <--- [MỚI] Lưu Social Image
        }

        // --- LOGIC XỬ LÝ BIẾN THỂ (VARIANTS) ---
        if (productData.hasVariants && variant_color) {
            const colors = Array.isArray(variant_color) ? variant_color : [variant_color];
            const sizes = Array.isArray(variant_size) ? variant_size : [variant_size];
            const prices = Array.isArray(variant_price) ? variant_price : [variant_price];
            const stocks = Array.isArray(variant_stock) ? variant_stock : [variant_stock];
            const skus = Array.isArray(variant_sku) ? variant_sku : [variant_sku];

            for (let i = 0; i < colors.length; i++) {
                productData.variants.push({
                    color: colors[i],
                    size: sizes[i],
                    price: Number(prices[i]),
                    stock: Number(stocks[i] || 0),
                    sku: skus[i] || ''
                });
            }

            if (productData.variants.length > 0) {
                const minPrice = Math.min(...productData.variants.map(v => v.price));
                productData.basePrice = minPrice;
            }
        }
        
        await Product.create(productData);
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
        
        if (!product) return res.redirect('/admin/products');

        res.render('admin/product-form', {
            pageTitle: 'Sửa sản phẩm',
            path: '/admin/edit-product',
            editing: true,
            product: product,
            categories: categories
        });
    } catch (err) { res.redirect('/admin/products'); }
};

// 5. Hàm lưu sửa sản phẩm (CÓ VARIANTS & SEO & SCHEMA & SOCIAL SEO)
exports.postEditProduct = async (req, res) => {
    try {
        const { 
            productId, name, basePrice, salePrice, category, description, shippingPolicy,
            seoTitle, seoDescription, focusKeyword, customSchema,
            ogTitle, ogDescription, // <--- [MỚI] Social SEO fields
            hasVariants, variant_color, variant_size, variant_price, variant_stock, variant_sku
        } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.redirect('/admin/products');

        // Cập nhật thông tin cơ bản
        product.name = name;
        product.category = category;
        product.description = description;
        product.shippingPolicy = shippingPolicy;
        product.basePrice = Number(basePrice);
        product.salePrice = Number(salePrice || 0);
        product.hasVariants = hasVariants === 'on';
        
        // Cập nhật SEO & Schema & Social SEO
        product.seoTitle = seoTitle;
        product.seoDescription = seoDescription;
        product.focusKeyword = focusKeyword;
        product.customSchema = customSchema;
        product.ogTitle = ogTitle;        // <--- [MỚI] Cập nhật Social Title
        product.ogDescription = ogDescription;  // <--- [MỚI] Cập nhật Social Description

        // Cập nhật Ảnh
        if (req.files) {
            if (req.files['thumbnail']) product.thumbnail = req.files['thumbnail'][0].path;
            if (req.files['ogImage']) product.ogImage = req.files['ogImage'][0].path; // <--- [MỚI] Cập nhật Social Image
            if (req.files['gallery']) {
                const newImgs = req.files['gallery'].map(f => f.path);
                product.gallery.push(...newImgs);
            }
        }

        // --- CẬP NHẬT BIẾN THỂ ---
        product.variants = [];
        if (product.hasVariants && variant_color) {
            const colors = Array.isArray(variant_color) ? variant_color : [variant_color];
            const sizes = Array.isArray(variant_size) ? variant_size : [variant_size];
            const prices = Array.isArray(variant_price) ? variant_price : [variant_price];
            const stocks = Array.isArray(variant_stock) ? variant_stock : [variant_stock];
            const skus = Array.isArray(variant_sku) ? variant_sku : [variant_sku];

            for (let i = 0; i < colors.length; i++) {
                product.variants.push({
                    color: colors[i],
                    size: sizes[i],
                    price: Number(prices[i]),
                    stock: Number(stocks[i] || 0),
                    sku: skus[i] || ''
                });
            }
            
            if (product.variants.length > 0) {
                product.basePrice = Math.min(...product.variants.map(v => v.price));
            }
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

// Xóa ảnh lẻ khỏi gallery
exports.deleteProductImage = async (req, res) => {
    try {
        const { productId, imageUrl } = req.body;
        await Product.findByIdAndUpdate(productId, {
            $pull: { gallery: imageUrl } 
        });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};