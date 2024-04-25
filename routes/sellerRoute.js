const express = require('express');
const router = express.Router();
const upload = require('../multer');


const { addSeller1, postSeller, addSellerList, sellerProductList, sellerRegister, numberVerification, postVerificationCode, sellerAddProduct, productUpload, postProductUpload, sellerPayment, orderList, postNumberVerification, postInformation, postSellerAddProduct, appHome, productList } = require('../controllers/sellerController');

// admin seller management 
router.get('/add_seller', addSeller1);
router.post('/post_seller', upload.fields([{ name: 'seller_picture', maxCount: 1 }]), postSeller);
router.get('/add_seller_list', addSellerList);
router.get('/seller_product_list', sellerProductList);

//Specific seller management 
router.get('/seller_register', sellerRegister);

router.get('/number_verification', numberVerification);
router.post('/post_number_verification', postNumberVerification);
router.post('/post_verification_code/:id', postVerificationCode);

router.post('/post_information/:id', upload.fields([{ name: 'seller_picture', maxCount: 1 },]), postInformation);

router.get('/product_upload', productUpload);
router.post('/post_product_upload', upload.fields([{ name: 'product_img', maxCount: Infinity },]), postProductUpload);

router.get('/seller_add_product', sellerAddProduct);
router.post('/post_seller_add_product', postSellerAddProduct);

router.get('/app_home', appHome);


// router.get('/seller_product_list', sellerProductList); //same as admin view
router.get('/seller_payment', sellerPayment);
router.get('/order_list', orderList);

router.get('/product_list', productList);


module.exports = router;