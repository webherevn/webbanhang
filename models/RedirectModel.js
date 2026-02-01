const mongoose = require('mongoose');

const redirectSchema = new mongoose.Schema({
    fromPath: { 
        type: String, 
        required: true, 
        unique: true, // Vừa đảm bảo không trùng, vừa tự động tạo Index
        trim: true 
    },
    toPath: { 
        type: String, 
        required: true, 
        trim: true 
    },
    type: { type: Number, default: 301 }, 
    isActive: { type: Boolean, default: true }
}, { timestamps: true });



module.exports = mongoose.model('Redirect', redirectSchema);