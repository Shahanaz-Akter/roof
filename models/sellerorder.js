// models/User.js
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const sellerorderSchema = new mongoose.Schema({

    seller_id: {
        type: mongoose.Schema.ObjectId,
        required: false,
        unique: false
    },
    product_id: {
        type: mongoose.Schema.ObjectId,
        required: false,
        unique: false
    },
    order_id: {
        type: mongoose.Schema.ObjectId,
        required: false,
        unique: false
    },
    qty: {
        type: Number,
        required: false
    },
    primary_image: {
        type: String,
        required: false
    },
    actual_price: {
        type: Number,
        required: false
    },
    name: {
        type: String,
        required: false
    },
    discount: {
        type: Number,
        required: false
    },
    customer_id: {
        type: mongoose.Schema.ObjectId,
        required: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
});

const sellerOrder = mongoose.model('sellerOrder', sellerorderSchema);

module.exports = sellerOrder;
