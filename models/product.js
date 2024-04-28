const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        unique: false

    },
    buying_price: {
        type: Number,
        required: true,
        unique: false
    },
    selling_price: {
        type: Number,
        required: true,
        unique: false
    },
    discount: {
        type: Number,
        required: false
    },

    primary_image: {
        type: String,
        required: false,
        unique: false
    },
    category_image: {
        type: String,
        required: false,
        unique: false
    },
    parent_category: {
        type: String,
        required: false,
        unique: false
    },

    sub_category: {
        type: String,
        required: false,
        unique: false
    },
    category: {
        type: String,
        required: false,
        unique: false
    },
    secondary_image: {
        type: [String],
        required: true,
        unique: false
    },
    description: {
        type: String,
        required: false,
        unique: false
    },

    product_type: {
        type: String,
        required: false,
        unique: false
    },
    colorVariants: {
        type: [String],
        required: false,
        unique: false
    },
    sizeVariants: {
        type: [String],
        required: false,
        unique: false
    },
    total_qty: {
        type: Number,
        required: false,
        unique: false
    },
    product_code: {
        type: Number,
        required: false,
        unique: false
    },
    date: {
        type: String,
        required: false,
        unique: false
    },

    old_price: {
        type: Number,
        required: false,
        unique: false
    },
    price: {
        type: Number,
        required: false,
        unique: false
    },
    sku_code: {
        type: Number,
        required: false,
        unique: false
    },
    upc_code: {
        type: Number,
        required: false,
        unique: false
    },
    brand: {
        type: String,
        required: false,
        unique: false
    },
    color: {
        type: String,
        required: false,
        unique: false
    },

    seller_id: {
        type: mongoose.Schema.ObjectId,
        required: false,
        unique: false
    },

    status: {
        type: String,
        required: false,
        unique: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;


