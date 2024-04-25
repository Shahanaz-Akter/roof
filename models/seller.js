
const mongoose = require('mongoose')

const Sellerschema = new mongoose.Schema({

    store_name: {
        type: String,
        required: false,
        unique: false
    },
    seller_user_name: {
        type: String,
        required: false,
        unique: false
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },
    business_type: {
        type: String,
        required: false,
        unique: false
    },
    seller_image: {
        type: String,
        required: false,
        unique: false
    },

    address: {
        type: String,
        required: false,
        unique: false
    },


    otp_num: {
        type: String,
        required: false,
        unique: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

});

let Seller = mongoose.model('Seller', Sellerschema);

module.exports = Seller;