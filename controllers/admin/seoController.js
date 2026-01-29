// --- IMPORT MODELS ---
const Redirect = require('../../models/RedirectModel');
const Setting = require('../../models/SettingModel');
const Product = require('../../models/ProductModel');
const Post = require('../../models/PostModel');
const Page = require('../../models/PageModel');
const Monitor404 = require('../../models/Monitor404Model');

// ============================================================
// 1. QUẢN LÝ REDIRECTS (CHUYỂN HƯỚNG 301)
// ============================================================

// Hiển thị danh sách Redirects
exports.getRedirects = async (req, res) => {
    try {
        const redirects = await Redirect.find().sort({ createdAt: -1 });
        
        res.render('admin/seo/redirects', {
            pageTitle: 'Quản lý Chuyển hướng (301)',
            path: '/admin/seo/redirects',
            redirects: redirects
        });
    } catch (err) {
        console.error("❌ Lỗi Get Redirects:", err);
        res.redirect('/admin');
    }
};

// Thêm Redirect Mới
exports.postAddRedirect = async (req, res) => {
    try {
        let { fromPath, toPath } = req.body;

        // Chuẩn hóa dữ liệu: Đảm bảo luôn bắt đầu bằng dấu /
        if (!fromPath.startsWith('/')) fromPath = '/' + fromPath;
        if (!toPath.startsWith('/')) toPath = '/' + toPath;

        // Chống lỗi trùng lặp (nếu đã có link cũ này rồi thì update link mới)
        await Redirect.findOneAndUpdate(
            { fromPath: fromPath },
            { toPath: toPath, isActive: true },
            { upsert: true, new: true }
        );

        res.redirect('/admin/seo/redirects');
    } catch (err) {
        console.error("Lỗi thêm Redirect:", err);
        res.status(500).send("Lỗi Server: " + err.message);
    }
};

// Xóa Redirect
exports.postDeleteRedirect = async (req, res) => {
    try {
        const { id } = req.body;
        await Redirect.findByIdAndDelete(id);
        res.redirect('/admin/seo/redirects');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/seo/redirects');
    }
};

// ============================================================
// 2. QUẢN LÝ SCHEMA GLOBAL (ORGANIZATION / PERSON)
// ============================================================

exports.getGlobalSchema = async (req, res) => {
    try {
        // Tìm cấu hình trong bảng Setting
        let settings = await Setting.findOne({ key: 'global_settings' });
        
        // Nếu chưa có (lần đầu cài đặt) thì tạo mới object rỗng để tránh lỗi EJS
        if (!settings) {
            settings = await new Setting({ key: 'global_settings' }).save();
        }

        res.render('admin/seo/global-schema', {
            pageTitle: 'Cấu hình Schema Global',
            path: '/admin/seo/schema',
            settings: settings
        });
    } catch (err) {
        console.error("❌ Lỗi Get Global Schema:", err);
        res.redirect('/admin');
    }
};

exports.postGlobalSchema = async (req, res) => {
    try {
        let { schemaType, orgLogo, socialLinksInput } = req.body;
        
        // Chuyển dữ liệu từ Textarea thành Mảng (mỗi dòng 1 link)
        const socialLinks = socialLinksInput 
            ? socialLinksInput.split('\n').map(link => link.trim()).filter(link => link !== '') 
            : [];

        await Setting.findOneAndUpdate(
            { key: 'global_settings' },
            { 
                schemaType, 
                orgLogo, 
                socialLinks 
            },
            { new: true, upsert: true }
        );

        res.redirect('/admin/seo/schema');
    } catch (err) {
        console.error("❌ Lỗi Post Global Schema:", err);
        res.status(500).send("Lỗi cập nhật Schema");
    }
};

// ============================================================
// 3. TẠO SITEMAP XML TỰ ĐỘNG (DYNAMICS SITEMAP)
// ============================================================

exports.generateSitemap = async (req, res) => {
    try {
        // Thay domain của bạn vào đây
        const domain = "https://webbanhang-es90.onrender.com";
        
        // 1. Lấy dữ liệu từ Database (Chỉ lấy slug và updatedAt)
        // Dùng lean() để truy vấn nhanh hơn vì chỉ cần đọc dữ liệu
        const [products, posts, pages] = await Promise.all([
            Product.find({ isActive: true }).select('slug updatedAt').lean(),
            Post.find({ isActive: true }).select('slug updatedAt').lean(),
            Page.find({ isActive: true }).select('slug updatedAt').lean()
        ]);

        // 2. Khởi tạo cấu trúc XML chuẩn của Google
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // --- Trang chủ ---
        xml += `
  <url>
    <loc>${domain}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

        // --- Danh sách Sản phẩm ---
        products.forEach(p => {
            xml += `
  <url>
    <loc>${domain}/products/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // --- Danh sách Bài viết (Blog) ---
        posts.forEach(post => {
            xml += `
  <url>
    <loc>${domain}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // --- Danh sách Trang tĩnh ---
        pages.forEach(pg => {
            xml += `
  <url>
    <loc>${domain}/p/${pg.slug}</loc>
    <lastmod>${pg.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
        });

        xml += `\n</urlset>`;

        // 3. Thiết lập Header để trình duyệt và Google hiểu đây là file XML
        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);

    } catch (err) {
        console.error("❌ Lỗi tạo Sitemap XML:", err);
        res.status(500).end();
    }
};

// Hiển thị trang quản lý Sitemap trong Admin
exports.getSitemapPage = async (req, res) => {
    try {
        const domain = "https://webbanhang-es90.onrender.com";
        
        // Đếm số lượng link để hiển thị báo cáo nhỏ
        const [prodCount, postCount, pageCount] = await Promise.all([
            Product.countDocuments({ isActive: true }),
            Post.countDocuments({ isActive: true }),
            Page.countDocuments({ isActive: true })
        ]);

        res.render('admin/seo/sitemap', {
            pageTitle: 'Cấu hình Sitemap XML',
            path: '/admin/seo/sitemap',
            domain: domain,
            stats: {
                total: prodCount + postCount + pageCount + 1, // +1 là trang chủ
                products: prodCount,
                posts: postCount,
                pages: pageCount
            }
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

// 1. Hiển thị trang cấu hình trong Admin
exports.getRobotsSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'global_settings' });
        if (!settings) settings = await new Setting({ key: 'global_settings' }).save();

        res.render('admin/seo/robots', {
            pageTitle: 'Cấu hình Robots.txt',
            path: '/admin/seo/robots',
            settings: settings
        });
    } catch (err) {
        res.redirect('/admin');
    }
};

// 2. Lưu đoạn code Robots vào Database
exports.postRobotsSettings = async (req, res) => {
    try {
        const { robotsContent } = req.body;
        await Setting.findOneAndUpdate(
            { key: 'global_settings' },
            { robotsContent: robotsContent },
            { upsert: true }
        );
        res.redirect('/admin/seo/robots');
    } catch (err) {
        res.status(500).send("Lỗi cập nhật");
    }
};

// 3. Xuất file Robots.txt ra cho Google (Public)
exports.generateRobotsText = async (req, res) => {
    try {
        const settings = await Setting.findOne({ key: 'global_settings' }).lean();
        const content = settings?.robotsContent || "User-agent: *\nDisallow: /admin/";
        
        res.type('text/plain'); // Ép kiểu dữ liệu trả về là văn bản thuần
        res.send(content);
    } catch (err) {
        res.status(500).end();
    }
};

// 1. Hiển thị danh sách lỗi 404
exports.getMonitor404 = async (req, res) => {
    try {
        // Lấy các lỗi mới nhất hoặc bị nhiều nhất
        const logs = await Monitor404.find().sort({ lastAccessed: -1 });
        
        res.render('admin/seo/404-monitor', {
            pageTitle: 'Theo dõi lỗi 404',
            path: '/admin/seo/404-monitor',
            logs: logs
        });
    } catch (err) {
        res.redirect('/admin');
    }
};

// 2. Xóa log 404
exports.postDelete404 = async (req, res) => {
    try {
        await Monitor404.findByIdAndDelete(req.body.id);
        res.redirect('/admin/seo/404-monitor');
    } catch (err) {
        res.redirect('/admin/seo/404-monitor');
    }
};