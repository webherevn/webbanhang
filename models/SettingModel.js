const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: { type: String, default: 'global_settings' }, // Để dễ dàng tìm kiếm
    headerScripts: { type: String, default: '' },     // Chèn trước </head>
    bodyScripts: { type: String, default: '' },       // Chèn ngay sau <body>
    footerScripts: { type: String, default: '' },     // Chèn trước </body>
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Setting', settingSchema);