
const express = require('express');
const router = express.Router();

const { register, login, postLogin, postRegister, postForgetPassword, changePassword, postChangePassword } = require('../controllers/authController');
router.get('/register', register);
router.post('/post_register', postRegister);

router.get('/login', login);
router.post('/post_login', postLogin);

router.post('/post_forget_password', postForgetPassword);
router.get('/change_password/:id', changePassword);
router.post('/post_change_password/:id', postChangePassword);



module.exports = router;