// const router = require('express').Router();
const jwt = require('jsonwebtoken');

// @route   POST /api/auth
// @desc    Authenticate user
// @access  Public

// router.post('/', async (req, res) => {
    
// })

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if(!token) {
        return res.status(403).json({
            message: 'Access denied',
            isAuth: false,
        })
    };

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded;
        next();     // run next step after decode
        // res.status(200).json({
        //     user,
        //     isAuth: true,
        // })
    } catch (error) {
        res.status(401).json({
            message: 'Invalid token',
            isAuth: false,
        })
    }
};
