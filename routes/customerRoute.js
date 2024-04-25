const express = require('express');
const router = express.Router();
// const multer = require('multer');
const { addOrder, orderList, ses, deleteSessionProduct, postOrder, userLogin, userRegister, addCart, addCustomer, postCustomer, customerList, editCustomer, postEditCustomer, deleteCustomer, postRegisterCustomer, postLoginCustomer, productIncDec } = require('../controllers/customerController');

router.get('/ses', ses);

router.get('/user_login', userLogin);
router.get('/user_register', userRegister);

router.get('/add_cart/:id', addCart);
router.post('/delete_session_product', deleteSessionProduct);
router.post('/post_order', postOrder);

router.get('/add_customer', addCustomer);
router.get('/customer_list', customerList);

router.post('/post_customer', postCustomer);
router.get('/edit_customer/:id', editCustomer);
router.post('/post_edit_customer/:id', postEditCustomer);

router.get('/delete_customer/:id', deleteCustomer);

router.post('/post_register_customer', postRegisterCustomer);
router.post('/post_login_customer', postLoginCustomer);


router.get('/add_order', addOrder);
router.get('/order_list', orderList);


router.post('/product_increment', productIncDec);


module.exports = router;