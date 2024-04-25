const asyncHandler = require('express-async-handler');
const bodyParser = require('body-parser');

let parentCategory = require('../models/parentcategory');
let subCategory = require('../models/subcategory');
let Category = require('../models/category');
let Product = require('../models/Product');
let Customer = require('../models/customer');
let sellerOrder = require('../models/sellerorder');
let logoBanner = require('../models/logobanner');

const Order = require('../models/order');

const { ObjectId } = require('mongodb'); // if using MongoDB native driver


const addCustomer = async (req, res) => {

    res.render('customer/add_customer.ejs');
}

const postCustomer = async (req, res) => {
    try {

        let { customer_name, birth, mobile, email, country, address, zip_code, date, password } = req.body;
        let customer = await Customer.create({
            customer_name: customer_name,
            mobile: mobile,
            email: email,
            country: country,
            address: address,
            zip_code: zip_code,
            date: date,
            dob: birth,
            customer_id: Math.floor(Math.random() * 100) + 1,
            otp_num: 1234,
            password: password

        });
        // console.log('customer: ', customer);

        if (customer) {
            res.redirect('/customer/customer_list');
        }
    }
    catch (err) {
        console.log(err);
        res.redirect('/customer/add_customer');

    }
}

const customerList = async (req, res) => {
    let customers = await Customer.find({});
    // console.log(customers);
    res.render('customer/customer_list.ejs', { customers });
}

const editCustomer = async (req, res) => {
    let id = req.params.id;
    let customers = await Customer.findOne({ _id: id });

    res.render('customer/edit_customer.ejs', { customers });

}
const postEditCustomer = async (req, res) => {
    try {
        let { customer_name, birth, mobile, email, country, address, zip_code, date, otp_num, password } = req.body;
        let id = req.params.id;
        let customers = await Customer.findOne({ _id: id });

        // Update the customer document with provided fields or keep existing values
        customers.customer_name = customer_name || customers.customer_name;
        customers.mobile = mobile || customers.mobile;
        customers.email = email || customers.email;
        customers.country = country || customers.country;
        customers.address = address || customers.address;
        customers.zip_code = zip_code || customers.zip_code;
        customers.date = date || customers.date;
        customers.dob = birth || customers.dob;
        customers.otp_num = otp_num || customers.otp_num;
        customers.otp_num = password || customers.password;

        // Assuming these fields are updated in every edit
        customers.customer_id = customers.customer_id;

        // Save the updated customer
        await customers.save();

        res.redirect('/customer/customer_list');

    }
    catch (err) {
        console.log(err);
    }

}

const deleteCustomer = async (req, res) => {
    let id = req.params.id;
    await Customer.deleteOne({ _id: id });
    res.redirect('/customer/customer_list');
}

const userLogin = async (req, res) => {
    let parent = await parentCategory.aggregate([
        {
            $lookup: {
                from: 'subcategories',
                localField: '_id',
                foreignField: 'parent_category_id',
                as: 'subcategories'
            }
        },
        {
            $unwind: "$subcategories" // Unwind the subcategories array
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'subcategories._id',
                foreignField: 'sub_category_id',
                as: 'subcategories.categories'
            }
        },
        {
            $group: {
                _id: '$_id',
                parent_category: { $first: '$parent_category' },
                upc_code: { $first: '$upc_code' },
                category_image: { $first: '$category_image' },
                createdAt: { $first: '$createdAt' },
                __v: { $first: '$__v' },
                subcategories: { $push: '$subcategories' } // Push subcategories into an array
            }
        }
    ]);
    let error = req.query.error ? req.query.error : undefined;
    console.log('error:', error);


    let logo, banner;
    let oneRecord = await logoBanner.find({}); //Ihis all time returns one record
    if (oneRecord.length > 0) {
        logo = oneRecord[0].logo_image;
        banner = oneRecord[0].banner_image;
    }

    res.render('customer/user_login.ejs', { parent, error, logo, banner });
}

const userRegister = async (req, res) => {
    let parent = await parentCategory.aggregate([
        {
            $lookup: {
                from: 'subcategories',
                localField: '_id',
                foreignField: 'parent_category_id',
                as: 'subcategories'
            }
        },
        {
            $unwind: "$subcategories" // Unwind the subcategories array
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'subcategories._id',
                foreignField: 'sub_category_id',
                as: 'subcategories.categories'
            }
        },
        {
            $group: {
                _id: '$_id',
                parent_category: { $first: '$parent_category' },
                upc_code: { $first: '$upc_code' },
                category_image: { $first: '$category_image' },
                createdAt: { $first: '$createdAt' },
                __v: { $first: '$__v' },
                subcategories: { $push: '$subcategories' } // Push subcategories into an array
            }
        }
    ]);


    let logo, banner;
    let oneRecord = await logoBanner.find({}); //Ihis all time returns one record
    if (oneRecord.length > 0) {
        logo = oneRecord[0].logo_image;
        banner = oneRecord[0].banner_image;
    }
    res.render('customer/user_register.ejs', { parent, logo, banner });
}
const postRegisterCustomer = async (req, res) => {
    try {
        console.log('post Register Customer');
        let { name, birth, mobile, email, country, address, zip_code, date, password } = req.body;

        let customer = await Customer.create({
            customer_name: name,
            mobile: mobile,
            email: email,
            country: country,
            address: address,
            zip_code: zip_code,
            date: date,
            dob: birth,
            customer_id: Math.floor(Math.random() * 100) + 1,
            otp_num: 1234,
            password: password

        });
        req.session.auth_user = customer;
        res.redirect('/customer/user_login');
    }
    catch (err) {
        console.log(err);
    }
}

const postLoginCustomer = async (req, res) => {
    try {
        let { mobile } = req.body;

        let customer = await Customer.findOne({ mobile: mobile });
        // console.log(customer);

        if (customer) {
            req.session.auth_user = customer;
            // console.log('url: ', req.session.details_route);
            res.redirect(req.session.details_route);
            // Clearing the session route
            // delete req.session.details_route;
        }
        else {
            let referer = req.headers.referer; //previous page
            if (referer && referer.includes('?error=')) {
                // If the referer already contains an error query parameter, redirect without appending another one
                res.redirect(referer);
            } else {
                // Append the error message to the referer URL
                referer = referer ? referer + '?error=Mobile number is not found' : '/';
                res.redirect(referer);
            }

        }

    }
    catch (err) {
        console.log(err);
    }
}

const addCart = async (req, res) => {
    try {
        let error = req.query.error;
        console.log('Add cart method');
        let parent = await parentCategory.aggregate([
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: 'parent_category_id',
                    as: 'subcategories'
                }
            },
            {
                $unwind: "$subcategories" // Unwind the subcategories array
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'subcategories._id',
                    foreignField: 'sub_category_id',
                    as: 'subcategories.categories'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    parent_category: { $first: '$parent_category' },
                    upc_code: { $first: '$upc_code' },
                    category_image: { $first: '$category_image' },
                    createdAt: { $first: '$createdAt' },
                    __v: { $first: '$__v' },
                    subcategories: { $push: '$subcategories' } // Push subcategories into an array
                }
            }
        ]);

        let product_id = req.params.id;
        let single_product = await Product.findOne({ _id: new ObjectId(product_id) });
        // console.log(single_product);

        //initialize product array based on session array
        let product_arr = req.session.products ? req.session.products : [];
        let dis = single_product.selling_price - (single_product.selling_price * single_product.discount / 100);
        // console.log("dis: ", dis);
        // console.log(typeof (dis));

        let modified_product = {
            'id': single_product._id,
            'name': single_product.name,
            'primary_image': single_product.primary_image,
            'actual_price': single_product.selling_price,
            'selling_price': single_product.discount ? Math.round(dis) : single_product.selling_price,
            'qty': 1,
            'price_without_discount': Math.round(dis),
            'discount': single_product.discount,
            'seller_id': single_product.seller_id,
        }

        //single matched product will store this array object
        let matched_product = await product_arr.filter(p => { return p.id == single_product._id });
        // console.log('matched_product: ', matched_product);

        if (matched_product.length == 0) { //if not matched then session product will be stored
            product_arr.push(modified_product);
            req.session.products = product_arr;
        }

        if (req.session.auth_user) {
            res.redirect('/product/cart');
        }
        else {
            res.redirect('/customer/user_login');
        }

    }
    catch (e) {
        console.log(e.message);
    }
}

const deleteSessionProduct = async (req, res) => {
    let id = req.body.id;
    let sessionProduct = req.session.products;
    req.session.products = sessionProduct.filter(element => element.id !== id); //update session without existing id
    res.send({
        success: true
    })

}

const productIncDec = async (req, res) => {
    let qty, price_without_discount, subT = 0;
    let id = req.body.product_id;
    let reason = req.body.reason;
    let cart = req.session.products;

    await cart.forEach(element => {
        if (element.id == id) {
            if (reason == "plus") {
                element.qty = element.qty + 1;
                element.price_without_discount = element.qty * element.selling_price;
            }
            if (reason == "minus") {
                if (element.qty == 1) {
                    element.qty = element.qty;
                    element.price_without_discount = element.price_without_discount;
                }
                else {
                    element.qty = element.qty - 1;
                    element.price_without_discount = element.price_without_discount - element.selling_price;
                }

            }
            qty = element.qty;
            price_without_discount = element.price_without_discount;
        }
    });

    req.session.products = cart;
    // console.log('cart_products ', req.session.products);

    // adding sub total from all session inc dec products
    cart.forEach(ele => {
        subT = subT + ele.price_without_discount;
    });

    console.log('Sub Total: ', subT);
    res.send({
        success: true,
        locals: { session: req.session },
        qty: qty,
        price_without_discount: price_without_discount,
        sub_total: subT
    })
}

const postOrder = async (req, res) => {
    console.log('post Order');
    let subT = 0;
    let { address, delivery } = req.body;
    // console.log('Address: ', address);
    console.log('Delivery: ', delivery);

    let session_products_list = req.session.products;
    console.log("Session Array: ", session_products_list);

    session_products_list.forEach(ele => {
        subT = subT + ele.price_without_discount;
    });

    try {
        let order = await Order.create({
            address: address,
            delivery: parseInt(delivery),
            products: session_products_list,
            sub_total: subT,
            total_amount: parseInt(delivery) + subT
        });


        //each seller order will be stored in the seller_id table from the session session_products_list array
        session_products_list.forEach(async (pr) => {
            if (pr.seller_id != null) {
                let seller_order = await sellerOrder.create({
                    seller_id: pr.seller_id,
                    product_id: pr._id,
                    order_id: order._id,
                    qty: pr.qty,
                    primary_image: pr.primary_image,
                    actual_price: pr.actual_price,
                    name: pr.name,
                    discount: pr.discount,
                    customer_id: req.session.auth_user._id
                });
            }

        });

        if (order) {
            req.session.products = [];
            res.redirect('/');

        }
    }
    catch (e) {
        console.log(e.message);
    }
}


const ses = (req, res) => {
    console.log(req.session.auth_user);
    res.send(req.session.products);

}
const addOrder = async (req, res) => {

    res.render('order/add_order.ejs');
}
const orderList = async (req, res) => {

    let orders = await Order.find({});
    res.render('order/order_list.ejs', { orders });
}
module.exports = { addOrder, orderList, ses, deleteSessionProduct, postOrder, addCustomer, postCustomer, postEditCustomer, customerList, editCustomer, deleteCustomer, userLogin, userRegister, addCart, postRegisterCustomer, postLoginCustomer, productIncDec }


