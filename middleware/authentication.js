// const authenticateUser = require('../middleware/authentication');
//this variable is applied to check user is authenticated or not between route with session
// req.session.user = saved user record;
//store this user info to the session for checking authenticated user


// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {

    if (req.session.userId) {
        next();
    } else {
        res.status(401).send('You are Not Authenticated User!');
    }
};


module.exports = authenticateUser;
