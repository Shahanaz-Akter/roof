
const mongoose = require('mongoose');

const logoBannerSchema = new mongoose.Schema({


    banner_image: {
        type: [String],
        required: false,
        unique: false,
    },

    logo_image: {
        type: String,
        required: false,
        unique: false,

    },

    createdAt: {
        type: Date,
        default: Date.now
    },
});



module.exports = mongoose.model('logoBanner', logoBannerSchema);

