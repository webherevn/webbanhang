const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
    key: { type: String, default: 'theme_settings' }, // Khóa duy nhất
    logo: String,
    favicon: String,
    // Top Bar
    topBarShow: { type: Boolean, default: true },
    topBarText: String,
    topBarBgColor: { type: String, default: '#23282d' },
    // Header
    headerLayout: { type: String, default: 'centered' }, // centered, logo-left, v.v.
    headerSticky: { type: Boolean, default: true },
    // Custom HTML
    headerBottomHtml: String,
    customCss: String
}, { timestamps: true });

module.exports = mongoose.model('Theme', themeSchema);