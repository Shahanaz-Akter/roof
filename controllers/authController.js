const User = require('../models/user');
let parentCategory = require('../models/parentcategory');
let subCategory = require('../models/subcategory');
let Category = require('../models/category');
const Product = require('../models/Product');
const Seller = require('../models/seller');
const sellerOrder = require('../models/sellerorder');
const bcrypt = require('bcrypt');

const register = async (req, res, next) => {
    res.render('user/admin_panel/authentication_register.ejs');
}


const postRegister = async (req, res) => {
    try {

        let { user_name, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

        console.log("User Record:", user_name, email, password, role);

        let admin_user = await User.create({
            user_name: user_name,
            email: email,
            password: password,
            hased_password: hashedPassword,
            role: role,
        });

        req.session.userr = admin_user;
        // console.log('admin_user: ', admin_user);
        if (admin_user) {
            res.redirect('/master');
        }

    } catch (err) {
        res.status(500).json({
            'message': 'Something went wrong',
            'error': err
        });
    }
}

const login = async (req, res, next) => {
    let error1 = req.query.error;
    let err1 = req.query.err;
    res.render('user/admin_panel/authentication_login.ejs', { error: error1, err: err1 });
}
const postLogin = async (req, res, next) => {

    const { email, password } = req.body;
    let user = await User.findOne({ email: email });
    console.log(user);
    if (user) {
        req.session.userr = user;
        if (user.email == email && user.password == password) {
            res.redirect('/master');
        }
        else {
            let msg = encodeURIComponent('Invalid User');
            res.redirect(`/auth/login/?error=${msg}`);
        }
    }
    else {
        let msg = encodeURIComponent('User Not Found');
        res.redirect(`/auth/login/?error=${msg}`);
    }
}

const postForgetPassword = async (req, res, next) => {

    const { email, } = req.body;
    let user = await User.findOne({ email: email });

    if (user) {
        console.log('valid email');
        res.redirect(`/auth/change_password/${user.id}`);

    }
    else {
        let errorMsg = encodeURIComponent('Invalid Email');
        res.redirect(`/auth/login/?err=${errorMsg}`);
    }
}
const changePassword = async (req, res, next) => {
    let params_id = req.params.id;
    res.render('user/admin_panel/change_pass.ejs', { id: params_id });

}
const postChangePassword = async (req, res, next) => {

    const { password, confirm_password } = req.body;
    let userId = req.params.id;
    let hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    if (password === confirm_password) {
        let user = await User.updateOne(
            { _id: userId }, // Filter to find the user by ID
            { $set: { password: password, hased_password: hashedPassword } } // Update operation
        );

        if (user) {
            console.log('Password updated successfully:', user);
            res.redirect('/master');
        }
    }
    else {
        res.redirect('/auth/login');
    }

}




module.exports = { register, login, postLogin, postRegister, postForgetPassword, changePassword, postChangePassword };