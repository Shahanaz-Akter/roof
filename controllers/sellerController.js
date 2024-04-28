const asyncHandler = require('express-async-handler');
const bodyParser = require('body-parser');

const parentCategory = require('../models/parentcategory');
const subCategory = require('../models/subcategory');
const Category = require('../models/category');
const Product = require('../models/Product');
const Seller = require('../models/seller');
const sellerOrder = require('../models/sellerorder');
let requests = require('request');


const addSeller1 = async (req, res) => {
    let err = req.query.error;
    res.render('seller/add_seller.ejs', { err });
}
const postSeller = async (req, res) => {
    let { store_name, seller_user_name, phone, business_type, address } = req.body;
    // Check if the mobile number already exists
    const existingSeller = await Seller.findOne({ phone: phone });
    if (existingSeller) {
        // If the mobile number already exists, redirect with an error message
        return res.redirect('/seller/add_seller?error=This phone Number is Already Exists. Please provide unique Number!');
    }
    let seller = await Seller.create({
        'store_name': store_name,
        'seller_user_name': seller_user_name,
        'phone': phone,
        'business_type': business_type,
        'address': address,
        'seller_image': req.files['seller_picture'] ? "/front_assets/new_images/" + req.files['seller_picture'][0].filename : null,
        'otp_num': 1234,
    });
    if (seller) {
        res.redirect('/seller/add_seller_list');
    }
    else {
        res.redirect('/seller/add_seller');

    }
}

const addSellerList = async (req, res) => {
    let sellers = await Seller.find({});
    res.render('seller/add_seller_list.ejs', { sellers });
}

const sellerProductList = async (req, res) => {
    let products = await Product.find({ status: 'not approved' });
    res.render('seller/seller_product_list.ejs', { products });
}

// Single Seller 
const sellerRegister = async (req, res) => {
    res.render('seller/seller_register.ejs');
}

const numberVerification = async (req, res) => {
    let err = req.query.message;

    res.render('seller/number_verification.ejs', { err });
}
const postNumberVerification = async (req, res) => {
    let { phone } = req.body;
    if (phone.length !== 11) {
        return res.redirect(`/seller/number_verification?message=${encodeURIComponent('Phone number must be 11 digits')}`);
    }

    let seller_present = await Seller.findOne({ phone });
    // seller_present.phone sghoukld be unique and should be must be 11 digits 
    // set up this validation 
    //if there is any validation error then redirect  previous route with this error ,message

    // console.log('seller_present: ', seller_present);

    if (seller_present) {
        req.session.userId = seller_present._id;
        console.log(req.session.userId);
        res.redirect('/seller/app_home');
    }
    else {
        // Generate OTP start
        // const newOtp = Math.floor(Math.random() * (9999 - 1234 + 1) + 1234);
        const newOtp = 1234;
        // Access environment variables
        const smsApiUrl = 'https://api.sms.net.bd/sendsms';
        const smsApiKey = '0k4pEM8Atavv3W1c5af3vEYUB99j9kCZ5rYb84ZE';

        // Send OTP via SMS
        // Need to use this 3 line code for sending otp to the requested number
        // var options = {
        //     'method': 'POST',
        //     'url': smsApiUrl,
        //     formData: {
        //         'api_key': smsApiKey,
        //         msg: `Your Ztrios OTP Number: ${newOtp}`,
        //         to: phone,
        //     }
        // };

        // requests(options, function (error, response) {
        //     if (error) throw new Error(error);
        //     console.log(response.body);
        // });

        // console.log('SMS API Response:', options.data);

        // Generate OTP end

        let seller = await Seller.create({
            'phone': phone,
            'store_name': '',
            'seller_user_name': '',
            'business_type': '',
            'seller_image': '',
            'address': '',
            'otp_num': newOtp,
        });
        console.log('seller: ', seller);
        req.session.sellerId = seller._id;
        let seller_id = seller._id;
        let phn = phone.slice(0, 3);
        res.render('seller/verification_code.ejs', { seller_id, phn });
    }

}

const postVerificationCode = async (req, res) => {
    // console.log('hhhhhhh');
    let { num1, num2, num3, num4 } = req.body;
    let num = num1 + num2 + num3 + num4;
    // console.log(num);
    let param_id = req.params.id;
    console.log('param_id: ', param_id);

    let record = await Seller.findById(param_id);
    // console.log('record: ', record);

    if (record && record.otp_num == num) {

        res.render('seller/information.ejs', { param_id });
    }
    else {
        previousUrl = req.get('referer');
        res.redirect(previousUrl);
    }

}

const postInformation = async (req, res) => {
    try {
        let { store_name, seller_user_name, business_type, address } = req.body;
        // console.log(store_name, seller_user_name, business_type, address);
        let id = req.params.id;

        let update = await Seller.updateOne(
            { _id: id }, // Filter based on the _id field
            {
                $set: {
                    store_name: store_name,
                    seller_user_name: seller_user_name,
                    business_type: business_type,
                    seller_image: req.files['seller_picture'] ? '/front_assets/new_images/' + req.files['seller_picture'][0].filename : null,
                    address: address
                }
            }
        );

        console.log('update seller: ', update);

        if (update) {
            // req.session.sellerId = id;
            let seller_orders = await sellerOrder.find({ seller_id: req.session.userId }).sort({ updatedAt: -1 });

            res.render('seller/app_home.ejs', { seller_orders });
        }

    } catch (error) {
        // Handle any errors that might occur during update
        console.error("Error updating record:", error);
        res.status(500).send("Error updating record");
    }
}

const productUpload = async (req, res) => {
    res.render('seller/product_upload.ejs');
}

const postProductUpload = async (req, res) => {
    let { product_name, buying_price, selling_price, discount, category, stock, description } = req.body;
    let images = req.files['product_img'];
    // console.log(images);
    let sec_img = [];
    if (images) {
        images.forEach(img => {
            sec_img.push('/front_assets/new_images/' + img.filename);
        });
    }

    // console.log('sec_img :', sec_img);
    //latest parent categories uopc code
    const latestCategory = await parentCategory.findOne({}).sort({ createdAt: -1 });

    let latest_upc_code = parseInt(latestCategory.upc_code);
    // latest_upc_code = isNaN(latest_upc_code) ? 0 : latest_upc_code;
    latest_upc_code++;
    // Ensure the UPC code is formatted as a 4-digit string with leading zeros
    let upc_code = latest_upc_code.toString().padStart(4, '0');

    let timestamp = Date.now().toString(); // Get the current timestamp as a string
    let sku_code = upc_code + timestamp;


    let p = {
        'seller_id': req.session.sellerId,
        'sku_code': sku_code ? sku_code : null,
        'upc_code': upc_code ? upc_code : null,
        'name': product_name ? product_name : null,
        'brand': null,
        'color': null,
        'parent_category': null,
        'sub_category': null,
        'category': category ? category : null,
        'product_type': null,
        'buying_price': buying_price,
        'selling_price': selling_price ? selling_price : null,
        'discount': discount ? discount : null,
        'date': null,
        'total_qty': stock,
        'price': null,
        'category_image': null,
        'old_price': null,
        'primary_image': sec_img ? sec_img[0] : null,
        'secondary_image': sec_img ? sec_img : null,
        'description': description ? description : null,
        'colorVariants': null,
        'sizeVariants': null,
        'product_code': Math.floor(Math.random() * 1000) + 1,
        'status': 'not approved'


    }
    let record = await Product.create(p);
    // console.log(record);

    if (record) {
        let product_list = await Product.find({ seller_id: req.session.sellerId });
        // console.log(req.session.sellerId);
        console.log('product_list: ', product_list);
        res.render('seller/product_list.ejs', { product_list });
    }
}

const sellerAddProduct = async (req, res) => {
    res.render('seller/seller_register.ejs');
}

const postSellerAddProduct = async (req, res) => {
    console.log('Hello');
}

const appHome = async (req, res) => {
    // let seller_orders= await sellerOrder.find({seller_id:req.session.userId});
    let seller_orders = await sellerOrder.find({ seller_id: req.session.userId }).sort({ updatedAt: -1 });
    let seller_order1 = await sellerOrder.aggregate([
        {
            $match: { seller_id: req.session.userId }
        },
        {
            $sort: { updatedAt: -1 }
        },
        {
            $lookup: {
                from: "customers", // Name of the customers collection
                localField: "customer_id",
                foreignField: "_id",
                as: "customer_info"
            }
        },
        {
            $addFields: {
                customer: { $arrayElemAt: ["$customer_info", 0] }
            }
        },
        {
            $project: {
                customer_info: 0 // Exclude the customer_info array from the output
            }
        }
    ]);

    console.log(seller_orders);
    console.log(seller_order1);
    // 01836549239
    console.log(req.session.userId);

    res.render('seller/app_home.ejs', { seller_orders });
}
const sellerPayment = async (req, res) => {
    res.render('seller/seller_payment.ejs');
}
const orderList = async (req, res) => {
    res.render('seller/order_list.ejs');
}

const productList = async (req, res) => {
    let product_list = await Product.find({ seller_id: req.session.userId });
    // console.log(product_list);  
    res.render('seller/product_list.ejs', { product_list });
}

// sellerRegister, numberVerification, verificationCode, sellerInformation, sellerAddProduct, sellerPayment,orderList
module.exports = {
    addSeller1, postSeller, addSellerList, sellerProductList, sellerRegister, numberVerification, postVerificationCode, sellerAddProduct, productUpload, postProductUpload, sellerPayment, orderList, postNumberVerification, postInformation, postSellerAddProduct, appHome, productList
}